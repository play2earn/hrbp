import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { configureSameOrigin, getAdminSupabase, requireStaff, safeEqual } from '../server/security.js';
import { collectReferencedR2Keys } from '../server/orphan-cleanup.js';

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
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET || '';
  const isCron = Boolean(cronSecret && safeEqual(authHeader, `Bearer ${cronSecret}`));
  let allowDeletion = false;
  if (!isCron) {
    const admin = await requireStaff(req, res, ['admin']);
    if (!admin) return;
    allowDeletion = req.method === 'POST' && req.body?.action === 'delete-confirmed';
  }

  try {
    const bucketName = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    const r2 = getR2Client();

    // 1. Fetch all active files/URLs from Supabase
    const supabase = getAdminSupabase();

    let applications: any[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error: dbError } = await supabase
        .from('applications')
        .select('photo_url, resume_url, form_data')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (dbError) {
        throw new Error(`Database fetch failed: ${dbError.message}`);
      }
      if (!data || data.length === 0) break;
      applications.push(...data);
      if (data.length < pageSize) break;
      page++;
    }

    // 2. Build a Set of all active R2 keys referenced in the database
    const activeKeys = collectReferencedR2Keys(applications, publicDomain);

    // 3. Scan the R2 bucket for files in target prefixes: 'applicants/', 'photos/', and legacy 'applications/'
    const prefixes = ['applicants/', 'photos/', 'applications/'];
    const orphanedKeys: string[] = [];
    let totalScanned = 0;

    // Safety margin: only consider files older than 24 hours.
    const now = Date.now();
    const minimumAgeMs = 24 * 60 * 60 * 1000;

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

            if (ageMs > minimumAgeMs) {
              orphanedKeys.push(obj.Key);
            }
          }
        }

        isTruncated = !!listResult.IsTruncated;
        continuationToken = listResult.NextContinuationToken;
      }
    }

    // Scheduled runs are report-only. Deletion requires an authenticated admin
    // to POST the explicit action so a cron/config mistake cannot remove files.
    const deletedKeys: string[] = [];
    if (allowDeletion) {
      for (const key of orphanedKeys) {
        try {
          await r2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
          deletedKeys.push(key);
          console.log(`[Orphan Cleanup] Successfully deleted orphaned R2 object: ${key}`);
        } catch (err) {
          console.error(`[Orphan Cleanup] Failed to delete key: ${key}`, err);
        }
      }
    }

    return res.status(200).json({
      success: true,
      dryRun: !allowDeletion,
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
