import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { configureSameOrigin, getAdminSupabase, requireDraftSession } from '../server/security.js';
import {
  getAttachmentStorageMode,
  permanentObjectUrl,
  possibleDraftUrls,
  replaceObjectReferences,
} from '../server/storage.js';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error('R2 credentials are not fully configured');
  return new S3Client({
    region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true,
  });
}

function getS3Client() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) throw new Error('AWS S3 credentials are not fully configured');
  return new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: { accessKeyId, secretAccessKey },
  });
}

function integerOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value).replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const draftId = String(req.body?.draftId || '');
    const applicationId = String(req.body?.applicationId || '');
    if (!draftId || !applicationId) return res.status(400).json({ error: 'Missing draftId or applicationId' });
    if (!requireDraftSession(req, res, draftId)) return;

    const supabase = getAdminSupabase();
    const { data: application, error: fetchError } = await supabase
      .from('applications').select('*').eq('id', applicationId).maybeSingle();
    if (fetchError || !application) return res.status(404).json({ error: 'Application not found' });

    const serializedApplication = JSON.stringify({
      form_data: application.form_data,
      photo_url: application.photo_url,
      resume_url: application.resume_url,
    });
    const rawDraftPrefix = `drafts/${draftId}/`;
    const encodedDraftPrefix = encodeURIComponent(rawDraftPrefix);
    if (!serializedApplication.includes(rawDraftPrefix) && !serializedApplication.includes(encodedDraftPrefix)) {
      return res.status(403).json({ error: 'This application is not linked to the supplied draft session' });
    }

    const attachmentMode = getAttachmentStorageMode();
    if (attachmentMode === 'r2-legacy' && !process.env.R2_PUBLIC_DOMAIN) {
      throw new Error('R2_PUBLIC_DOMAIN is required while ATTACHMENT_STORAGE_MODE=r2-legacy');
    }
    const r2Bucket = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
    const s3Bucket = process.env.AWS_S3_BUCKET || '';
    if (attachmentMode === 's3-primary' && !s3Bucket) throw new Error('AWS_S3_BUCKET is required for s3-primary mode');

    const r2 = getR2Client();
    const s3 = attachmentMode === 's3-primary' ? getS3Client() : null;
    const listResult = await r2.send(new ListObjectsV2Command({ Bucket: r2Bucket, Prefix: rawDraftPrefix }));
    const objects = (listResult.Contents || []).filter(object => Boolean(object.Key));
    if (!objects.length) return res.status(200).json({ success: true, provider: attachmentMode, finalizedCount: 0 });

    const finalizedKeys: string[] = [];
    const replacements: Array<{ from: string; to: string }> = [];
    let databaseCommitted = false;

    try {
      for (const object of objects) {
        const sourceKey = String(object.Key);
        const fileName = sourceKey.slice(rawDraftPrefix.length);
        if (!fileName || fileName.includes('..')) throw new Error('Invalid draft object key');
        const targetKey = `applicants/${applicationId}/${fileName}`;

        if (attachmentMode === 's3-primary') {
          const source = await r2.send(new GetObjectCommand({ Bucket: r2Bucket, Key: sourceKey }));
          if (!source.Body) throw new Error(`R2 draft object has no body: ${sourceKey}`);
          await s3!.send(new PutObjectCommand({
            Bucket: s3Bucket,
            Key: targetKey,
            Body: source.Body as any,
            ContentType: source.ContentType || 'application/octet-stream',
            Metadata: { source: 'hrbp-r2-draft' },
          }));
          finalizedKeys.push(targetKey);
          const verified = await s3!.send(new HeadObjectCommand({ Bucket: s3Bucket, Key: targetKey }));
          if (object.Size !== undefined && verified.ContentLength !== object.Size) {
            throw new Error(`S3 verification failed for ${targetKey}: size mismatch`);
          }
        } else {
          await r2.send(new CopyObjectCommand({
            Bucket: r2Bucket,
            CopySource: encodeURIComponent(`${r2Bucket}/${sourceKey}`),
            Key: targetKey,
          }));
          finalizedKeys.push(targetKey);
        }

        const destinationUrl = permanentObjectUrl(targetKey);
        for (const sourceUrl of possibleDraftUrls(draftId, sourceKey)) replacements.push({ from: sourceUrl, to: destinationUrl });
      }

      const updatedFormData = replaceObjectReferences(application.form_data || {}, replacements);
      let updatedPhotoUrl = replaceObjectReferences(application.photo_url, replacements);
      let updatedResumeUrl = replaceObjectReferences(application.resume_url, replacements);
      if (updatedFormData.photoUrl) updatedPhotoUrl = updatedFormData.photoUrl;
      if (updatedFormData.resumeUrl) updatedResumeUrl = updatedFormData.resumeUrl;

      const { error: updateError } = await supabase.from('applications').update({
        form_data: updatedFormData,
        photo_url: updatedPhotoUrl,
        resume_url: updatedResumeUrl,
        age: integerOrNull(updatedFormData.age),
        height: integerOrNull(updatedFormData.height),
        weight: integerOrNull(updatedFormData.weight),
        expected_salary: integerOrNull(updatedFormData.expectedSalary),
        date_of_birth: updatedFormData.dateOfBirth || null,
      }).eq('id', applicationId);
      if (updateError) throw new Error(`Application attachment update failed: ${updateError.message}`);
      databaseCommitted = true;

      const cleanupResults = await Promise.allSettled(objects.map(object =>
        r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: String(object.Key) }))
      ));
      const cleanupFailures = cleanupResults.filter(result => result.status === 'rejected').length;
      if (cleanupFailures) {
        console.warn(`[finalize-attachments] ${cleanupFailures} R2 draft object(s) remain for lifecycle cleanup`);
      }
      console.log(`[finalize-attachments] application=${applicationId} provider=${attachmentMode} count=${finalizedKeys.length}`);
      return res.status(200).json({
        success: true,
        provider: attachmentMode,
        finalizedCount: finalizedKeys.length,
        draftCleanupPending: cleanupFailures > 0,
        keys: finalizedKeys,
      });
    } catch (error) {
      if (!databaseCommitted) {
        await Promise.allSettled(finalizedKeys.map(key =>
          attachmentMode === 's3-primary'
            ? s3!.send(new DeleteObjectCommand({ Bucket: s3Bucket, Key: key }))
            : r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: key }))
        ));
      }
      throw error;
    }

  } catch (error: any) {
    console.error('[finalize-attachments]', error?.message || error);
    return res.status(500).json({ error: error.message || 'Attachment finalization failed' });
  }
}
