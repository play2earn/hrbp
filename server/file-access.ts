import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getActiveStaff, getAdminSupabase } from './security';

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function containsExactString(value: unknown, expected: string): boolean {
  if (typeof value === 'string') return value === expected;
  if (Array.isArray(value)) return value.some(item => containsExactString(item, expected));
  if (value && typeof value === 'object') return Object.values(value).some(item => containsExactString(item, expected));
  return false;
}

export function isAllowedStorageUrl(rawUrl: string): boolean {
  try {
    const target = new URL(rawUrl);
    if (target.protocol !== 'https:') return false;
    if (process.env.R2_PUBLIC_DOMAIN) {
      const r2 = new URL(process.env.R2_PUBLIC_DOMAIN);
      const basePath = r2.pathname.endsWith('/') ? r2.pathname : `${r2.pathname}/`;
      if (target.hostname === r2.hostname && target.pathname.startsWith(basePath)) return true;
    }
    for (const rawSupabase of [process.env.SUPABASE_URL, process.env.VITE_SUPABASE_URL].filter(Boolean)) {
      const supabase = new URL(String(rawSupabase));
      if (target.hostname === supabase.hostname && target.pathname.startsWith('/storage/v1/object/')) return true;
    }
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    return Boolean(bucket && [
      `${bucket}.s3.${region}.amazonaws.com`,
      `${bucket}.s3.amazonaws.com`,
    ].includes(target.hostname));
  } catch {
    return false;
  }
}

export async function authorizeFileAccess(req: VercelRequest, res: VercelResponse, options: { key?: string; url?: string }): Promise<boolean> {
  if (await getActiveStaff(req)) return true;

  const shareToken = queryValue(req.query.shareToken);
  if (!/^[a-f0-9]{64}$/i.test(shareToken)) {
    res.status(401).json({ error: 'Authentication or a valid share token is required' });
    return false;
  }

  const supabase = getAdminSupabase();
  const { data: tokenRow } = await supabase
    .from('application_share_tokens')
    .select('application_id')
    .eq('token', shareToken)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .eq('token_type', 'share')
    .maybeSingle();
  if (!tokenRow?.application_id) {
    res.status(403).json({ error: 'Share token is invalid or expired' });
    return false;
  }

  if (options.key) {
    const expectedPrefix = `applicants/${tokenRow.application_id}/`;
    if (!options.key.startsWith(expectedPrefix)) {
      res.status(403).json({ error: 'The shared link does not authorize this file' });
      return false;
    }
    return true;
  }

  if (options.url) {
    if (!isAllowedStorageUrl(options.url)) {
      res.status(403).json({ error: 'Storage URL is not allowed' });
      return false;
    }
    const { data: application } = await supabase
      .from('applications')
      .select('photo_url, resume_url, form_data')
      .eq('id', tokenRow.application_id)
      .maybeSingle();
    if (!application || !containsExactString(application, options.url)) {
      res.status(403).json({ error: 'The shared link does not authorize this file' });
      return false;
    }
    return true;
  }

  res.status(400).json({ error: 'Missing file identifier' });
  return false;
}
