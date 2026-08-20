import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getAdminSupabase } from '../server/security';

async function attachResubmitToken(supabase: ReturnType<typeof getAdminSupabase>, application: any) {
  const { data: row } = await supabase.from('application_share_tokens')
    .select('token, expires_at')
    .eq('application_id', application.id)
    .eq('token_type', 'resubmit')
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .is('resubmitted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { ...application, resubmit_token: row?.token || null, resubmit_expires_at: row?.expires_at || null };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getAdminSupabase();
    const mode = String(req.body?.mode || '');
    const value = String(req.body?.value || '').trim();

    if (mode === 'tracking-id') {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return res.status(400).json({ error: 'Invalid tracking ID format.' });
      }
      const { data, error } = await supabase.rpc('get_application_status', { app_id: value });
      if (error) throw error;
      if (!data?.id) return res.status(404).json({ error: 'Application not found.' });
      return res.status(200).json({ success: true, data: await attachResubmitToken(supabase, data) });
    }

    if (mode === 'identity') {
      if (value.length < 6 || value.length > 30 || !/^[0-9a-zA-Z-]+$/.test(value)) {
        return res.status(400).json({ error: 'Invalid National ID or Passport format.' });
      }
      const columns = 'id, full_name, position, department, status, created_at, updated_at';
      const [{ data: byNationalId, error: nationalError }, { data: byPassport, error: passportError }] = await Promise.all([
        supabase.from('applications').select(columns).eq('form_data->>nationalId', value).order('created_at', { ascending: false }),
        supabase.from('applications').select(columns).eq('form_data->>passportNo', value).order('created_at', { ascending: false }),
      ]);
      if (nationalError || passportError) throw nationalError || passportError;
      const unique = Array.from(new Map([...(byNationalId || []), ...(byPassport || [])].map(item => [item.id, item])).values());
      if (!unique.length) return res.status(404).json({ error: 'No applications found.' });
      return res.status(200).json({ success: true, data: await Promise.all(unique.map(app => attachResubmitToken(supabase, app))) });
    }

    return res.status(400).json({ error: 'Invalid tracking mode' });
  } catch (error: any) {
    console.error('[tracking]', error);
    return res.status(500).json({ error: 'Unable to track application' });
  }
}
