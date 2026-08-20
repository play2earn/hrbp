import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { configureSameOrigin, getActiveStaff, readSignedSession } from '../server/security.js';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error('R2 credentials are not fully configured');
  return new S3Client({
    region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const draftId = String(req.query.draftId || '');
  const key = String(req.query.key || '');
  if (!/^draft-[a-f0-9-]{20,50}$/i.test(draftId) || key !== key.replace(/\.\./g, '') || !key.startsWith(`drafts/${draftId}/`)) {
    return res.status(400).json({ error: 'Invalid draft file identifier' });
  }
  const draftSession = readSignedSession(req, 'draft');
  const staff = draftSession?.draftId === draftId ? null : await getActiveStaff(req);
  if (draftSession?.draftId !== draftId && !staff) {
    return res.status(403).json({ error: 'Invalid draft session or staff authentication required' });
  }

  try {
    const response = await getR2Client().send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'hrbp-applicants',
      Key: key,
    }));
    if (!response.Body) return res.status(404).json({ error: 'Draft file not found' });
    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(key.split('/').pop() || 'draft-file')}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return (response.Body as Readable).pipe(res);
  } catch (error: any) {
    console.error('[draft-files]', error?.message || error);
    return res.status(404).json({ error: 'Draft file not found' });
  }
}
