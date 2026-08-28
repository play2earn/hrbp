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
    // GET: List all API Keys OR Fetch Logs for a specific Key
    // -------------------------------------------------------------
    if (req.method === 'GET') {
      const action = (req.query.action || '').toString().trim().toLowerCase();

      // Sub-Action: Fetch API Key Request Logs
      if (action === 'logs' || req.query.key_id || req.query.keyId) {
        const keyId = (req.query.key_id || req.query.keyId || '').toString().trim();
        const statusFilter = (req.query.status || '').toString().trim().toLowerCase();
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
        const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
          .from('system_api_key_logs')
          .select('*', { count: 'exact' });

        if (keyId) {
          query = query.eq('api_key_id', keyId);
        }

        if (statusFilter && statusFilter !== 'all') {
          if (statusFilter === 'success' || statusFilter === '200') {
            query = query.gte('status_code', 200).lt('status_code', 300);
          } else if (statusFilter === 'error' || statusFilter === '4xx' || statusFilter === '5xx') {
            query = query.gte('status_code', 400);
          } else if (!isNaN(parseInt(statusFilter, 10))) {
            query = query.eq('status_code', parseInt(statusFilter, 10));
          }
        }

        const { data: logs, count, error: logsErr } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (logsErr) throw logsErr;

        // Compute traffic stats for this key (past 7 days)
        const now = Date.now();
        const past24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        const past7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

        let statsQuery = supabase
          .from('system_api_key_logs')
          .select('status_code, response_time_ms, created_at');

        if (keyId) statsQuery = statsQuery.eq('api_key_id', keyId);
        const { data: recentLogs } = await statsQuery.gte('created_at', past7d).limit(1000);

        const recent = recentLogs || [];
        const total7d = recent.length;
        const total24h = recent.filter(r => r.created_at >= past24h).length;
        const successCount = recent.filter(r => r.status_code >= 200 && r.status_code < 300).length;
        const errorCount = recent.filter(r => r.status_code >= 400).length;
        const successRate = total7d > 0 ? parseFloat(((successCount / total7d) * 100).toFixed(1)) : 100.0;
        const latencies = recent.map(r => r.response_time_ms).filter(n => typeof n === 'number' && n > 0) as number[];
        const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

        return res.status(200).json({
          success: true,
          data: {
            logs: logs || [],
            total_count: count || 0,
            stats: {
              total_7d: total7d,
              total_24h: total24h,
              success_count: successCount,
              error_count: errorCount,
              success_rate: successRate,
              avg_latency_ms: avgLatency,
            },
          },
        });
      }

      // Default: List All API Keys with 30-day Call Counts
      const { data: keys, error } = await supabase
        .from('system_api_keys')
        .select('id, name, key_prefix, masked_key, is_active, created_at, created_by, last_used_at, expires_at, notes')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch 30-day call counts
      const past30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: logCounts } = await supabase
        .from('system_api_key_logs')
        .select('api_key_id')
        .gte('created_at', past30d);

      const countsMap: Record<string, number> = {};
      (logCounts || []).forEach(r => {
        if (r.api_key_id) countsMap[r.api_key_id] = (countsMap[r.api_key_id] || 0) + 1;
      });

      const enrichedKeys = (keys || []).map(k => ({
        ...k,
        total_calls_30d: countsMap[k.id] || 0,
      }));

      return res.status(200).json({
        success: true,
        data: enrichedKeys,
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
