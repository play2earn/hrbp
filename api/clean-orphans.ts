import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

  // Authorize: accept either Vercel Cron authentication header or the admin key
  const authHeader = req.headers.authorization;
  const adminKey = req.query.key || req.headers['x-admin-key'];
  const expectedAdminKey = 'vibe-recruit-admin-secret-2026';
  
  const isCron = authHeader?.startsWith('Bearer ');
  const isAdmin = adminKey === expectedAdminKey;

  if (!isCron && !isAdmin && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized access to orphan cleanup api' });
  }

  try {
    const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!publicDomain) {
      throw new Error('R2_PUBLIC_DOMAIN is not defined in the environment.');
    }

    const r2 = getR2Client();

    // 1. Fetch all active files/URLs from Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'x-admin-key': expectedAdminKey
        }
      }
    });

    const { data: applications, error: dbError } = await supabase
      .from('applications')
      .select('photo_url, resume_url, form_data');

    if (dbError) {
      throw new Error(`Database fetch failed: ${dbError.message}`);
    }

    // 2. Build a Set of all active R2 keys referenced in the database
    const activeKeys = new Set<string>();
    const domainPattern = publicDomain.endsWith('/') ? publicDomain : `${publicDomain}/`;

    const extractKeyFromUrl = (url: string | undefined | null): string | null => {
      if (!url || !url.startsWith(domainPattern)) return null;
      return url.slice(domainPattern.length);
    };

    if (applications) {
      for (const app of applications) {
        // Direct columns
        const photoKey = extractKeyFromUrl(app.photo_url);
        if (photoKey) activeKeys.add(photoKey);

        const resumeKey = extractKeyFromUrl(app.resume_url);
        if (resumeKey) activeKeys.add(resumeKey);

        // Nested form_data URLs
        const fd = app.form_data;
        if (fd) {
          const urls = [
            fd.photoUrl,
            fd.originalPhotoUrl,
            fd.resumeUrl,
            fd.certificateUrl,
            fd.transcriptUrl,
            fd.otherDocsUrl
          ];
          for (const url of urls) {
            const key = extractKeyFromUrl(url);
            if (key) activeKeys.add(key);
          }
        }
      }
    }

    // 3. Scan the R2 bucket for files in target prefixes: 'photos/' and 'applications/'
    const prefixes = ['photos/', 'applications/'];
    const orphanedKeys: string[] = [];
    let totalScanned = 0;

    // Safety margin: only delete files older than 1 hour (3600 seconds)
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;

    for (const prefix of prefixes) {
      let isTruncated = true;
      let continuationToken: string | undefined = undefined;

      while (isTruncated) {
        const listResult = await r2.send(new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken
        }));

        const objects = listResult.Contents || [];
        totalScanned += objects.length;

        for (const obj of objects) {
          if (!obj.Key) continue;

          // If the file key is NOT referenced in active database URLs
          if (!activeKeys.has(obj.Key)) {
            // Safety Check: Avoid deleting recently uploaded files
            const lastModified = obj.LastModified ? new Date(obj.LastModified).getTime() : now;
            const ageMs = now - lastModified;

            if (ageMs > oneHourMs) {
              orphanedKeys.push(obj.Key);
            }
          }
        }

        isTruncated = !!listResult.IsTruncated;
        continuationToken = listResult.NextContinuationToken;
      }
    }

    // 4. Batch delete the identified orphaned files
    const deletedKeys: string[] = [];
    const deletePromises = orphanedKeys.map(async (key) => {
      try {
        await r2.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key
        }));
        deletedKeys.push(key);
        console.log(`[Orphan Cleanup] Successfully deleted orphaned R2 object: ${key}`);
      } catch (err) {
        console.error(`[Orphan Cleanup] Failed to delete key: ${key}`, err);
      }
    });

    await Promise.all(deletePromises);

    return res.status(200).json({
      success: true,
      summary: {
        totalActiveKeysInDb: activeKeys.size,
        totalFilesScannedInR2: totalScanned,
        orphanedFilesIdentified: orphanedKeys.length,
        orphanedFilesDeleted: deletedKeys.length
      },
      deletedKeys
    });

  } catch (error: any) {
    console.error('[Clean Orphans Error]:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error during orphan clean'
    });
  }
}
