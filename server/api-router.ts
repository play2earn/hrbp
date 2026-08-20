import type { VercelRequest, VercelResponse } from '@vercel/node';

export type ApiHandler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>;

const ROUTE_ALIASES: Record<string, string> = {
  'upload-r2': 'upload-s3',
  'migrate-s3': 's3-explorer',
};

export function resolveApiRoute(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const route = raw.trim().replace(/^\/+|\/+$/g, '');
  if (!/^[a-z0-9-]+$/i.test(route)) return null;
  return ROUTE_ALIASES[route] || route;
}

export async function dispatchApiRoute(
  req: VercelRequest,
  res: VercelResponse,
  handlers: Record<string, ApiHandler>,
) {
  const route = resolveApiRoute(req.query.route);
  const handler = route ? handlers[route] : undefined;
  if (!handler) return res.status(404).json({ error: 'API endpoint not found' });
  return handler(req, res);
}
