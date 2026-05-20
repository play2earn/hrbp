import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const getR2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not fully configured in the environment.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const r2 = getR2Client();
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing required url parameter' });
    }

    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    if (!publicDomain) {
      throw new Error('R2_PUBLIC_DOMAIN is not defined in the environment.');
    }

    // Extract fileName/key from R2 public URL
    // Handle both with trailing slash or without in R2_PUBLIC_DOMAIN
    const domainPattern = publicDomain.endsWith('/') ? publicDomain : `${publicDomain}/`;
    let key = '';

    if (url.startsWith(domainPattern)) {
      key = url.slice(domainPattern.length);
    } else {
      // Fallback extraction by parsing the pathname
      try {
        const parsedUrl = new URL(url);
        key = parsedUrl.pathname.slice(1); // Remove leading slash
      } catch (err) {
        return res.status(400).json({ error: `Invalid R2 URL: ${url}` });
      }
    }

    if (!key) {
      return res.status(400).json({ error: 'Could not resolve R2 key from URL' });
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';

    // Delete object from Cloudflare R2
    await r2.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));

    console.log(`[R2 Delete Success] Key: ${key}`);

    return res.status(200).json({ success: true, key });

  } catch (error: any) {
    console.error('[R2 Delete Error]:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error during R2 delete'
    });
  }
}
