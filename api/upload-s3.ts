import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

const getR2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not fully configured.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Handle R2 DELETE operations
  if (req.method === 'DELETE' || req.body?.action === 'delete-r2') {
    try {
      const r2 = getR2Client();
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: 'Missing required url parameter' });

      const publicDomain = process.env.R2_PUBLIC_DOMAIN;
      if (!publicDomain) throw new Error('R2_PUBLIC_DOMAIN is not defined in environment.');

      const domainPattern = publicDomain.endsWith('/') ? publicDomain : `${publicDomain}/`;
      let key = '';
      if (url.startsWith(domainPattern)) {
        key = url.slice(domainPattern.length);
      } else {
        try {
          const parsedUrl = new URL(url);
          key = parsedUrl.pathname.slice(1);
        } catch {
          return res.status(400).json({ error: `Invalid R2 URL: ${url}` });
        }
      }

      if (!key) return res.status(400).json({ error: 'Could not resolve R2 key from URL' });

      const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
      await r2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));

      console.log(`[R2 Delete Success] Key: ${key}`);
      return res.status(200).json({ success: true, key });
    } catch (error: any) {
      console.error('[R2 Delete Error]:', error);
      return res.status(500).json({ error: error.message || 'R2 delete error' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileBase64, fileName, fileType, folder, applicantId, fieldName, overwrite, draftId } = req.body;

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
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext) ? ext : 'bin';

    // If draftId is present, handle via R2 draft storage
    if (draftId && draftId.startsWith('draft-')) {
      const r2 = getR2Client();
      const uniqueName = `${randomUUID()}-${Date.now()}.${safeExt}`;
      const r2Key = `drafts/${draftId}/${uniqueName}`;
      const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
      const publicDomain = process.env.R2_PUBLIC_DOMAIN;

      if (!publicDomain) throw new Error('R2_PUBLIC_DOMAIN missing.');

      await r2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: fileType,
        })
      );

      const normalizedDomain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain;
      const publicUrl = `${normalizedDomain}/${r2Key}`;

      return res.status(200).json({ success: true, url: publicUrl, key: r2Key });
    }

    // Standard AWS S3 Upload
    const s3 = getS3Client();
    let s3Key = '';

    const CANONICAL_FIELD_MAP: Record<string, string> = {
      photo_url: 'photoUrl',
      photoUrl: 'photoUrl',
      resume_url: 'resumeUrl',
      resumeUrl: 'resumeUrl',
      transcript_url: 'transcriptUrl',
      transcriptUrl: 'transcriptUrl',
      id_card_url: 'idCardUrl',
      idCardUrl: 'idCardUrl',
      house_reg_url: 'houseRegUrl',
      houseRegUrl: 'houseRegUrl',
      edu_certificate_url: 'eduCertificateUrl',
      eduCertificateUrl: 'eduCertificateUrl',
      military_cert_url: 'militaryCertUrl',
      militaryCertUrl: 'militaryCertUrl',
      toeic_cert_url: 'toeicCertUrl',
      toeicCertUrl: 'toeicCertUrl',
      bank_book_url: 'bankBookUrl',
      bankBookUrl: 'bankBookUrl',
      certificate_url: 'certificateUrl',
      certificateUrl: 'certificateUrl',
      other_docs_url: 'otherDocsUrl',
      otherDocsUrl: 'otherDocsUrl',
    };

    const targetFieldName = (fieldName && CANONICAL_FIELD_MAP[fieldName]) ? CANONICAL_FIELD_MAP[fieldName] : fieldName;

    if (applicantId && targetFieldName) {
      const cleanAppId = String(applicantId).trim();
      s3Key = `applicants/${cleanAppId}/${targetFieldName}.${ext}`;
    } else if (applicantId) {
      const cleanAppId = String(applicantId).trim();
      s3Key = `applicants/${cleanAppId}/${randomUUID()}-${Date.now()}.${ext}`;
    } else {
      const cleanFolder = (folder || 'hrd-documents').trim().replace(/^\/|\/$/g, '');
      const name = overwrite ? fileName : `${randomUUID()}-${Date.now()}.${ext}`;
      s3Key = `${cleanFolder}/${name}`;
    }

    const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: fileType,
      })
    );

    const proxyUrl = `/api/files?key=${encodeURIComponent(s3Key)}&v=${Date.now()}`;

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

    console.log(`[AWS S3 Upload Success] Key: ${s3Key}, Size: ${fileBuffer.length} bytes`);

    return res.status(200).json({
      success: true,
      key: s3Key,
      bucket: bucketName,
      provider: 's3',
      proxyUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('[Upload Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
}
