import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authorizeFileAccess, isAllowedStorageUrl } from '../server/file-access';
import { configureSameOrigin } from '../server/security';

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

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch image: ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 20 * 1024 * 1024) return res.status(413).json({ error: 'Image exceeds proxy size limit' });
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.send(buffer);
  } catch (error: any) {
    console.error('[Proxy Image Error]:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
