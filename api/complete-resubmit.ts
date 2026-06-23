import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_FIELDS = [
  'resumeUrl', 'transcriptUrl', 'certificateUrl', 'photoUrl',
  'idCardUrl', 'houseRegUrl', 'eduCertificateUrl', 'militaryCertUrl', 'toeicCertUrl',
  'bankBookUrl_scb', 'bankBookUrl_ktb'
];

const FIELD_LABEL_MAP: Record<string, string> = {
  resumeUrl: 'Resume / CV',
  transcriptUrl: 'Transcript / ใบ Grade',
  certificateUrl: 'Certificate / เอกสารเพิ่มเติม',
  photoUrl: 'รูปถ่าย',
  idCardUrl: 'สำเนาบัตรประชาชน',
  houseRegUrl: 'สำเนาทะเบียนบ้าน',
  eduCertificateUrl: 'ใบรับรองวุฒิการศึกษา',
  militaryCertUrl: 'ใบผ่านการเกณฑ์ทหาร',
  toeicCertUrl: 'ผลสอบ TOEIC',
  bankBookUrl_scb: 'สำเนาบัญชีธนาคารไทยพาณิชย์ (ออมทรัพย์)',
  bankBookUrl_ktb: 'สำเนาบัญชีธนาคารกรุงไทย (ออมทรัพย์)',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token, applicationId, uploadedFields } = req.body;

    if (!token || !applicationId || !uploadedFields || typeof uploadedFields !== 'object') {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const cleanEnvVar = (val?: string) => val ? val.replace(/^["']|["']$/g, '').trim() : '';
    const supabaseUrl = cleanEnvVar(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
    const supabaseAnonKey = cleanEnvVar(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { 'x-admin-key': 'vibe-recruit-admin-secret-2026' } }
    });

    // 1. Re-validate the token (security double-check)
    const { data: tokenRow, error: tokenError } = await supabase
      .from('application_share_tokens')
      .select('id, application_id, token_type, expires_at, is_revoked, resubmitted_at, allowed_fields')
      .eq('token', token)
      .eq('token_type', 'resubmit')
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (tokenError || !tokenRow) {
      return res.status(404).json({ error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    // 2. Verify applicationId matches the token
    if (tokenRow.application_id !== applicationId) {
      return res.status(403).json({ error: 'ข้อมูลไม่ตรงกัน' });
    }

    // 3. Check single-use
    if (tokenRow.resubmitted_at) {
      return res.status(410).json({ error: 'ลิงก์นี้ถูกใช้งานไปแล้ว' });
    }

    // 4. Validate submitted fields — only allow fields HR approved
    const allowedByHR: string[] = tokenRow.allowed_fields || [];
    const submittedKeys = Object.keys(uploadedFields);

    // Filter: only keep keys that are in ALLOWED_FIELDS global list AND in allowedByHR
    const safeKeys = submittedKeys.filter(
      k => ALLOWED_FIELDS.includes(k) && allowedByHR.includes(k)
    );

    if (safeKeys.length === 0) {
      return res.status(400).json({ error: 'ไม่มีเอกสารที่ได้รับอนุญาตให้อัปโหลด' });
    }

    // 5. Fetch current form_data
    const { data: appRow, error: appError } = await supabase
      .from('applications')
      .select('form_data')
      .eq('id', applicationId)
      .single();

    if (appError || !appRow) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลใบสมัคร' });
    }

    // 6. Merge only safe fields into form_data
    const updatedFormData = { ...(appRow.form_data || {}) };
    for (const key of safeKeys) {
      if (uploadedFields[key] && typeof uploadedFields[key] === 'string') {
        if (key === 'bankBookUrl_scb') {
          updatedFormData.bankBookUrl = uploadedFields[key];
          updatedFormData.bankName = 'SCB';
        } else if (key === 'bankBookUrl_ktb') {
          updatedFormData.bankBookUrl = uploadedFields[key];
          updatedFormData.bankName = 'KTB';
        } else {
          updatedFormData[key] = uploadedFields[key];
        }
      }
    }

    // 7. Update the application record
    const { error: updateError } = await supabase
      .from('applications')
      .update({ form_data: updatedFormData })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(`Failed to update application: ${updateError.message}`);
    }

    // 8. Log the action in application_logs
    const changedLabels = safeKeys.map(k => FIELD_LABEL_MAP[k] || k).join(', ');
    await supabase
      .from('application_logs')
      .insert([{
        application_id: applicationId,
        action: 'resubmitted_docs',
        note: `ผู้สมัครอัปโหลดเอกสารใหม่: ${changedLabels}`,
        performed_by: 'ผู้สมัคร (self-service)',
        created_at: new Date().toISOString(),
      }]);

    // 9. Mark token as used (single-use: set resubmitted_at)
    await supabase
      .from('application_share_tokens')
      .update({ resubmitted_at: new Date().toISOString() })
      .eq('id', tokenRow.id);

    console.log(`[complete-resubmit] Application ${applicationId}: updated fields [${safeKeys.join(', ')}]`);

    return res.status(200).json({ success: true, updatedFields: safeKeys });

  } catch (error: any) {
    console.error('[complete-resubmit Error]:', error);
    return res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดภายในระบบ' });
  }
}
