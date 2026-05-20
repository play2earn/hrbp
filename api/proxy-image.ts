import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

    // Validate that the URL belongs to either our R2 public domain or Supabase URL for security
    const isAllowed = 
      (publicDomain && url.startsWith(publicDomain)) || 
      (supabaseUrl && url.startsWith(supabaseUrl));

    if (!isAllowed) {
      return res.status(403).json({ error: 'Forbidden: URL domain is not allowed' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch image: ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    return res.send(buffer);
  } catch (error: any) {
    console.error('[Proxy Image Error]:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
