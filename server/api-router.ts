import type { VercelRequest, VercelResponse } from '@vercel/node';

export type ApiHandler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>;
export type ApiHandlerLoader = () => Promise<{ default: ApiHandler }>;

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
  handlers: Record<string, ApiHandlerLoader>,
) {
  const route = resolveApiRoute(req.query.route);
  const loadHandler = route ? handlers[route] : undefined;
  if (!loadHandler) return res.status(404).json({ error: 'API endpoint not found' });

  let handler: ApiHandler;
  try {
    handler = (await loadHandler()).default;
  } catch (error) {
    console.error(`Failed to load API handler: ${route}`, error);
    return res.status(500).json({ error: 'API handler failed to initialize', code: 'API_HANDLER_INIT_FAILED' });
  }
  return handler(req, res);
}
