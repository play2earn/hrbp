import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      const buffer = await streamToBuffer(response.Body as Readable);

      const fileName = key.split('/').pop() || 'file';
      const dispositionType = download === 'true' ? 'attachment' : 'inline';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Private browser cache for 1 hour

      return res.send(buffer);
    }

    // Mode B: External URL Proxy Fallback (Cloudflare R2 or Supabase URL)
    if (url && typeof url === 'string') {
      const targetUrl = decodeURIComponent(url);

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch target file: ${response.statusText}` });
      }

      const contentType = response.headers.get('content-type') || getContentType(targetUrl);
      const arrayBuffer = await response.arrayBuffer();
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
