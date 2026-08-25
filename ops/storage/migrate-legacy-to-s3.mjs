#!/usr/bin/env node
/**
 * HRBP Legacy Storage → AWS S3 migration runner.
 *
 * Runs outside Vercel, so it can process larger one-time batches without
 * serverless timeout pressure. Default mode is DRY-RUN and source objects are
 * never deleted.
 *
 * Examples:
 *   node ops/storage/migrate-legacy-to-s3.mjs --dry-run=true --limit=50
 *   node ops/storage/migrate-legacy-to-s3.mjs --dry-run=false --confirm-live-migration --limit=50
 *   node ops/storage/migrate-legacy-to-s3.mjs --ids=<app-id-1>,<app-id-2> --dry-run=false --confirm-live-migration
 *   node ops/storage/migrate-legacy-to-s3.mjs --providers=r2,supabase --month=2026-08 --dry-run=true
 */

import { createClient } from '@supabase/supabase-js';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const FIELD_ALIASES = {
  photo_url: ['photo_url', 'photoUrl'],
  photoUrl: ['photo_url', 'photoUrl'],
  resume_url: ['resume_url', 'resumeUrl'],
  resumeUrl: ['resume_url', 'resumeUrl'],
  transcriptUrl: ['transcriptUrl', 'transcript_url'],
  transcript_url: ['transcriptUrl', 'transcript_url'],
  idCardUrl: ['idCardUrl', 'id_card_url'],
  id_card_url: ['idCardUrl', 'id_card_url'],
  houseRegUrl: ['houseRegUrl', 'house_reg_url'],
  house_reg_url: ['houseRegUrl', 'house_reg_url'],
  eduCertificateUrl: ['eduCertificateUrl', 'edu_certificate_url'],
  edu_certificate_url: ['eduCertificateUrl', 'edu_certificate_url'],
  militaryCertUrl: ['militaryCertUrl', 'military_cert_url'],
  military_cert_url: ['militaryCertUrl', 'military_cert_url'],
  toeicCertUrl: ['toeicCertUrl', 'toeic_cert_url'],
  toeic_cert_url: ['toeicCertUrl', 'toeic_cert_url'],
  bankBookUrl: ['bankBookUrl', 'bank_book_url'],
  bank_book_url: ['bankBookUrl', 'bank_book_url'],
  certificateUrl: ['certificateUrl', 'certificate_url'],
  certificate_url: ['certificateUrl', 'certificate_url'],
  originalPhotoUrl: ['originalPhotoUrl'],
  otherDocsUrl: ['otherDocsUrl', 'other_docs_url'],
  other_docs_url: ['otherDocsUrl', 'other_docs_url'],
};

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

function parseArgs(argv) {
  const options = {
    env: '.env.local',
    dryRun: true,
    confirmLive: false,
    limit: 50,
    delayMs: 100,
    month: '',
    ids: [],
    providers: new Set(['r2', 'supabase']),
    includeDrafts: false,
    report: `ops/storage/reports/legacy-to-s3-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  };

  for (const arg of argv) {
    if (arg.startsWith('--env=')) options.env = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--dry-run=')) options.dryRun = arg.split('=')[1] !== 'false';
    else if (arg === '--confirm-live-migration') options.confirmLive = true;
    else if (arg.startsWith('--limit=')) options.limit = Math.max(parseInt(arg.split('=')[1], 10) || 50, 1);
    else if (arg.startsWith('--delay=')) options.delayMs = Math.max(parseInt(arg.split('=')[1], 10) || 0, 0);
    else if (arg.startsWith('--month=')) options.month = arg.split('=')[1].trim();
    else if (arg.startsWith('--ids=')) options.ids = arg.split('=').slice(1).join('=').split(',').map((id) => id.trim()).filter(Boolean);
    else if (arg.startsWith('--providers=')) options.providers = new Set(arg.split('=')[1].split(',').map((item) => item.trim()).filter(Boolean));
    else if (arg === '--include-drafts') options.includeDrafts = true;
    else if (arg.startsWith('--report=')) options.report = arg.split('=').slice(1).join('=');
    else if (!arg.startsWith('--')) options.ids.push(arg.trim());
  }

  return options;
}

function loadEnvFile(filePath) {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) return false;
  const env = readFileSync(resolved, 'utf8');
  for (const rawLine of env.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

function cleanEnv(value) {
  return String(value || '').replace(/^["']|["']$/g, '').trim();
}

function requiredEnv(name, fallbackName = '') {
  const value = cleanEnv(process.env[name]) || cleanEnv(fallbackName ? process.env[fallbackName] : '');
  if (!value) throw new Error(`Missing required env var: ${name}${fallbackName ? ` or ${fallbackName}` : ''}`);
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLikelyFileRef(fieldPath, value) {
  const lowerField = fieldPath.toLowerCase();
  if (
    lowerField.includes('profilelink') ||
    lowerField.includes('portfoliolink') ||
    lowerField.includes('linkedin') ||
    lowerField.includes('github') ||
    lowerField.includes('website')
  ) {
    return false;
  }
  const lowerValue = value.toLowerCase();
  if (
    lowerValue.includes('linkedin.com') ||
    lowerValue.includes('github.com') ||
    lowerValue.includes('notion.site') ||
    lowerValue.includes('notion.so') ||
    lowerValue.includes('canva.com') ||
    lowerValue.includes('figma.com') ||
    lowerValue.includes('facebook.com') ||
    lowerValue.includes('instagram.com') ||
    lowerValue.includes('youtube.com') ||
    lowerValue.includes('medium.com')
  ) {
    return false;
  }
  if (lowerValue.startsWith('/api/files?')) return true;
  if (lowerValue.includes('/storage/v1/object/')) return true;
  if (lowerValue.includes('r2.dev') || lowerValue.includes('r2.cloudflarestorage.com')) return true;
  if (lowerValue.includes('amazonaws.com')) return true;
  if (/\.(pdf|jpe?g|png|webp|gif|docx?|xlsx?)(\?|$)/i.test(value)) return true;
  return FILE_FIELD_HINTS.some((hint) => lowerField.includes(hint));
}

function pushStringRefs(target, value, fieldPath) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed && isLikelyFileRef(fieldPath, trimmed)) target.push({ field: fieldPath, value: trimmed });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => pushStringRefs(target, item, `${fieldPath}[${idx}]`));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => pushStringRefs(target, nested, fieldPath ? `${fieldPath}.${key}` : key));
  }
}

function decodeProxyUrl(value) {
  try {
    const parsed = new URL(value, 'https://hrbp.local');
    if (parsed.pathname === '/api/files') {
      const proxiedUrl = parsed.searchParams.get('url');
      if (proxiedUrl) return decodeURIComponent(proxiedUrl);
    }
  } catch {}
  return value;
}

function parseStorageRef(rawValue, config) {
  const value = decodeProxyUrl(rawValue);
  const r2PublicDomain = config.r2PublicDomain.replace(/\/$/, '');

  try {
    const parsed = new URL(value, 'https://hrbp.local');
    if (parsed.pathname === '/api/files') {
      const key = parsed.searchParams.get('key');
      return key
        ? { provider: 's3', key, reason: 'already uses S3 proxy' }
        : { provider: 'unknown', reason: 'S3 proxy has no key parameter' };
    }

    const host = parsed.hostname.toLowerCase();
    const path = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));

    if (host.includes('amazonaws.com') || (config.s3Bucket && host.includes(`${config.s3Bucket}.s3`))) {
      return { provider: 's3', key: path, reason: 'already points to AWS S3' };
    }

    if (host.includes('r2.dev') || host.includes('r2.cloudflarestorage.com') || (r2PublicDomain && value.startsWith(r2PublicDomain))) {
      return { provider: 'r2', key: path, reason: 'R2 legacy ref' };
    }

    if (host.includes('supabase.co') && parsed.pathname.includes('/storage/v1/object/')) {
      const marker = '/storage/v1/object/';
      const afterObject = decodeURIComponent(parsed.pathname.slice(parsed.pathname.indexOf(marker) + marker.length));
      const parts = afterObject.replace(/^(public|sign|authenticated)\//, '').split('/').filter(Boolean);
      const bucket = parts.shift();
      return bucket
        ? { provider: 'supabase', bucket, path: parts.join('/'), reason: 'Supabase Storage legacy ref' }
        : { provider: 'supabase', reason: 'Supabase Storage URL has no bucket/path' };
    }

    if (/^https?:\/\//i.test(value)) return { provider: 'external', reason: 'external URL' };
  } catch {}

  return { provider: 'unknown', reason: 'unrecognized storage reference' };
}

function topLevelField(fieldPath) {
  return fieldPath.replace(/^form_data\./, '').replace(/\[.*$/, '').split('.')[0] || fieldPath;
}

function extensionFromPath(path) {
  const ext = path.split('/').pop()?.split('?')[0]?.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '');
  return ext && ext.length <= 8 ? ext : 'bin';
}

function contentTypeFromExt(ext) {
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'doc') return 'application/msword';
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
}

function s3KeyForMigratedRef(applicationId, sourceKey, field) {
  const ext = extensionFromPath(sourceKey);
  const safeField = topLevelField(field).replace(/[^a-zA-Z0-9_-]/g, '_') || 'document';
  return `applicants/${applicationId}/${safeField}.${ext}`;
}

function refHash(ref) {
  return createHash('sha1').update(`${ref.provider}:${ref.key || ref.path || ref.value}`).digest('hex').slice(0, 10);
}

function buildRefs(applications, config) {
  const refs = [];
  const uniqueValues = new Set();
  for (const app of applications) {
    const values = [];
    pushStringRefs(values, app.photo_url, 'photo_url');
    pushStringRefs(values, app.resume_url, 'resume_url');
    pushStringRefs(values, app.form_data || {}, 'form_data');

    const applicantName = app.full_name
      || [app.form_data?.prefix || app.form_data?.title, app.first_name || app.form_data?.firstName, app.last_name || app.form_data?.lastName].filter(Boolean).join(' ').trim()
      || 'ไม่ระบุชื่อ';

    for (const item of values) {
      const parsed = parseStorageRef(item.value, config);
      const field = topLevelField(item.field);
      const dedupeKey = `${app.id}:${field}:${parsed.provider}:${parsed.key || parsed.path || item.value}`;
      if (uniqueValues.has(dedupeKey)) continue;
      uniqueValues.add(dedupeKey);
      refs.push({
        applicationId: String(app.id),
        applicantName,
        field,
        originalField: item.field,
        value: item.value,
        ...parsed,
        hash: '',
      });
    }
  }
  refs.forEach((ref) => { ref.hash = refHash(ref); });
  return refs;
}

async function loadApplications(supabase, options) {
  if (options.ids.length > 0) {
    const { data, error } = await supabase
      .from('applications')
      .select('id, full_name, first_name, last_name, status, created_at, photo_url, resume_url, form_data')
      .in('id', options.ids);
    if (error) throw error;
    return data || [];
  }

  const applications = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    let query = supabase
      .from('applications')
      .select('id, full_name, first_name, last_name, status, created_at, photo_url, resume_url, form_data')
      .order('created_at', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (options.month) {
      const startDate = `${options.month}-01T00:00:00.000Z`;
      const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString();
      query = query.gte('created_at', startDate).lt('created_at', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    applications.push(...data);
    if (data.length < pageSize) break;
    page += 1;
  }

  return applications;
}

async function s3ObjectExists(s3, bucket, key) {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { exists: true, size: Number(head.ContentLength || 0) };
  } catch {
    return { exists: false, size: 0 };
  }
}

async function loadSourceBytes(ref, clients, config) {
  if (ref.provider === 'r2') {
    if (!ref.key) throw new Error('R2 ref has no key');
    const source = await clients.r2.send(new GetObjectCommand({ Bucket: config.r2Bucket, Key: ref.key }));
    const sourceBytes = await source.Body?.transformToByteArray();
    if (!sourceBytes) throw new Error(`R2 object has no body: ${ref.key}`);
    return {
      body: Buffer.from(sourceBytes),
      contentType: source.ContentType || contentTypeFromExt(extensionFromPath(ref.key)),
      sourceSize: Number(source.ContentLength || sourceBytes.byteLength || 0),
    };
  }

  if (ref.provider === 'supabase') {
    if (!ref.bucket || !ref.path) throw new Error('Supabase ref has no bucket/path');
    const { data, error } = await clients.supabase.storage.from(ref.bucket).download(ref.path);
    if (error || !data) throw new Error(`Supabase download failed: ${error?.message || `${ref.bucket}/${ref.path}`}`);
    const body = Buffer.from(await data.arrayBuffer());
    return {
      body,
      contentType: data.type || contentTypeFromExt(extensionFromPath(ref.path)),
      sourceSize: body.length,
    };
  }

  throw new Error(`Unsupported provider: ${ref.provider}`);
}

function applyDbReferenceUpdate(app, refs) {
  const updatedFormData = { ...(app.form_data || {}) };
  const updatePayload = {};

  for (const ref of refs) {
    const proxyUrl = `/api/files?key=${encodeURIComponent(ref.s3Key)}`;
    const aliases = FIELD_ALIASES[ref.field] || [ref.field];
    for (const alias of aliases) updatedFormData[alias] = proxyUrl;
    if (ref.field === 'photo_url' || ref.field === 'photoUrl') updatePayload.photo_url = proxyUrl;
    if (ref.field === 'resume_url' || ref.field === 'resumeUrl') updatePayload.resume_url = proxyUrl;
  }

  updatePayload.form_data = updatedFormData;
  return updatePayload;
}

function printProgress(done, total, summary) {
  const width = 24;
  const pct = total > 0 ? Math.round((done / total) * 100) : 100;
  const filled = Math.round((pct / 100) * width);
  const bar = `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
  process.stdout.write(`\r${bar} ${pct}% | apps ${done}/${total} | refs ok ${summary.refsMigrated} | fail ${summary.refsFailed}`);
}

async function processApplication(app, refs, clients, config, options) {
  const appResult = {
    applicationId: String(app.id),
    applicantName: refs[0]?.applicantName || app.full_name || String(app.id),
    dryRun: options.dryRun,
    migratedRefs: [],
    skippedRefs: [],
    failedRefs: [],
    dbUpdated: false,
  };

  const successfulRefs = [];

  for (const ref of refs) {
    if (ref.provider === 'r2' && ref.key?.startsWith('drafts/') && !options.includeDrafts) {
      appResult.skippedRefs.push({ ...ref, reason: 'draft R2 object skipped; request/reupload flow should handle it' });
      continue;
    }

    const sourceKey = ref.key || ref.path || ref.value;
    const s3Key = s3KeyForMigratedRef(app.id, sourceKey, ref.field);
    const refResult = {
      provider: ref.provider,
      field: ref.field,
      source: sourceKey,
      s3Key,
      bytes: 0,
      status: 'pending',
      reason: '',
    };

    try {
      const existing = await s3ObjectExists(clients.s3, config.s3Bucket, s3Key);
      if (existing.exists) {
        refResult.bytes = existing.size;
        refResult.status = 'existing';
        refResult.reason = 'S3 object already exists; DB will be synced';
        successfulRefs.push({ ...ref, s3Key });
        appResult.skippedRefs.push(refResult);
        continue;
      }

      if (options.dryRun) {
        refResult.status = 'dry-run';
        refResult.reason = 'would copy source to S3 and update DB';
        successfulRefs.push({ ...ref, s3Key });
        appResult.migratedRefs.push(refResult);
        continue;
      }

      const source = await loadSourceBytes(ref, clients, config);
      await clients.s3.send(new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: s3Key,
        Body: source.body,
        ContentType: source.contentType || 'application/octet-stream',
      }));

      const head = await clients.s3.send(new HeadObjectCommand({ Bucket: config.s3Bucket, Key: s3Key }));
      const uploadedSize = Number(head.ContentLength || 0);
      if (uploadedSize !== source.body.length) {
        throw new Error(`S3 verify failed: uploaded size ${uploadedSize}, expected ${source.body.length}`);
      }

      refResult.bytes = source.body.length;
      refResult.status = 'migrated';
      refResult.reason = 'copied and size verified';
      successfulRefs.push({ ...ref, s3Key });
      appResult.migratedRefs.push(refResult);
    } catch (error) {
      refResult.status = 'failed';
      refResult.reason = error?.message || 'migration failed';
      appResult.failedRefs.push(refResult);
    }
  }

  if (successfulRefs.length > 0 && !options.dryRun) {
    const updatePayload = applyDbReferenceUpdate(app, successfulRefs);
    const { error } = await clients.supabase.from('applications').update(updatePayload).eq('id', app.id);
    if (error) {
      appResult.failedRefs.push({ provider: 'supabase-db', field: 'applications', source: String(app.id), s3Key: '', bytes: 0, status: 'failed', reason: `DB update failed: ${error.message}` });
    } else {
      appResult.dbUpdated = true;
    }
  }

  return appResult;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  loadEnvFile('.env');
  loadEnvFile(options.env);

  if (!options.dryRun && !options.confirmLive) {
    throw new Error('Live migration requires --confirm-live-migration. Re-run with --dry-run=true first.');
  }

  const config = {
    supabaseUrl: cleanEnv(process.env.SUPABASE_URL) || requiredEnv('VITE_SUPABASE_URL'),
    supabaseKey: requiredEnv('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
    s3Bucket: requiredEnv('AWS_S3_BUCKET'),
    s3Region: cleanEnv(process.env.AWS_REGION) || 'ap-southeast-1',
    awsAccessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
    awsSecretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
    r2Bucket: cleanEnv(process.env.R2_BUCKET_NAME),
    r2AccountId: cleanEnv(process.env.R2_ACCOUNT_ID),
    r2AccessKeyId: cleanEnv(process.env.R2_ACCESS_KEY_ID),
    r2SecretAccessKey: cleanEnv(process.env.R2_SECRET_ACCESS_KEY),
    r2PublicDomain: cleanEnv(process.env.R2_PUBLIC_DOMAIN),
  };

  if (options.providers.has('r2') && (!config.r2Bucket || !config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey)) {
    throw new Error('R2 provider selected but R2 credentials are incomplete.');
  }

  const clients = {
    supabase: createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
    s3: new S3Client({
      region: config.s3Region,
      credentials: { accessKeyId: config.awsAccessKeyId, secretAccessKey: config.awsSecretAccessKey },
    }),
    r2: options.providers.has('r2')
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId: config.r2AccessKeyId, secretAccessKey: config.r2SecretAccessKey },
        })
      : null,
  };

  console.log('\nHRBP Legacy Storage → AWS S3 migration runner');
  console.log('='.repeat(62));
  console.log(`Mode       : ${options.dryRun ? 'DRY-RUN (no S3/DB writes)' : 'LIVE (writes S3 + DB, source kept)'}`);
  console.log(`Env file   : ${options.env}`);
  console.log(`Providers  : ${Array.from(options.providers).join(', ')}`);
  console.log(`Limit      : ${options.ids.length > 0 ? `${options.ids.length} explicit id(s)` : options.limit}`);
  if (options.month) console.log(`Month      : ${options.month}`);
  console.log(`Source del : never`);
  console.log('='.repeat(62));

  const applications = await loadApplications(clients.supabase, options);
  const refs = buildRefs(applications, config)
    .filter((ref) => options.providers.has(ref.provider))
    .filter((ref) => options.includeDrafts || !(ref.provider === 'r2' && ref.key?.startsWith('drafts/')));

  const groupedRefs = new Map();
  for (const ref of refs) {
    if (!groupedRefs.has(ref.applicationId)) groupedRefs.set(ref.applicationId, []);
    groupedRefs.get(ref.applicationId).push(ref);
  }

  const candidateApps = applications
    .filter((app) => groupedRefs.has(String(app.id)))
    .slice(0, options.ids.length > 0 ? applications.length : options.limit);

  const summary = {
    generatedAt: new Date().toISOString(),
    dryRun: options.dryRun,
    scannedApplications: applications.length,
    candidateApplications: candidateApps.length,
    refsDiscovered: refs.length,
    appsProcessed: 0,
    appsWithDbUpdate: 0,
    refsMigrated: 0,
    refsExisting: 0,
    refsFailed: 0,
    refsSkipped: 0,
    bytesTransferred: 0,
    sourceDeleted: false,
    results: [],
  };

  console.log(`Found ${applications.length} application(s), ${candidateApps.length} candidate app(s), ${refs.length} legacy ref(s).\n`);

  for (let i = 0; i < candidateApps.length; i += 1) {
    const app = candidateApps[i];
    const appRefs = groupedRefs.get(String(app.id)) || [];
    const result = await processApplication(app, appRefs, clients, config, options);
    summary.appsProcessed += 1;
    if (result.dbUpdated) summary.appsWithDbUpdate += 1;
    summary.refsMigrated += result.migratedRefs.filter((ref) => ref.status === 'migrated' || ref.status === 'dry-run').length;
    summary.refsExisting += result.skippedRefs.filter((ref) => ref.status === 'existing').length;
    summary.refsSkipped += result.skippedRefs.filter((ref) => ref.status !== 'existing').length;
    summary.refsFailed += result.failedRefs.length;
    summary.bytesTransferred += result.migratedRefs.reduce((sum, ref) => sum + (ref.bytes || 0), 0);
    summary.results.push(result);
    printProgress(i + 1, candidateApps.length, summary);
    if (options.delayMs > 0) await sleep(options.delayMs);
  }

  console.log('\n');
  mkdirSync(dirname(options.report), { recursive: true });
  writeFileSync(options.report, JSON.stringify(summary, null, 2));

  console.log('Migration run complete');
  console.log('='.repeat(62));
  console.log(`Apps processed : ${summary.appsProcessed}`);
  console.log(`DB updates     : ${summary.appsWithDbUpdate}`);
  console.log(`Refs migrated  : ${summary.refsMigrated}`);
  console.log(`Refs existing  : ${summary.refsExisting}`);
  console.log(`Refs skipped   : ${summary.refsSkipped}`);
  console.log(`Refs failed    : ${summary.refsFailed}`);
  console.log(`Report         : ${options.report}`);
  console.log('='.repeat(62));

  if (summary.refsFailed > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error('\nFatal migration error:', error?.message || error);
  process.exit(1);
});
