import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash, randomBytes } from 'crypto';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security.js';
import { publicAppOrigin, formatShareUrl, formatResubmitUrl } from '../server/origin.js';

const RESUBMIT_FIELDS = new Set([
  'resumeUrl', 'transcriptUrl', 'certificateUrl', 'photoUrl', 'idCardUrl',
  'houseRegUrl', 'eduCertificateUrl', 'militaryCertUrl', 'toeicCertUrl',
  'bankBookUrl_scb', 'bankBookUrl_ktb',
]);

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  const supabase = getAdminSupabase();

  try {
    if (req.method === 'GET' && req.query.token) {
      const token = queryValue(req.query.token);
      if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ error: 'Invalid share token' });
      const { data: tokenRow } = await supabase
        .from('application_share_tokens')
        .select('id, application_id, access_count')
        .eq('token', token)
        .eq('token_type', 'share')
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      if (!tokenRow) return res.status(404).json({ error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' });

      const { data: application } = await supabase
        .from('applications')
        .select('id, full_name, position, department, form_data, created_at, status, photo_url')
        .eq('id', tokenRow.application_id)
        .maybeSingle();
      if (!application) return res.status(404).json({ error: 'ไม่พบข้อมูลผู้สมัคร' });

      await supabase.from('application_share_tokens').update({
        last_accessed_at: new Date().toISOString(),
        access_count: Number(tokenRow.access_count || 0) + 1,
      }).eq('id', tokenRow.id);
      return res.status(200).json({ success: true, data: application });
    }

    const staff = await requireStaff(req, res);
    if (!staff) return;
    const action = String(req.body?.action || '');
    if (req.method === 'POST' && action === 'revoke') {
      const token = String(req.body?.token || '');
      if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ error: 'Invalid token' });
      const { error } = await supabase.from('application_share_tokens')
        .update({ is_revoked: true })
        .eq('token', token);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    const applicationId = String(req.method === 'GET' ? queryValue(req.query.applicationId) : req.body?.applicationId || '');
    if (!/^[a-f0-9-]{20,50}$/i.test(applicationId)) return res.status(400).json({ error: 'Invalid application ID' });

    if (req.method === 'GET') {
      const tokenType = queryValue(req.query.type) === 'resubmit' ? 'resubmit' : 'share';
      let query = supabase.from('application_share_tokens')
        .select('token, expires_at, allowed_fields')
        .eq('application_id', applicationId)
        .eq('token_type', tokenType)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      if (tokenType === 'resubmit') query = query.is('resubmitted_at', null);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return res.status(200).json({ success: true, data: null });
      const url = tokenType === 'share' ? formatShareUrl(data.token) : formatResubmitUrl(data.token);
      return res.status(200).json({ success: true, data: { ...data, url } });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const tokenType = action === 'generate-resubmit' ? 'resubmit' : action === 'generate-share' ? 'share' : '';
    if (!tokenType) return res.status(400).json({ error: 'Invalid action' });
    if (tokenType === 'share') {
      const { data: existing } = await supabase.from('application_share_tokens')
        .select('token, expires_at').eq('application_id', applicationId).eq('token_type', 'share')
        .eq('is_revoked', false).gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (existing) return res.status(200).json({ success: true, data: { ...existing, url: formatShareUrl(existing.token) } });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const payload: Record<string, unknown> = {
      application_id: applicationId, token, token_type: tokenType,
      created_by: staff.full_name || staff.email || staff.id, expires_at: expiresAt,
    };

    if (tokenType === 'resubmit') {
      const allowedFields = Array.isArray(req.body?.allowedFields)
        ? req.body.allowedFields.filter((field: unknown): field is string => typeof field === 'string' && RESUBMIT_FIELDS.has(field))
        : [];
      if (!allowedFields.length) return res.status(400).json({ error: 'No valid resubmit fields selected' });
      const { data: application } = await supabase.from('applications').select('form_data').eq('id', applicationId).maybeSingle();
      const fd = application?.form_data || {};
      const idValue = String(fd.isThaiNational === false ? fd.passportNo || '' : fd.nationalId || '');
      const phoneValue = String(fd.phone || '').replace(/[^0-9]/g, '');
      const last4Id = idValue.slice(-4).toLowerCase();
      const last4Phone = phoneValue.slice(-4);
      if (last4Id.length !== 4 || last4Phone.length !== 4) return res.status(400).json({ error: 'ข้อมูลบัตรประชาชน/Passport หรือเบอร์โทรไม่ครบ 4 หลัก' });
      await supabase.from('application_share_tokens').update({ is_revoked: true })
        .eq('application_id', applicationId).eq('token_type', 'resubmit').eq('is_revoked', false);
      payload.allowed_fields = allowedFields;
      payload.pin_hash = createHash('sha256').update(`${last4Id}:${last4Phone}`).digest('hex');
      payload.pin_attempts = 0;
    }

    const { data, error } = await supabase.from('application_share_tokens').insert([payload]).select('token, expires_at, allowed_fields').single();
    if (error) throw error;
    const url = tokenType === 'share' ? formatShareUrl(data.token) : formatResubmitUrl(data.token);
    if (tokenType === 'resubmit') {
      await supabase.from('application_logs').insert([{
        application_id: applicationId, action: 'resubmit_token_created',
        note: `HR ขอเอกสารใหม่: ${(payload.allowed_fields as string[]).join(', ')} (token หมดอายุใน 7 วัน)`,
        performed_by: payload.created_by,
      }]);
    }
    return res.status(200).json({ success: true, data: { ...data, url } });
  } catch (error: any) {
    console.error('[share-tokens]', error);
    return res.status(500).json({ error: error.message || 'Share token operation failed' });
  }
}
