import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireStaff(req, res);
  if (!user) return;
  const supabase = getAdminSupabase();
  const action = String(req.method === 'GET' ? req.query.action || 'entries' : req.body?.action || '');

  try {
    if (action === 'entries') {
      const { data, error } = await supabase.from('blacklist').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }
    if (action === 'audit') {
      const { data, error } = await supabase.from('blacklist_audit_logs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }
    if (action === 'add') {
      const { data, error } = await supabase.from('blacklist').insert([req.body.entry]).select().single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }
    if (action === 'update') {
      const { data, error } = await supabase.from('blacklist').update(req.body.entry).eq('id', req.body.id).select().single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }
    if (action === 'delete') {
      const { error } = await supabase.from('blacklist').delete().eq('id', req.body.id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    if (action === 'addAudit') {
      const supplied = req.body.log || {};
      const audit = {
        ...supplied,
        performed_by: user.id,
        performed_by_name: user.full_name || user.hrms_username || 'HR Staff',
      };
      const { data, error } = await supabase.from('blacklist_audit_logs').insert([audit]).select().single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }
    return res.status(400).json({ error: 'Unsupported action' });
  } catch (error: any) {
    console.error('[Blacklist API Error]', error?.message || error);
    return res.status(500).json({ error: 'Blacklist operation failed' });
  }
}
