import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authorizeFileAccess, isAllowedStorageUrl } from '../server/file-access.js';
import { configureSameOrigin } from '../server/security.js';

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
    // Mode A: Direct S3 Key with Presigned URL (0 bytes Vercel Origin Bandwidth)
    if (key && typeof key === 'string') {
      if (!await authorizeFileAccess(req, res, { key })) return;
      const s3 = getS3Client();
      const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';

      const fileName = key.split('/').pop() || 'file';
      const dispositionType = download === 'true' ? 'attachment' : 'inline';
      const contentType = getContentType(key);

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
        ResponseContentType: contentType,
        ResponseContentDisposition: `${dispositionType}; filename="${encodeURIComponent(fileName)}"`,
      });

      // Generate Presigned URL valid for 15 minutes
      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

      // Direct 302 Redirect: Browser downloads straight from AWS S3 CDN
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return res.redirect(302, presignedUrl);
    }

    // Mode B: External URL Direct Redirect (Cloudflare R2 or Supabase URL)
    if (url && typeof url === 'string') {
      const targetUrl = decodeURIComponent(url);
      if (!isAllowedStorageUrl(targetUrl)) return res.status(403).json({ error: 'Storage URL is not allowed' });
      if (!await authorizeFileAccess(req, res, { url: targetUrl })) return;

      // Direct 302 Redirect: Browser downloads straight from Cloudflare R2 / Storage Provider
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return res.redirect(302, targetUrl);
    }

  } catch (error: any) {
    console.error('[File Proxy Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to serve file' });
  }
}
