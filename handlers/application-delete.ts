import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security.js';

type StorageRef =
  | { provider: 's3'; key: string }
  | { provider: 'r2'; key: string }
  | { provider: 'supabase'; path: string };

const ALLOWED_OBJECT_ROOTS = /^(applicants|photos|applications)\//;

const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  if (!accessKeyId || !secretAccessKey) throw new Error('AWS S3 credentials missing.');
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
};

const getR2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
};

function cleanKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value.replace(/^\//, '');
  if (!ALLOWED_OBJECT_ROOTS.test(key) || key.includes('..')) return null;
  return key;
}

function storageRefFromUrl(value: unknown): StorageRef | null {
  if (typeof value !== 'string' || !value) return null;

  try {
    const parsed = new URL(value, 'https://hrbp.invalid');
    const key = cleanKey(parsed.searchParams.get('key'));
    if (parsed.pathname === '/api/files' && key) return { provider: 's3', key };
    if (parsed.pathname === '/api/draft-files' && key) {
      return process.env.ATTACHMENT_STORAGE_MODE === 's3-primary'
        ? { provider: 's3', key }
        : { provider: 'r2', key };
    }

    const proxiedUrl = parsed.searchParams.get('url');
    if (parsed.pathname === '/api/files' && proxiedUrl) return storageRefFromUrl(decodeURIComponent(proxiedUrl));
  } catch {
    // Continue with legacy URL parsing below.
  }

  if (value.includes('supabase.co') || value.includes('/storage/v1/object/public/')) {
    const match = value.match(/\/public\/applicants\/(.+)$/);
    const path = match?.[1]?.split('?')[0];
    return path && !path.includes('..') ? { provider: 'supabase', path } : null;
  }

  const publicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/\/$/, '');
  if (publicDomain && value.startsWith(`${publicDomain}/`)) {
    const key = cleanKey(value.slice(publicDomain.length + 1).split('?')[0]);
    return key ? { provider: 'r2', key } : null;
  }

  return null;
}

function collectStorageRefs(value: unknown, refs = new Map<string, StorageRef>()): Map<string, StorageRef> {
  const ref = storageRefFromUrl(value);
  if (ref) refs.set(`${ref.provider}:${'key' in ref ? ref.key : ref.path}`, ref);

  if (Array.isArray(value)) {
    for (const item of value) collectStorageRefs(item, refs);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) collectStorageRefs(item, refs);
  }
  return refs;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireStaff(req, res, ['admin']);
    if (!user) return;

    const { id } = req.body || {};
    if (!id || typeof id !== 'string' || !/^[a-f0-9-]{20,50}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid application id' });
    }

    const supabase = getAdminSupabase();
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const refs = [...collectStorageRefs(app).values()];
    const s3 = getS3Client();
    const r2 = getR2Client();
    const s3Bucket = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';
    const r2Bucket = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
    const supabasePaths = refs
      .filter((ref): ref is Extract<StorageRef, { provider: 'supabase' }> => ref.provider === 'supabase')
      .map(ref => ref.path);

    const storageErrors: string[] = [];
    for (const ref of refs) {
      try {
        if (ref.provider === 's3') {
          await s3.send(new DeleteObjectCommand({ Bucket: s3Bucket, Key: ref.key }));
        } else if (ref.provider === 'r2' && r2) {
          await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: ref.key }));
        }
      } catch (error: any) {
        storageErrors.push(`${ref.provider}:${'key' in ref ? ref.key : ref.path}:${error?.message || 'delete failed'}`);
      }
    }

    if (supabasePaths.length) {
      const { error } = await supabase.storage.from('applicants').remove([...new Set(supabasePaths)]);
      if (error) storageErrors.push(`supabase:${error.message}`);
    }

    if (storageErrors.length) {
      console.warn('[application-delete] storage cleanup warnings', storageErrors.slice(0, 10));
    }

    await supabase.from('application_logs').insert([{
      application_id: id,
      action: 'deleted',
      note: `ลบใบสมัครและไฟล์แนบ (${refs.length} references)`,
      performed_by: user.full_name || user.emp_id || 'HRBP Admin',
      created_at: new Date().toISOString(),
    }]);

    const { error: deleteError } = await supabase.from('applications').delete().eq('id', id);
    if (deleteError) throw new Error(deleteError.message);

    return res.status(200).json({
      success: true,
      deletedStorageRefs: refs.length,
      storageWarnings: storageErrors.length,
    });
  } catch (error: any) {
    console.error('[application-delete]', error?.message || error);
    return res.status(500).json({ error: error.message || 'Application delete failed' });
  }
}
