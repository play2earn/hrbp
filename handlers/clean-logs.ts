import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminSupabase, requireStaff, configureSameOrigin, safeEqual } from '../server/security.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!configureSameOrigin(req, res, 'GET, POST, OPTIONS')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();

  // 1. Authenticate (Admin Staff Session or Vercel Cron Secret)
  const authHeader = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET || '';
  const isCron = Boolean(cronSecret && safeEqual(authHeader, `Bearer ${cronSecret}`));

  let staffUser = null;
  if (!isCron) {
    staffUser = await requireStaff(req, res, ['admin']);
    if (!staffUser) return; // 401/403 handled by requireStaff
  }

  const supabase = getAdminSupabase();

  // -------------------------------------------------------------
  // GET: Fetch Log Storage Statistics
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const [
        { count: actCount },
        { count: apiLogCount },
        { count: appLogCount },
        { count: qrCount },
      ] = await Promise.all([
        supabase.from('system_activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('system_api_key_logs').select('*', { count: 'exact', head: true }),
        supabase.from('application_logs').select('*', { count: 'exact', head: true }),
        supabase.from('qr_logs').select('*', { count: 'exact', head: true }),
      ]);

      const total = (actCount || 0) + (apiLogCount || 0) + (appLogCount || 0) + (qrCount || 0);

      return res.status(200).json({
        success: true,
        data: {
          system_activity_logs: actCount || 0,
          system_api_key_logs: apiLogCount || 0,
          application_logs: appLogCount || 0,
          qr_logs: qrCount || 0,
          total_log_rows: total,
          checked_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Clean Logs Stats Error]:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch log statistics' });
    }
  }

  // -------------------------------------------------------------
  // POST: Execute Log Cleanup & Retention Policy
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const apiKeyDays = Math.max(7, parseInt(body.api_key_log_days || body.apiKeyDays || '30', 10));
      const activityDays = Math.max(14, parseInt(body.activity_log_days || body.activityDays || '90', 10));
      const appLogDays = Math.max(14, parseInt(body.application_log_days || body.appLogDays || '60', 10));
      const qrDays = Math.max(14, parseInt(body.qr_log_days || body.qrDays || '60', 10));

      const now = Date.now();
      const apiKeyCutoff = new Date(now - apiKeyDays * 24 * 60 * 60 * 1000).toISOString();
      const activityCutoff = new Date(now - activityDays * 24 * 60 * 60 * 1000).toISOString();
      const appLogCutoff = new Date(now - appLogDays * 24 * 60 * 60 * 1000).toISOString();
      const qrCutoff = new Date(now - qrDays * 24 * 60 * 60 * 1000).toISOString();

      // Count rows before delete to report accurate count
      const [
        { count: delApiKeyCount },
        { count: delActivityCount },
        { count: delAppLogCount },
        { count: delQrCount },
      ] = await Promise.all([
        supabase.from('system_api_key_logs').select('*', { count: 'exact', head: true }).lt('created_at', apiKeyCutoff),
        supabase.from('system_activity_logs').select('*', { count: 'exact', head: true }).lt('created_at', activityCutoff),
        supabase.from('application_logs').select('*', { count: 'exact', head: true }).lt('created_at', appLogCutoff),
        supabase.from('qr_logs').select('*', { count: 'exact', head: true }).lt('created_at', qrCutoff),
      ]);

      // Execute Deletions
      await Promise.all([
        supabase.from('system_api_key_logs').delete().lt('created_at', apiKeyCutoff),
        supabase.from('system_activity_logs').delete().lt('created_at', activityCutoff),
        supabase.from('application_logs').delete().lt('created_at', appLogCutoff),
        supabase.from('qr_logs').delete().lt('created_at', qrCutoff),
      ]);

      const totalDeleted = (delApiKeyCount || 0) + (delActivityCount || 0) + (delAppLogCount || 0) + (delQrCount || 0);

      // Audit log the cleanup action
      if (staffUser) {
        try {
          await supabase.from('system_activity_logs').insert([{
            action: 'LOG_CLEANUP_EXECUTED',
            user_id: staffUser.id,
            user_name: staffUser.full_name || staffUser.emp_id || 'Admin',
            user_role: staffUser.role,
            metadata: {
              total_deleted: totalDeleted,
              deleted_api_key_logs: delApiKeyCount || 0,
              deleted_activity_logs: delActivityCount || 0,
              deleted_application_logs: delAppLogCount || 0,
              deleted_qr_logs: delQrCount || 0,
              retention_days: { apiKeyDays, activityDays, appLogDays, qrDays },
            },
            created_at: new Date().toISOString(),
          }]);
        } catch {}
      }

      return res.status(200).json({
        success: true,
        message: `ล้าง Log เก่าเรียบร้อยแล้ว รวมทั้งหมด ${totalDeleted.toLocaleString()} รายการ`,
        data: {
          deleted_api_key_logs: delApiKeyCount || 0,
          deleted_activity_logs: delActivityCount || 0,
          deleted_application_logs: delAppLogCount || 0,
          deleted_qr_logs: delQrCount || 0,
          total_deleted: totalDeleted,
          retention_applied: {
            apiKeyDays,
            activityDays,
            appLogDays,
            qrDays,
          },
          cleaned_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Clean Logs Execution Error]:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to execute log cleanup' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
