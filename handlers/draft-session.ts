import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, setSignedSession } from '../server/security';

const DRAFT_ID = /^draft-[a-f0-9-]{20,50}$/i;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const draftId = String(req.body?.draftId || '');
  if (!DRAFT_ID.test(draftId)) return res.status(400).json({ error: 'Invalid draft ID' });
  setSignedSession(res, 'draft', { draftId }, 2 * 60 * 60);
  return res.status(200).json({ success: true });
}
