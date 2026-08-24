import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, setSignedSession } from '../server/security.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { account, password } = req.body || {};

  if (!account || !password) {
    return res.status(400).json({ error: 'Missing account or password' });
  }

  const agentCode = process.env.IDMS_AGENT_CODE;
  if (!agentCode) return res.status(500).json({ error: 'IDMS integration is not configured' });
  const idmsUrl = `https://mobiledev.advanceagro.net/ws/api/idms/authentication/?account=${encodeURIComponent(String(account))}&password=${encodeURIComponent(String(password))}&Service=0000&AgentId=SystemMango&AgentCode=${encodeURIComponent(agentCode)}`;

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
      return res.status(502).json({ error: 'Invalid response from IDMS' });
    }

    if (data?.Result === 'OK' && data?.EmpId) {
      setSignedSession(res, 'hrms', {
        empId: String(data.EmpId),
        account: String(account).trim(),
      }, 15 * 60);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('IDMS proxy error:', err);
    return res.status(502).json({ error: `IDMS unreachable: ${err.message}` });
  }
}
