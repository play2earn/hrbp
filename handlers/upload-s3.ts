import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { configureSameOrigin, requireDraftSession, requireResubmitSession, requireStaff } from '../server/security.js';
import { draftObjectUrl, getDraftAccessMode } from '../server/storage.js';

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
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  if (!configureSameOrigin(req, res, 'POST, DELETE')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Handle R2 DELETE operations
  if (req.method === 'DELETE' || req.body?.action === 'delete-r2') {
    try {
      const user = await requireStaff(req, res, ['admin']);
      if (!user) return;
      const r2 = getR2Client();
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: 'Missing required url parameter' });

      const publicDomain = process.env.R2_PUBLIC_DOMAIN;
      let key = '';
      if (String(url).startsWith('/api/draft-files?')) {
        key = new URL(String(url), 'https://hrbp.invalid').searchParams.get('key') || '';
      } else if (publicDomain) {
        const domainPattern = publicDomain.endsWith('/') ? publicDomain : `${publicDomain}/`;
        if (String(url).startsWith(domainPattern)) key = String(url).slice(domainPattern.length);
      }
      if (!key || key.includes('..') || !/^(drafts|applicants|photos|applications)\//.test(key)) {
        return res.status(400).json({ error: 'Could not resolve an allowed R2 key from URL' });
      }

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
    const { fileBase64, fileName, fileType, folder, applicantId, fieldName, overwrite, draftId, resubmitToken } = req.body;

    if (draftId) {
      if (!requireDraftSession(req, res, String(draftId))) return;
    } else if (resubmitToken && applicantId && fieldName) {
      if (!requireResubmitSession(req, res, String(resubmitToken), String(applicantId), String(fieldName))) return;
    } else {
      const user = await requireStaff(req, res);
      if (!user) return;
    }

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

    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
      'application/pdf': 'pdf', 'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    };
    const safeExt = extensionByType[fileType] || 'bin';

    // If draftId is present, handle via R2 draft storage
    if (draftId && draftId.startsWith('draft-')) {
      const r2 = getR2Client();
      const uniqueName = `${randomUUID()}-${Date.now()}.${safeExt}`;
      const r2Key = `drafts/${draftId}/${uniqueName}`;
      const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
      await r2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: fileType,
        })
      );

      return res.status(200).json({
        success: true,
        url: draftObjectUrl(String(draftId), r2Key),
        key: r2Key,
        provider: 'r2',
        accessMode: getDraftAccessMode(),
      });
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
      bankBookUrl_scb: 'bankBookUrl',
      bankBookUrl_ktb: 'bankBookUrl',
      certificate_url: 'certificateUrl',
      certificateUrl: 'certificateUrl',
      other_docs_url: 'otherDocsUrl',
      otherDocsUrl: 'otherDocsUrl',
    };

    const targetFieldName = (fieldName && CANONICAL_FIELD_MAP[fieldName]) ? CANONICAL_FIELD_MAP[fieldName] : fieldName;

    if (applicantId && targetFieldName) {
      const cleanAppId = String(applicantId).trim();
      if (!/^[a-f0-9-]{20,50}$/i.test(cleanAppId) || !targetFieldName || !Object.values(CANONICAL_FIELD_MAP).includes(targetFieldName)) {
        return res.status(400).json({ error: 'Invalid applicant or document field' });
      }
      s3Key = `applicants/${cleanAppId}/${targetFieldName}.${safeExt}`;
    } else if (applicantId) {
      const cleanAppId = String(applicantId).trim();
      if (!/^[a-f0-9-]{20,50}$/i.test(cleanAppId)) return res.status(400).json({ error: 'Invalid applicant ID' });
      s3Key = `applicants/${cleanAppId}/${randomUUID()}-${Date.now()}.${safeExt}`;
    } else {
      const cleanFolder = (folder || 'hrd-documents').trim().replace(/^\/|\/$/g, '');
      if (!/^[a-zA-Z0-9/_-]{1,120}$/.test(cleanFolder) || cleanFolder.includes('..')) {
        return res.status(400).json({ error: 'Invalid storage folder' });
      }
      const safeFileBase = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const name = overwrite ? safeFileBase : `${randomUUID()}-${Date.now()}.${safeExt}`;
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
          const { error: updateError } = await supabase.from('applications').update(updatePayload).eq('id', applicantId);
          if (updateError) throw new Error(`S3 upload completed but application update failed: ${updateError.message}`);
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
