import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-southeast-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 credentials are not fully configured in environment.');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase configuration missing in environment.');
  }

  return createClient(supabaseUrl, serviceKey);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { fileUrl, targetFolder, applicationId, fieldName } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'Missing fileUrl in request body' });
    }

    // Step 1: Download target file from R2 or Supabase URL
    console.log(`[Migration] Fetching source file from: ${fileUrl}`);
    const fetchRes = await fetch(fileUrl);
    if (!fetchRes.ok) {
      return res.status(400).json({ error: `Failed to download source file: ${fetchRes.statusText}` });
    }

    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await fetchRes.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Extract filename cleanly
    const rawFileName = fileUrl.split('/').pop()?.split('?')[0] || `file-${Date.now()}`;
    const cleanFileName = decodeURIComponent(rawFileName);

    // Extract extension
    const ext = cleanFileName.split('.').pop()?.toLowerCase() || 'bin';

    // Step 2: Determine S3 Key
    let s3Key = '';
    if (applicationId) {
      const targetName = fieldName ? `${fieldName}.${ext}` : cleanFileName;
      s3Key = `applicants/${applicationId}/${targetName}`;
    } else {
      const folder = (targetFolder || 'hrd-documents').replace(/^\/|\/$/g, '');
      s3Key = `${folder}/${cleanFileName}`;
    }

    const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';
    const s3 = getS3Client();

    // Step 3: PutObject to AWS S3
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    // Step 4: Verification Check via HeadObject
    const headResult = await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      })
    );

    if (headResult.ContentLength !== fileBuffer.length) {
      throw new Error(`Size mismatch after upload to S3. Expected ${fileBuffer.length}, got ${headResult.ContentLength}`);
    }

    const proxyUrl = `/api/files?key=${encodeURIComponent(s3Key)}`;

    // Step 5: Update Supabase DB Record if applicationId and fieldName are provided
    if (applicationId && fieldName) {
      const supabase = getSupabaseClient();

      const { data: appData } = await supabase
        .from('applications')
        .select('photo_url, resume_url, form_data')
        .eq('id', applicationId)
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

        const { error: dbError } = await supabase
          .from('applications')
          .update(updatePayload)
          .eq('id', applicationId);

        if (dbError) {
          console.error(`[Migration DB Update Error]:`, dbError.message);
        }
      }
    }

    console.log(`[Migration SUCCESS] Migrated ${fileUrl} -> S3 (${s3Key})`);

    return res.status(200).json({
      success: true,
      oldUrl: fileUrl,
      newKey: s3Key,
      newProxyUrl: proxyUrl,
      size: fileBuffer.length,
      provider: 's3',
    });
  } catch (error: any) {
    console.error('[AWS S3 Migration Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to migrate file to S3' });
  }
}
