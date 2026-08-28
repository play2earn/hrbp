import type { VercelRequest } from '@vercel/node';
import { getAdminSupabase } from './security.js';

export interface LogApiKeyUsageParams {
  req: VercelRequest;
  apiKeyId?: string | null;
  keyPrefix?: string | null;
  keyName?: string | null;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs?: number;
  queryParams?: Record<string, any>;
  summary?: string;
  errorMessage?: string | null;
}

/**
 * Extracts client IP safely from Vercel/proxy headers
 */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return raw.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') return realIp.trim();
  return (req.socket?.remoteAddress || 'unknown').replace(/^::ffff:/, '');
}

/**
 * Extracts User-Agent string
 */
export function getUserAgent(req: VercelRequest): string {
  const ua = req.headers['user-agent'];
  if (!ua) return 'unknown';
  return Array.isArray(ua) ? ua[0] : ua;
}

/**
 * Logs API request usage asynchronously without blocking API response
 */
export function logApiKeyUsageAsync(params: LogApiKeyUsageParams): void {
  // Execute in background without awaiting to avoid adding latency
  Promise.resolve().then(async () => {
    try {
      const supabase = getAdminSupabase();
      const ip = getClientIp(params.req);
      const userAgent = getUserAgent(params.req);

      // Sanitize query params (remove raw api keys if present in query)
      const sanitizedParams: Record<string, any> = {};
      if (params.queryParams) {
        Object.entries(params.queryParams).forEach(([k, v]) => {
          if (/key|secret|token|password/i.test(k)) {
            sanitizedParams[k] = '••••••••';
          } else {
            sanitizedParams[k] = v;
          }
        });
      }

      await supabase.from('system_api_key_logs').insert([{
        api_key_id: params.apiKeyId || null,
        key_prefix: params.keyPrefix || null,
        key_name: params.keyName || (params.apiKeyId ? 'Registered API Key' : 'Unauthenticated / Invalid Key'),
        endpoint: params.endpoint,
        http_method: params.method.toUpperCase(),
        status_code: params.statusCode,
        ip_address: ip,
        user_agent: userAgent,
        response_time_ms: params.responseTimeMs ? Math.round(params.responseTimeMs) : null,
        query_params: sanitizedParams,
        summary: params.summary || null,
        error_message: params.errorMessage || null,
        created_at: new Date().toISOString(),
      }]);
    } catch (err) {
      // Fire-and-forget logging: do not crash API process if log insert fails
      console.error('[API Key Logger Error]:', err);
    }
  }).catch(() => {});
}
