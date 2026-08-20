import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { authorizeFileAccess, isAllowedStorageUrl } from '../server/file-access';
import { configureSameOrigin } from '../server/security';

const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-southeast-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 credentials are not fully configured in the environment.');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

const getContentType = (fileNameOrKey: string): string => {
  const ext = fileNameOrKey.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, url, download } = req.query;

  if (!key && !url) {
    return res.status(400).json({ error: 'Missing key or url parameter' });
  }

  try {
    // Mode A: Direct S3 Key Fetch (Highly Recommended)
    if (key && typeof key === 'string') {
      if (!await authorizeFileAccess(req, res, { key })) return;
      const s3 = getS3Client();
      const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await s3.send(command);

      if (!response.Body) {
        return res.status(404).json({ error: 'File body is empty' });
      }

      const contentType = response.ContentType || getContentType(key);
      const fileName = key.split('/').pop() || 'file';
      const dispositionType = download === 'true' ? 'attachment' : 'inline';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Private browser cache for 1 hour

      return (response.Body as Readable).pipe(res);
    }

    // Mode B: External URL Proxy Fallback (Cloudflare R2 or Supabase URL)
    if (url && typeof url === 'string') {
      const targetUrl = decodeURIComponent(url);
      if (!isAllowedStorageUrl(targetUrl)) return res.status(403).json({ error: 'Storage URL is not allowed' });
      if (!await authorizeFileAccess(req, res, { url: targetUrl })) return;

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch target file: ${response.statusText}` });
      }

      const contentType = response.headers.get('content-type') || getContentType(targetUrl);
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > 20 * 1024 * 1024) return res.status(413).json({ error: 'File exceeds proxy size limit' });
      const buffer = Buffer.from(arrayBuffer);

      const fileName = targetUrl.split('/').pop()?.split('?')[0] || 'file';
      const dispositionType = download === 'true' ? 'attachment' : 'inline';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');

      return res.send(buffer);
    }
  } catch (error: any) {
    console.error('[File Proxy Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to serve file' });
  }
}
