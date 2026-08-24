import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security.js';

type Provider = 's3' | 'r2' | 'supabase' | 'external' | 'unknown';
type AuditStatus = 'already_s3' | 'ready_to_migrate' | 'broken_reference' | 'needs_review';

interface StorageRef {
  applicationId: string;
  applicantName: string;
  status?: string;
  createdAt?: string;
  field: string;
  provider: Provider;
  statusBucket: AuditStatus;
  value: string;
  key?: string;
  bucket?: string;
  path?: string;
  reason: string;
}

interface BrokenApplicationReport {
  applicationId: string;
  applicantName: string;
  status?: string;
  createdAt?: string;
  brokenRefs: number;
  draftRefs: number;
  uniqueMissingFiles: number;
  fields: string[];
  refs: StorageRef[];
  recommendation: 'request_reupload' | 'review_draft_reference' | 'review_legacy_reference';
}

const FILE_FIELD_HINTS = [
  'url',
  'photo',
  'resume',
  'certificate',
  'transcript',
  'idcard',
  'id_card',
  'house',
  'military',
  'toeic',
  'bank',
  'document',
  'doc',
  'file',
];

const R2_SCAN_PREFIXES = [
  'applicants/',
  'drafts/',
  'photos/',
  'photo/',
  'resume/',
  'transcript/',
  'certificate/',
  'applications/',
] as const;
const MAX_SAMPLE_ITEMS = 25;

function cleanEnv(value?: string): string {
  return value?.replace(/^["']|["']$/g, '').trim() || '';
}

function getS3Client() {
  const accessKeyId = cleanEnv(process.env.AWS_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnv(process.env.AWS_SECRET_ACCESS_KEY);
  const region = cleanEnv(process.env.AWS_REGION) || 'ap-southeast-1';
  if (!accessKeyId || !secretAccessKey) throw new Error('AWS S3 credentials missing.');
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

function getR2Client() {
  const accountId = cleanEnv(process.env.R2_ACCOUNT_ID);
  const accessKeyId = cleanEnv(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnv(process.env.R2_SECRET_ACCESS_KEY);
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${Number((bytes / Math.pow(1024, idx)).toFixed(2))} ${units[idx]}`;
}

function addSample<T>(items: T[], item: T): void {
  if (items.length < MAX_SAMPLE_ITEMS) items.push(item);
}

function isLikelyFileRef(fieldPath: string, value: string): boolean {
  const lowerField = fieldPath.toLowerCase();
  const lowerValue = value.toLowerCase();
  if (lowerValue.startsWith('/api/files?')) return true;
  if (lowerValue.includes('/storage/v1/object/')) return true;
  if (lowerValue.includes('r2.dev') || lowerValue.includes('r2.cloudflarestorage.com')) return true;
  if (lowerValue.includes('amazonaws.com')) return true;
  if (/\.(pdf|jpe?g|png|webp|gif|docx?|xlsx?)(\?|$)/i.test(value)) return true;
  return FILE_FIELD_HINTS.some((hint) => lowerField.includes(hint));
}

function pushStringRefs(target: Array<{ field: string; value: string }>, value: unknown, fieldPath: string): void {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed && isLikelyFileRef(fieldPath, trimmed)) {
      target.push({ field: fieldPath, value: trimmed });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => pushStringRefs(target, item, `${fieldPath}[${idx}]`));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      pushStringRefs(target, nested, fieldPath ? `${fieldPath}.${key}` : key);
    });
  }
}

function decodeProxyUrl(value: string): string {
  try {
    const parsed = new URL(value, 'https://hrbp.local');
    if (parsed.pathname === '/api/files') {
      const proxiedUrl = parsed.searchParams.get('url');
      if (proxiedUrl) return decodeURIComponent(proxiedUrl);
    }
  } catch {}
  return value;
}

function parseStorageRef(rawValue: string): Pick<StorageRef, 'provider' | 'key' | 'bucket' | 'path' | 'reason'> {
  const value = decodeProxyUrl(rawValue);
  const r2PublicDomain = cleanEnv(process.env.R2_PUBLIC_DOMAIN).replace(/\/$/, '');
  const s3Bucket = cleanEnv(process.env.AWS_S3_BUCKET);

  try {
    const parsed = new URL(value, 'https://hrbp.local');
    if (parsed.pathname === '/api/files') {
      const key = parsed.searchParams.get('key');
      return key
        ? { provider: 's3', key, reason: 'DB already uses private S3 proxy URL' }
        : { provider: 'unknown', reason: 'Proxy URL has no key parameter' };
    }

    const host = parsed.hostname.toLowerCase();
    const path = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));

    if (host.includes('amazonaws.com') || (s3Bucket && host.includes(`${s3Bucket}.s3`))) {
      return { provider: 's3', key: path, reason: 'DB points to AWS S3 URL' };
    }

    if (host.includes('r2.dev') || host.includes('r2.cloudflarestorage.com') || (r2PublicDomain && value.startsWith(r2PublicDomain))) {
      return { provider: 'r2', key: path, reason: 'DB points to Cloudflare R2 legacy URL' };
    }

    if (host.includes('supabase.co') && parsed.pathname.includes('/storage/v1/object/')) {
      const marker = '/storage/v1/object/';
      const afterObject = decodeURIComponent(parsed.pathname.slice(parsed.pathname.indexOf(marker) + marker.length));
      const parts = afterObject.replace(/^(public|sign|authenticated)\//, '').split('/').filter(Boolean);
      const bucket = parts.shift();
      return bucket
        ? { provider: 'supabase', bucket, path: parts.join('/'), reason: 'DB points to Supabase Storage legacy URL' }
        : { provider: 'supabase', reason: 'Supabase Storage URL has no bucket/path' };
    }

    if (/^https?:\/\//i.test(value)) return { provider: 'external', reason: 'External URL, not managed storage' };
  } catch {}

  return { provider: 'unknown', reason: 'Unrecognized storage reference format' };
}

async function listObjectKeys(client: S3Client, bucket: string, prefixes: readonly string[]) {
  const keys = new Set<string>();
  let totalBytes = 0;
  let totalObjects = 0;

  for (const prefix of prefixes) {
    let continuationToken: string | undefined;
    do {
      const result = await client.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }));
      for (const item of result.Contents || []) {
        if (!item.Key) continue;
        keys.add(item.Key);
        totalObjects += 1;
        totalBytes += item.Size || 0;
      }
      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);
  }

  return { keys, totalBytes, totalObjects };
}

function classifyRef(parsed: Pick<StorageRef, 'provider' | 'key' | 'bucket' | 'path' | 'reason'>, r2Keys: Set<string>): Pick<StorageRef, 'statusBucket' | 'reason'> {
  if (parsed.provider === 's3') return { statusBucket: 'already_s3', reason: parsed.reason };
  if (parsed.provider === 'r2') {
    if (!parsed.key) return { statusBucket: 'needs_review', reason: 'R2 URL could not be converted to an object key' };
    if (r2Keys.has(parsed.key)) return { statusBucket: 'ready_to_migrate', reason: parsed.key.startsWith('drafts/') ? 'R2 draft object still exists; migrate first' : 'R2 object exists and is eligible for S3 migration' };
    return { statusBucket: 'broken_reference', reason: 'DB points to an R2 object key that was not found in the bucket listing' };
  }
  if (parsed.provider === 'supabase') return { statusBucket: 'needs_review', reason: parsed.path ? 'Supabase Storage ref needs Storage API verification before migration' : parsed.reason };
  return { statusBucket: 'needs_review', reason: parsed.reason };
}

function buildBrokenApplicationReport(refs: StorageRef[]): BrokenApplicationReport[] {
  const grouped = new Map<string, BrokenApplicationReport>();
  const brokenRefs = refs.filter((ref) => ref.statusBucket === 'broken_reference' || ref.key?.startsWith('drafts/') || ref.value.includes('draftId='));

  for (const ref of brokenRefs) {
    const existing = grouped.get(ref.applicationId) || {
      applicationId: ref.applicationId,
      applicantName: ref.applicantName,
      status: ref.status,
      createdAt: ref.createdAt,
      brokenRefs: 0,
      draftRefs: 0,
      uniqueMissingFiles: 0,
      fields: [],
      refs: [],
      recommendation: 'review_legacy_reference' as const,
    };

    if (ref.statusBucket === 'broken_reference') existing.brokenRefs += 1;
    if (ref.key?.startsWith('drafts/') || ref.value.includes('draftId=')) existing.draftRefs += 1;
    if (!existing.fields.includes(ref.field)) existing.fields.push(ref.field);
    existing.refs.push(ref);
    grouped.set(ref.applicationId, existing);
  }

  return Array.from(grouped.values())
    .map((item) => {
      const uniqueMissing = new Set(
        item.refs
          .filter((ref) => ref.statusBucket === 'broken_reference')
          .map((ref) => ref.key || ref.path || ref.value)
      );
      const hasDraft = item.draftRefs > 0;
      const recommendation: BrokenApplicationReport['recommendation'] = hasDraft
        ? 'review_draft_reference'
        : item.brokenRefs > 0
          ? 'request_reupload'
          : 'review_legacy_reference';
      return {
        ...item,
        uniqueMissingFiles: uniqueMissing.size,
        fields: item.fields.sort(),
        refs: item.refs.slice(0, 12),
        recommendation,
      };
    })
    .sort((a, b) => {
      if (b.draftRefs !== a.draftRefs) return b.draftRefs - a.draftRefs;
      if (b.brokenRefs !== a.brokenRefs) return b.brokenRefs - a.brokenRefs;
      return a.applicantName.localeCompare(b.applicantName, 'th');
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireStaff(req, res, ['admin']);
  if (!user) return;

  try {
    const supabase = getAdminSupabase();
    const s3Bucket = cleanEnv(process.env.AWS_S3_BUCKET) || 'hr-recruitment-01';
    const r2Bucket = cleanEnv(process.env.R2_BUCKET_NAME) || 'hrbp-applicants';

    const [s3Inventory, r2Inventory] = await Promise.all([
      listObjectKeys(getS3Client(), s3Bucket, ['applicants/', 'drafts/', 'hrd-documents/', '.trash/']),
      (async () => {
        const r2 = getR2Client();
        if (!r2) return { keys: new Set<string>(), totalBytes: 0, totalObjects: 0, configured: false };
        const inventory = await listObjectKeys(r2, r2Bucket, R2_SCAN_PREFIXES);
        return { ...inventory, configured: true };
      })(),
    ]);

    let applications: any[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name, first_name, last_name, status, created_at, photo_url, resume_url, form_data')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      applications.push(...data);
      if (data.length < pageSize) break;
      page += 1;
    }

    const refs: StorageRef[] = [];
    const uniqueValues = new Set<string>();
    const samples = {
      readyToMigrate: [] as StorageRef[],
      brokenReferences: [] as StorageRef[],
      draftReferences: [] as StorageRef[],
      supabaseLegacy: [] as StorageRef[],
      needsReview: [] as StorageRef[],
    };

    for (const app of applications) {
      const values: Array<{ field: string; value: string }> = [];
      pushStringRefs(values, app.photo_url, 'photo_url');
      pushStringRefs(values, app.resume_url, 'resume_url');
      pushStringRefs(values, app.form_data || {}, 'form_data');

      const applicantName = app.full_name
        || [app.form_data?.prefix || app.form_data?.title, app.first_name || app.form_data?.firstName, app.last_name || app.form_data?.lastName].filter(Boolean).join(' ').trim()
        || 'ไม่ระบุชื่อ';

      for (const item of values) {
        const dedupeKey = `${app.id}:${item.field}:${item.value}`;
        if (uniqueValues.has(dedupeKey)) continue;
        uniqueValues.add(dedupeKey);

        const parsed = parseStorageRef(item.value);
        const classification = classifyRef(parsed, r2Inventory.keys);
        const ref: StorageRef = {
          applicationId: String(app.id),
          applicantName,
          status: app.status,
          createdAt: app.created_at,
          field: item.field,
          provider: parsed.provider,
          statusBucket: classification.statusBucket,
          value: item.value,
          key: parsed.key,
          bucket: parsed.bucket,
          path: parsed.path,
          reason: classification.reason,
        };
        refs.push(ref);

        if (ref.statusBucket === 'ready_to_migrate') addSample(samples.readyToMigrate, ref);
        if (ref.statusBucket === 'broken_reference') addSample(samples.brokenReferences, ref);
        if (ref.key?.startsWith('drafts/') || ref.value.includes('draftId=')) addSample(samples.draftReferences, ref);
        if (ref.provider === 'supabase') addSample(samples.supabaseLegacy, ref);
        if (ref.statusBucket === 'needs_review') addSample(samples.needsReview, ref);
      }
    }

    const byProvider = refs.reduce<Record<string, number>>((acc, ref) => {
      acc[ref.provider] = (acc[ref.provider] || 0) + 1;
      return acc;
    }, {});
    const byStatus = refs.reduce<Record<string, number>>((acc, ref) => {
      acc[ref.statusBucket] = (acc[ref.statusBucket] || 0) + 1;
      return acc;
    }, {});

    const affectedApplications = new Set(refs.filter((ref) => ref.statusBucket !== 'already_s3').map((ref) => ref.applicationId));
    const draftApplications = new Set(refs.filter((ref) => ref.key?.startsWith('drafts/') || ref.value.includes('draftId=')).map((ref) => ref.applicationId));
    const brokenApplications = new Set(refs.filter((ref) => ref.statusBucket === 'broken_reference').map((ref) => ref.applicationId));
    const uniqueReadySourceKeys = new Set(refs.filter((ref) => ref.statusBucket === 'ready_to_migrate' && ref.key).map((ref) => `${ref.provider}:${ref.key}`));
    const uniqueBrokenSourceKeys = new Set(refs.filter((ref) => ref.statusBucket === 'broken_reference' && ref.key).map((ref) => `${ref.provider}:${ref.key}`));
    const uniqueAlreadyS3Keys = new Set(refs.filter((ref) => ref.statusBucket === 'already_s3' && ref.key).map((ref) => ref.key));
    const brokenApplicationReport = buildBrokenApplicationReport(refs);

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      mode: 'read-only',
      summary: {
        applicationsScanned: applications.length,
        referencesScanned: refs.length,
        affectedApplications: affectedApplications.size,
        draftReferenceApplications: draftApplications.size,
        brokenReferenceApplications: brokenApplications.size,
        uniqueReadySourceFiles: uniqueReadySourceKeys.size,
        uniqueBrokenSourceFiles: uniqueBrokenSourceKeys.size,
        uniqueAlreadyS3Files: uniqueAlreadyS3Keys.size,
        byProvider,
        byStatus,
      },
      inventories: {
        s3: {
          bucket: s3Bucket,
          totalObjects: s3Inventory.totalObjects,
          totalBytes: s3Inventory.totalBytes,
          formattedTotalSize: formatBytes(s3Inventory.totalBytes),
        },
        r2: {
          bucket: r2Bucket,
          configured: r2Inventory.configured,
          scannedPrefixes: R2_SCAN_PREFIXES,
          totalObjects: r2Inventory.totalObjects,
          totalBytes: r2Inventory.totalBytes,
          formattedTotalSize: formatBytes(r2Inventory.totalBytes),
        },
      },
      samples,
      reports: {
        brokenApplications: brokenApplicationReport,
      },
      nextRecommendedBatch: samples.draftReferences.length > 0
        ? 'draftReferences'
        : samples.readyToMigrate.length > 0
          ? 'readyToMigrate'
          : 'none',
    });
  } catch (error: any) {
    console.error('[Storage Migration Audit Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to build storage migration audit' });
  }
}
