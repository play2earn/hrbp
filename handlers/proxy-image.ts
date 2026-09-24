import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authorizeFileAccess, isAllowedStorageUrl } from '../server/file-access.js';
import { configureSameOrigin } from '../server/security.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    if (!isAllowedStorageUrl(url)) return res.status(403).json({ error: 'Forbidden: URL domain is not allowed' });
    if (!await authorizeFileAccess(req, res, { url })) return;

    // Direct 302 Redirect to target storage URL (0 bytes Vercel bandwidth)
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return res.redirect(302, url);
  } catch (error: any) {
    console.error('[Proxy Image Error]:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }

}
