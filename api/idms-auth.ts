import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { account, password } = req.query;

  if (!account || !password) {
    return res.status(400).json({ error: 'Missing account or password' });
  }

  const idmsUrl = `https://mobiledev.advanceagro.net/ws/api/idms/authentication/?account=${encodeURIComponent(String(account))}&password=${encodeURIComponent(String(password))}&Service=0000&AgentId=SystemMango&AgentCode=Np4kfRh5`;

  try {
    const response = await fetch(idmsUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'Invalid response from IDMS', raw: text.substring(0, 200) });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('IDMS proxy error:', err);
    return res.status(502).json({ error: `IDMS unreachable: ${err.message}` });
  }
}
