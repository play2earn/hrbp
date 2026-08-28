import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getAdminSupabase, getActiveStaff, safeEqual } from '../server/security.js';
import { logApiKeyUsageAsync } from '../server/api-logger.js';

function getHeaderApiKey(req: VercelRequest): string {
  const xApiKey = req.headers['x-api-key'];
  if (xApiKey && typeof xApiKey === 'string') return xApiKey.trim();

  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.*)$/i);
    if (match) return match[1].trim();
  }

  const queryKey = req.query.api_key || req.query.apiKey;
  if (queryKey && typeof queryKey === 'string') return queryKey.trim();

  return '';
}

export interface AuthResult {
  valid: boolean;
  keyId?: string;
  keyName?: string;
  keyPrefix?: string;
}

async function verifyIntegrationAuthAsync(req: VercelRequest): Promise<AuthResult> {
  const providedKey = getHeaderApiKey(req);
  if (!providedKey) return { valid: false };

  // 1. Check against dynamic database API keys in system_api_keys
  try {
    const keyHash = crypto.createHash('sha256').update(providedKey.trim()).digest('hex');
    const supabase = getAdminSupabase();
    const { data: matchedKey } = await supabase
      .from('system_api_keys')
      .select('id, name, key_prefix, is_active')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .maybeSingle();

    if (matchedKey) {
      // Update last_used_at asynchronously
      Promise.resolve(
        supabase
          .from('system_api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', matchedKey.id)
      ).catch(() => {});
      return {
        valid: true,
        keyId: matchedKey.id,
        keyName: matchedKey.name,
        keyPrefix: matchedKey.key_prefix,
      };
    }
  } catch (err) {
    console.error('[Verify DB API Key Error]:', err);
  }

  // 2. Fallback to environment variables
  const validKeys = [
    process.env.HRMS_SYNC_API_KEY,
    process.env.HRMS_SECRET_KEY,
    process.env.HRBP_SESSION_SECRET,
  ].filter(Boolean) as string[];

  if (validKeys.length === 0) return { valid: false };

  const isMatched = validKeys.some(validKey => {
    try {
      return safeEqual(providedKey, validKey.trim());
    } catch {
      return false;
    }
  });

  if (isMatched) {
    return {
      valid: true,
      keyName: 'Environment Secret Key',
      keyPrefix: 'env_',
    };
  }

  return { valid: false };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Authenticate Request
  const startTime = Date.now();
  const isStaff = await getActiveStaff(req);
  const authResult = await verifyIntegrationAuthAsync(req);

  if (!isStaff && !authResult.valid) {
    logApiKeyUsageAsync({
      req,
      endpoint: '/api?route=hrms-ack',
      method: 'POST',
      statusCode: 401,
      responseTimeMs: Date.now() - startTime,
      queryParams: req.query as any,
      errorMessage: 'Unauthorized. Provide a valid X-API-Key header or staff session.',
    });

    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Provide a valid X-API-Key header or staff session.',
      code: 'AUTH_REQUIRED',
    });
  }

  const effectiveKeyId = authResult.valid ? authResult.keyId : null;
  const effectiveKeyName = authResult.valid ? authResult.keyName : `Staff Session (${isStaff?.full_name || 'Staff'})`;
  const effectiveKeyPrefix = authResult.valid ? authResult.keyPrefix : 'session_';

  const body = req.body || {};
  const applicationId = (body.application_id || body.applicationId || '').trim();
  const employeeId = (body.hrms_employee_id || body.employee_id || body.employeeId || '').trim();
  const syncStatus = (body.sync_status || body.status || 'SYNCED').trim().toUpperCase();
  const notes = (body.notes || body.sync_notes || '').trim();

  if (!applicationId) {
    logApiKeyUsageAsync({
      req,
      apiKeyId: effectiveKeyId,
      keyName: effectiveKeyName,
      keyPrefix: effectiveKeyPrefix,
      endpoint: '/api?route=hrms-ack',
      method: 'POST',
      statusCode: 400,
      responseTimeMs: Date.now() - startTime,
      errorMessage: 'Missing required field: application_id',
    });

    return res.status(400).json({
      success: false,
      error: 'Missing required field: application_id',
    });
  }

  try {
    const supabase = getAdminSupabase();

    // Verify application exists
    const { data: existingApp, error: fetchErr } = await supabase
      .from('applications')
      .select('id, full_name, hrms_sync_status')
      .eq('id', applicationId)
      .maybeSingle();

    if (fetchErr || !existingApp) {
      logApiKeyUsageAsync({
        req,
        apiKeyId: effectiveKeyId,
        keyName: effectiveKeyName,
        keyPrefix: effectiveKeyPrefix,
        endpoint: '/api?route=hrms-ack',
        method: 'POST',
        statusCode: 404,
        responseTimeMs: Date.now() - startTime,
        errorMessage: `Application with ID ${applicationId} not found`,
      });

      return res.status(404).json({
        success: false,
        error: `Application with ID ${applicationId} not found`,
      });
    }

    const updates: Record<string, any> = {
      hrms_sync_status: syncStatus,
      updated_at: new Date().toISOString(),
    };

    if (syncStatus === 'READY_TO_SYNC') {
      updates.hrms_ready_at = new Date().toISOString();
      updates.hrms_ready_by = (body.ready_by || isStaff?.full_name || isStaff?.emp_id || 'HRBP Staff').trim();
    } else if (syncStatus === 'NOT_READY') {
      updates.hrms_ready_at = null;
      updates.hrms_ready_by = null;
      updates.hrms_synced_at = null;
      updates.hrms_employee_id = null;
    } else if (syncStatus === 'SYNCED') {
      updates.hrms_synced_at = new Date().toISOString();
      if (employeeId) {
        updates.hrms_employee_id = employeeId;
      }
    }

    if (notes) {
      updates.hrms_sync_notes = notes;
    }

    const { data: updatedData, error: updateErr } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', applicationId)
      .select('*')
      .single();

    if (updateErr) {
      console.error('[HRMS Ack Update Error]:', updateErr);

      logApiKeyUsageAsync({
        req,
        apiKeyId: effectiveKeyId,
        keyName: effectiveKeyName,
        keyPrefix: effectiveKeyPrefix,
        endpoint: '/api?route=hrms-ack',
        method: 'POST',
        statusCode: 500,
        responseTimeMs: Date.now() - startTime,
        errorMessage: updateErr.message,
      });

      return res.status(500).json({
        success: false,
        error: updateErr.message,
      });
    }

    logApiKeyUsageAsync({
      req,
      apiKeyId: effectiveKeyId,
      keyName: effectiveKeyName,
      keyPrefix: effectiveKeyPrefix,
      endpoint: '/api?route=hrms-ack',
      method: 'POST',
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
      summary: `ACK for ${existingApp.full_name || applicationId} -> Status: ${syncStatus}${employeeId ? ` (EmpID: ${employeeId})` : ''}`,
    });

    return res.status(200).json({
      success: true,
      message: 'HRMS sync status updated successfully',
      data: updatedData,
    });
  } catch (err: any) {
    console.error('[HRMS Ack Exception]:', err);

    logApiKeyUsageAsync({
      req,
      apiKeyId: effectiveKeyId,
      keyName: effectiveKeyName,
      keyPrefix: effectiveKeyPrefix,
      endpoint: '/api?route=hrms-ack',
      method: 'POST',
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
      errorMessage: err.message || 'Internal server error during HRMS acknowledgment',
    });

    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during HRMS acknowledgment',
    });
  }
}
