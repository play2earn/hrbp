import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// Initialize R2 client lazily to avoid throwing errors during cold starts if env vars are missing
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

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB default guardrail

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const r2 = getR2Client();
    const { fileBase64, fileName, fileType, folder, draftId } = req.body;

    if (!fileBase64 || !fileName || !fileType) {
      return res.status(400).json({ error: 'Missing required file data in request body' });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ error: `File type ${fileType} is not allowed` });
    }

    // Convert base64 to binary buffer
    const fileBuffer = Buffer.from(fileBase64, 'base64');

    if (fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    // Extract file extension cleanly
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext) ? ext : 'bin';

    // Construct path: if draftId is supplied, use drafts/{draftId}/{uuid}.{ext}
    const cleanFolder = (folder || 'temp').trim();
    let s3Key = '';
    const uniqueName = `${randomUUID()}-${Date.now()}.${safeExt}`;

    if (draftId && draftId.startsWith('draft-')) {
      s3Key = `drafts/${draftId}/${uniqueName}`;
    } else {
      s3Key = `${cleanFolder}/${uniqueName}`;
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!publicDomain) {
      throw new Error('R2_PUBLIC_DOMAIN is not defined in the environment.');
    }

    // Upload to Cloudflare R2
    await r2.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: fileType,
    }));

    // Normalize public domain (ensure no trailing slash)
    const normalizedDomain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain;
    const publicUrl = `${normalizedDomain}/${s3Key}`;

    console.log(`[R2 Upload Success] File: ${s3Key}, Type: ${fileType}, Size: ${fileBuffer.length} bytes`);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      key: s3Key
    });

  } catch (error: any) {
    console.error('[R2 Upload Error]:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error during R2 upload'
    });
  }
}
