import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { configureSameOrigin, requireStaff } from '../server/security.js';

const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-southeast-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 credentials missing in environment.');
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  const user = await requireStaff(req, res, ['admin']);
  if (!user) return;

  const s3 = getS3Client();
  const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';

  // GET: List items in Trash Bin (.trash/)
  if (req.method === 'GET') {
    try {
      const listCmd = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: '.trash/',
      });

      const response = await s3.send(listCmd);
      const items = (response.Contents || []).map((obj) => {
        const key = obj.Key || '';
        const name = key.split('/').pop() || key;
        const ext = name.split('.').pop()?.toLowerCase() || '';

        return {
          key,
          name,
          size: obj.Size || 0,
          lastModified: obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString(),
          extension: ext,
          provider: 's3',
          proxyUrl: `/api/files?key=${encodeURIComponent(key)}`,
        };
      });

      return res.status(200).json({
        success: true,
        items,
        total: items.length,
      });
    } catch (err: any) {
      console.error('[Trash API List Error]:', err);
      return res.status(500).json({ error: err.message || 'Failed to list trash items' });
    }
  }

  // POST: Actions (delete to trash, restore from trash, purge permanent)
  if (req.method === 'POST') {
    try {
      const { action, key } = req.body;

      if (!action || !key) {
        return res.status(400).json({ error: 'Missing action or key parameter' });
      }

      // Action 1: Soft-delete (Move file to .trash/)
      if (action === 'delete') {
        const cleanKey = key.replace(/^\//, '');
        const fileName = cleanKey.split('/').pop() || 'file';
        const trashKey = `.trash/${Date.now()}_${fileName}`;

        // 1. Copy object to .trash/
        await s3.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${encodeURIComponent(cleanKey)}`,
            Key: trashKey,
          })
        );

        // 2. Delete original object
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: cleanKey,
          })
        );

        console.log(`[Trash API] Soft-deleted: ${cleanKey} -> ${trashKey}`);

        return res.status(200).json({
          success: true,
          message: 'File moved to Trash Bin (.trash/)',
          trashKey,
        });
      }

      // Action 2: Restore from .trash/
      if (action === 'restore') {
        const trashKey = key.replace(/^\//, '');
        if (!trashKey.startsWith('.trash/')) {
          return res.status(400).json({ error: 'Item is not in trash bin' });
        }

        const fileName = trashKey.replace('.trash/', '').split('_').slice(1).join('_') || 'restored_file';
        const restoredKey = `hrd-documents/${fileName}`;

        // 1. Copy object back to hrd-documents/
        await s3.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${encodeURIComponent(trashKey)}`,
            Key: restoredKey,
          })
        );

        // 2. Remove from .trash/
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: trashKey,
          })
        );

        console.log(`[Trash API] Restored: ${trashKey} -> ${restoredKey}`);

        return res.status(200).json({
          success: true,
          message: 'File restored successfully',
          restoredKey,
        });
      }

      // Action 3: Permanent purge from .trash/
      if (action === 'purge') {
        const trashKey = key.replace(/^\//, '');
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: trashKey,
          })
        );

        console.log(`[Trash API] Permanently purged: ${trashKey}`);

        return res.status(200).json({
          success: true,
          message: 'File permanently deleted',
        });
      }

      return res.status(400).json({ error: `Unsupported action: ${action}` });
    } catch (err: any) {
      console.error('[Trash API Error]:', err);
      return res.status(500).json({ error: err.message || 'Trash operation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
