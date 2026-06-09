import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token, pin1, pin2 } = req.body;

    if (!token || !pin1 || !pin2) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
    }

    // Validate PIN format: 4 alphanumeric characters each
    if (!/^[0-9a-zA-Z]{4}$/.test(pin1) || !/^[0-9]{4}$/.test(pin2)) {
      return res.status(400).json({ success: false, error: 'รูปแบบ PIN ไม่ถูกต้อง' });
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

    // 1. Fetch the resubmit token row
    const { data: tokenRow, error: tokenError } = await supabase
      .from('application_share_tokens')
      .select('id, application_id, token_type, expires_at, is_revoked, resubmitted_at, pin_hash, pin_attempts, pin_locked_until, allowed_fields')
      .eq('token', token)
      .eq('token_type', 'resubmit')
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (tokenError || !tokenRow) {
      return res.status(404).json({ success: false, error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    // 2. Check if already used (single-use)
    if (tokenRow.resubmitted_at) {
      return res.status(410).json({ success: false, error: 'ลิงก์นี้ถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้' });
    }

    // 3. Check if PIN is brute-force locked
    if (tokenRow.pin_locked_until && new Date(tokenRow.pin_locked_until) > new Date()) {
      const unlockAt = new Date(tokenRow.pin_locked_until);
      const minutesLeft = Math.ceil((unlockAt.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error: `ป้อน PIN ผิดหลายครั้งเกินไป กรุณาลองใหม่ในอีก ${minutesLeft} นาที`
      });
    }

    // 4. Compute hash of input and compare
    const inputHash = createHash('sha256')
      .update(`${pin1.toLowerCase()}:${pin2}`)
      .digest('hex');

    if (inputHash !== tokenRow.pin_hash) {
      // Increment failed attempts
      const newAttempts = (tokenRow.pin_attempts || 0) + 1;
      const updatePayload: any = { pin_attempts: newAttempts };

      if (newAttempts >= MAX_ATTEMPTS) {
        updatePayload.pin_locked_until = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
      }

      await supabase
        .from('application_share_tokens')
        .update(updatePayload)
        .eq('id', tokenRow.id);

      const attemptsLeft = MAX_ATTEMPTS - newAttempts;
      if (attemptsLeft <= 0) {
        return res.status(423).json({
          success: false,
          error: `ป้อน PIN ผิดหลายครั้งเกินไป กรุณาลองใหม่ในอีก 30 นาที`,
          attemptsLeft: 0
        });
      }

      return res.status(401).json({
        success: false,
        error: 'PIN ไม่ถูกต้อง',
        attemptsLeft
      });
    }

    // 5. PIN correct — reset attempts counter
    await supabase
      .from('application_share_tokens')
      .update({ pin_attempts: 0, pin_locked_until: null })
      .eq('id', tokenRow.id);

    // 6. Return only what applicant needs (no sensitive data)
    return res.status(200).json({
      success: true,
      applicationId: tokenRow.application_id,
      allowedFields: tokenRow.allowed_fields || []
    });

  } catch (error: any) {
    console.error('[verify-resubmit-pin Error]:', error);
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
}
