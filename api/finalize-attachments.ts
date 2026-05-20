import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { draftId, applicationId } = req.body;

    if (!draftId || !applicationId) {
      return res.status(400).json({ error: 'Missing draftId or applicationId in request body' });
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!publicDomain) {
      throw new Error('R2_PUBLIC_DOMAIN is not defined in the environment.');
    }

    const r2 = getR2Client();

    // 1. List all temporary draft files under the drafts/{draftId}/ prefix
    const draftPrefix = `drafts/${draftId}/`;
    const listResult = await r2.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: draftPrefix,
    }));

    const objects = listResult.Contents || [];
    console.log(`[R2 Finalize] Found ${objects.length} files to finalize for draft ${draftId}`);

    if (objects.length === 0) {
      // If no files are found in R2 drafts, it means either:
      // a) The client failed back to Supabase and uploaded nothing to R2 drafts.
      // b) No files were selected for upload.
      // We can safely treat this as a no-op success.
      return res.status(200).json({ success: true, finalizedCount: 0, message: 'No draft files found in R2' });
    }

    const finalizedKeys: string[] = [];

    // 2. Loop through and copy each file to applications/{applicationId}/ and delete the original draft file in parallel
    const finalizePromises = objects.map(async (obj) => {
      if (!obj.Key) return;

      const fileName = obj.Key.substring(draftPrefix.length);
      if (!fileName) return;

      const targetKey = `applications/${applicationId}/${fileName}`;

      // Copy in R2 (performed extremely fast inside Cloudflare data centers)
      await r2.send(new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: encodeURIComponent(`${bucketName}/${obj.Key}`),
        Key: targetKey,
      }));

      // Delete the original draft file
      await r2.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: obj.Key,
      }));

      finalizedKeys.push(targetKey);
      console.log(`[R2 Finalize] Finalized: ${obj.Key} -> ${targetKey}`);
    });

    await Promise.all(finalizePromises);

    // 3. Connect to Supabase to update URLs in the DB
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'x-admin-key': 'vibe-recruit-admin-secret-2026'
        }
      }
    });

    // Fetch the application row
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch application row: ${fetchError.message}`);
    }

    if (application) {
      let updatedFormData = application.form_data;
      let updatedPhotoUrl = application.photo_url;
      let updatedResumeUrl = application.resume_url;

      // Replace draft path with final path in JSON stringified form_data to handle all nested URLs generically
      if (updatedFormData) {
        let formDataStr = JSON.stringify(updatedFormData);
        // Replace all occurrences of drafts/{draftId}/ with applications/{applicationId}/
        const findStr = `drafts/${draftId}/`;
        const replaceStr = `applications/${applicationId}/`;
        formDataStr = formDataStr.split(findStr).join(replaceStr);
        updatedFormData = JSON.parse(formDataStr);
      }

      // Sync root columns with values from updatedFormData
      if (updatedFormData) {
        if (updatedFormData.photoUrl) {
          updatedPhotoUrl = updatedFormData.photoUrl;
        }
        if (updatedFormData.resumeUrl) {
          updatedResumeUrl = updatedFormData.resumeUrl;
        }
      }

      // Fallback: Replace in main photo_url/resume_url columns if they contain the draft prefix
      if (updatedPhotoUrl && updatedPhotoUrl.includes(`drafts/${draftId}/`)) {
        updatedPhotoUrl = updatedPhotoUrl.split(`drafts/${draftId}/`).join(`applications/${applicationId}/`);
      }
      if (updatedResumeUrl && updatedResumeUrl.includes(`drafts/${draftId}/`)) {
        updatedResumeUrl = updatedResumeUrl.split(`drafts/${draftId}/`).join(`applications/${applicationId}/`);
      }

      // Extract relational columns from updatedFormData
      const age = updatedFormData?.age ? parseInt(updatedFormData.age) : null;
      const height = updatedFormData?.height ? parseInt(updatedFormData.height) : null;
      const weight = updatedFormData?.weight ? parseInt(updatedFormData.weight) : null;
      const expected_salary = updatedFormData?.expectedSalary ? parseInt(updatedFormData.expectedSalary) : null;
      const date_of_birth = updatedFormData?.dateOfBirth || null;

      // Update the database record
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          form_data: updatedFormData,
          photo_url: updatedPhotoUrl,
          resume_url: updatedResumeUrl,
          age: isNaN(Number(age)) ? null : age,
          height: isNaN(Number(height)) ? null : height,
          weight: isNaN(Number(weight)) ? null : weight,
          expected_salary: isNaN(Number(expected_salary)) ? null : expected_salary,
          date_of_birth
        })
        .eq('id', applicationId);

      if (updateError) {
        throw new Error(`Failed to update application record with finalized URLs: ${updateError.message}`);
      }

      console.log(`[R2 Finalize Success] DB updated for application ID: ${applicationId}`);
    }

    return res.status(200).json({
      success: true,
      finalizedCount: finalizedKeys.length,
      keys: finalizedKeys
    });

  } catch (error: any) {
    console.error('[R2 Finalize Error]:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error during attachment finalization'
    });
  }
}
