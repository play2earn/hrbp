import type { VercelRequest } from '@vercel/node';

function firstHeader(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] || '' : value || '';
  return raw.split(',')[0].trim();
}

function requestOrigin(req: VercelRequest, env: NodeJS.ProcessEnv): string {
  const host = firstHeader(req.headers['x-forwarded-host']) || firstHeader(req.headers.host);
  if (!host || /[\s/\\]/.test(host)) throw new Error('Unable to determine a valid request host');
  const forwardedProto = firstHeader(req.headers['x-forwarded-proto']);
  const protocol = forwardedProto === 'http' && env.NODE_ENV !== 'production' ? 'http' : 'https';
  return new URL(`${protocol}://${host}`).origin;
}

export function publicAppOrigin(req: VercelRequest, env: NodeJS.ProcessEnv = process.env): string {
  const currentOrigin = requestOrigin(req, env);
  const configuredValue = String(env.APP_ORIGIN || '').replace(/^['"]|['"]$/g, '').replace(/\/$/, '').trim();

  if (!configuredValue || env.NODE_ENV !== 'production' || env.VERCEL_ENV === 'preview') {
    return currentOrigin;
  }

  const configuredOrigin = new URL(configuredValue).origin;
  if (env.VERCEL_ENV === 'production') return configuredOrigin;
  const currentHost = new URL(currentOrigin).hostname;
  const configuredHost = new URL(configuredOrigin).hostname;

  if (currentHost === configuredHost) return configuredOrigin;
  if (currentHost.endsWith('.vercel.app')) return currentOrigin;
  return configuredOrigin;
}
