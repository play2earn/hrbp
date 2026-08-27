import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getAdminSupabase, requireStaff, configureSameOrigin } from '../server/security.js';

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key.trim()).digest('hex');
}

export function maskApiKey(prefix: string, rawKey: string): string {
  const clean = rawKey.trim();
  if (clean.length <= 16) return `${prefix}••••••••`;
  const first4 = clean.slice(prefix.length, prefix.length + 4);
  const last4 = clean.slice(-4);
  return `${prefix}${first4}••••••••${last4}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!configureSameOrigin(req, res, 'GET, POST, OPTIONS')) return;

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 1. Authenticate Staff Session (Admin Only)
  const staff = await requireStaff(req, res, ['admin']);
  if (!staff) return; // 401/403 response already handled by requireStaff

  const supabase = getAdminSupabase();

  try {
    // -------------------------------------------------------------
    // GET: List all API Keys
    // -------------------------------------------------------------
    if (req.method === 'GET') {
      const { data: keys, error } = await supabase
        .from('system_api_keys')
        .select('id, name, key_prefix, masked_key, is_active, created_at, created_by, last_used_at, expires_at, notes')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: keys || [],
      });
    }

    // -------------------------------------------------------------
    // POST: Manage API Keys (generate, toggle, delete)
    // -------------------------------------------------------------
    if (req.method === 'POST') {
      const body = req.body || {};
      const action = (body.action || 'generate').toLowerCase().trim();

      // Action 1: GENERATE NEW KEY
      if (action === 'generate') {
        const name = (body.name || 'IDMS/HRMS Integration Key').trim();
        const prefix = (body.prefix || 'hrbp_live_').trim();
        const notes = (body.notes || '').trim();

        if (!name) {
          return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อ API Key' });
        }

        // Generate cryptographically strong random token (48 chars hex)
        const randomHex = crypto.randomBytes(24).toString('hex');
        const rawApiKey = `${prefix}${randomHex}`;
        const keyHash = hashApiKey(rawApiKey);
        const maskedKey = maskApiKey(prefix, rawApiKey);

        const creator = staff.full_name || staff.username || staff.emp_id || 'HRBP Staff';

        const { data: createdKey, error: insertErr } = await supabase
          .from('system_api_keys')
          .insert([{
            name,
            key_prefix: prefix,
            key_hash: keyHash,
            masked_key: maskedKey,
            is_active: true,
            created_by: creator,
            notes: notes || null,
            created_at: new Date().toISOString(),
          }])
          .select('id, name, key_prefix, masked_key, is_active, created_at, created_by, notes')
          .single();

        if (insertErr) throw insertErr;

        // Log action in audit logs
        try {
          await supabase.from('system_activity_logs').insert([{
            action_type: 'API_KEY_CREATED',
            details: `สร้าง API Key ใหม่: ${name} (${maskedKey})`,
            actor_name: creator,
            actor_id: staff.id,
            created_at: new Date().toISOString(),
          }]);
        } catch {}

        return res.status(200).json({
          success: true,
          message: 'สร้าง API Key ใหม่สำเร็จ',
          data: {
            ...createdKey,
            plain_api_key: rawApiKey, // Returned ONLY ONCE on generation!
          },
        });
      }

      // Action 2: TOGGLE ACTIVE / INACTIVE
      if (action === 'toggle') {
        const keyId = body.id;
        const isActive = Boolean(body.is_active);

        if (!keyId) {
          return res.status(400).json({ success: false, error: 'Missing key id' });
        }

        const { data: updated, error: toggleErr } = await supabase
          .from('system_api_keys')
          .update({ is_active: isActive })
          .eq('id', keyId)
          .select('id, name, masked_key, is_active')
          .single();

        if (toggleErr) throw toggleErr;

        return res.status(200).json({
          success: true,
          message: `อัปเดตสถานะ API Key เป็น ${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} เรียบร้อย`,
          data: updated,
        });
      }

      // Action 3: DELETE / REVOKE KEY
      if (action === 'delete' || action === 'revoke') {
        const keyId = body.id;
        if (!keyId) {
          return res.status(400).json({ success: false, error: 'Missing key id' });
        }

        const { error: delErr } = await supabase
          .from('system_api_keys')
          .delete()
          .eq('id', keyId);

        if (delErr) throw delErr;

        return res.status(200).json({
          success: true,
          message: 'เพิกถอน API Key สำเร็จ',
        });
      }

      return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API Keys Handler Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'เกิดข้อผิดพลาดในการจัดการ API Key',
    });
  }
}
