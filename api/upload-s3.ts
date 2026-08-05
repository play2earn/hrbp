import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-southeast-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 credentials missing.');
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB limit

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const s3 = getS3Client();
    const { fileBase64, fileName, fileType, folder, applicantId, fieldName, overwrite } = req.body;

    if (!fileBase64 || !fileName || !fileType) {
      return res.status(400).json({ error: 'Missing fileBase64, fileName, or fileType' });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ error: `File type ${fileType} is not supported` });
    }

    const fileBuffer = Buffer.from(fileBase64, 'base64');
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({ error: 'File size exceeds 15MB limit' });
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    let s3Key = '';

    // Deterministic key for candidate field replacement vs random upload
    if (applicantId && fieldName) {
      const cleanAppId = String(applicantId).trim();
      s3Key = `applicants/${cleanAppId}/${fieldName}.${ext}`;
    } else if (applicantId) {
      const cleanAppId = String(applicantId).trim();
      s3Key = `applicants/${cleanAppId}/${randomUUID()}-${Date.now()}.${ext}`;
    } else {
      const cleanFolder = (folder || 'hrd-documents').trim().replace(/^\/|\/$/g, '');
      const name = overwrite ? fileName : `${randomUUID()}-${Date.now()}.${ext}`;
      s3Key = `${cleanFolder}/${name}`;
    }

    const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';

    // PutObject to S3 (Atomic overwrite if key exists)
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: fileType,
      })
    );

    // Cache-Busting Proxy URL with Version Timestamp Tag
    const proxyUrl = `/api/files?key=${encodeURIComponent(s3Key)}&v=${Date.now()}`;

    // Sync to Supabase DB if applicantId & fieldName are provided
    if (applicantId && fieldName) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: appData } = await supabase
          .from('applications')
          .select('photo_url, resume_url, form_data')
          .eq('id', applicantId)
          .single();

        if (appData) {
          const updatePayload: Record<string, any> = {};

          if (fieldName === 'photo_url' || fieldName === 'photoUrl') {
            updatePayload.photo_url = proxyUrl;
          }
          if (fieldName === 'resume_url' || fieldName === 'resumeUrl') {
            updatePayload.resume_url = proxyUrl;
          }

          const updatedFd = { ...(appData.form_data || {}), [fieldName]: proxyUrl };
          const aliasMap: Record<string, string[]> = {
            photo_url: ['photo_url', 'photoUrl'],
            photoUrl: ['photo_url', 'photoUrl'],
            resume_url: ['resume_url', 'resumeUrl'],
            resumeUrl: ['resume_url', 'resumeUrl'],
            transcriptUrl: ['transcriptUrl', 'transcript_url'],
            idCardUrl: ['idCardUrl', 'id_card_url'],
            houseRegUrl: ['houseRegUrl', 'house_reg_url'],
            eduCertificateUrl: ['eduCertificateUrl', 'edu_certificate_url'],
            militaryCertUrl: ['militaryCertUrl', 'military_cert_url'],
            toeicCertUrl: ['toeicCertUrl', 'toeic_cert_url'],
            bankBookUrl: ['bankBookUrl', 'bank_book_url'],
            certificateUrl: ['certificateUrl', 'certificate_url'],
            otherDocsUrl: ['otherDocsUrl', 'other_docs_url'],
          };

          const aliases = aliasMap[fieldName] || [fieldName];
          aliases.forEach((aliasKey) => {
            updatedFd[aliasKey] = proxyUrl;
          });

          updatePayload.form_data = updatedFd;
          await supabase.from('applications').update(updatePayload).eq('id', applicantId);
        }
      }
    }

    console.log(`[AWS S3 Upload / Replace Success] Key: ${s3Key}, Size: ${fileBuffer.length} bytes`);

    return res.status(200).json({
      success: true,
      key: s3Key,
      bucket: bucketName,
      provider: 's3',
      proxyUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('[AWS S3 Upload Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload file to S3' });
  }
}
