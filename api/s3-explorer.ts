import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, ListObjectsV2Command, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

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

const getSupabaseClient = (req?: VercelRequest) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://safrgojiehjwtftaiqog.supabase.co';
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) return null;

  const adminKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (adminKey) {
    return createClient(supabaseUrl, adminKey);
  }

  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } }
    });
  }
  return createClient(supabaseUrl, serviceKey);
};

const knownDocLabels: Record<string, { label: string; icon: string; sortOrder: number; field: string }> = {
  photo_url:           { label: 'รูปถ่ายหน้าตรง',               icon: '📷', sortOrder: 1,  field: 'photo_url'         },
  photoUrl:            { label: 'รูปถ่ายหน้าตรง',               icon: '📷', sortOrder: 1,  field: 'photo_url'         },
  originalPhotoUrl:    { label: 'รูปถ่ายต้นฉบับ',               icon: '📷', sortOrder: 2,  field: 'originalPhotoUrl'  },
  idCardUrl:           { label: 'สำเนาบัตรประชาชน',             icon: '🪪', sortOrder: 3,  field: 'idCardUrl'         },
  houseRegUrl:         { label: 'สำเนาทะเบียนบ้าน',             icon: '🏠', sortOrder: 4,  field: 'houseRegUrl'       },
  transcriptUrl:       { label: 'ใบทรานสคริปต์ (Transcript)',   icon: '🎓', sortOrder: 5,  field: 'transcriptUrl'     },
  eduCertificateUrl:   { label: 'ใบรับรองวุฒิการศึกษา',         icon: '📜', sortOrder: 6,  field: 'eduCertificateUrl' },
  militaryCertUrl:     { label: 'ใบผ่านการเกณฑ์ทหาร (สด.43)',  icon: '🎖️', sortOrder: 7,  field: 'militaryCertUrl'   },
  toeicCertUrl:        { label: 'ผลสอบภาษา (TOEIC / English)', icon: '🌐', sortOrder: 8,  field: 'toeicCertUrl'      },
  bankBookUrl:         { label: 'สำเนาบัญชีธนาคาร',             icon: '💳', sortOrder: 9,  field: 'bankBookUrl'       },
  resume_url:          { label: 'เรซูเม่ (Resume / CV)',         icon: '📄', sortOrder: 10, field: 'resume_url'        },
  resumeUrl:           { label: 'เรซูเม่ (Resume / CV)',         icon: '📄', sortOrder: 10, field: 'resume_url'        },
  certificateUrl:      { label: 'ใบรับรอง / ประกาศนียบัตร',     icon: '🎗️', sortOrder: 11, field: 'certificateUrl'    },
  otherDocsUrl:        { label: 'เอกสารประกอบอื่นๆ',            icon: '📁', sortOrder: 99, field: 'otherDocsUrl'      },
  id_card_url:         { label: 'สำเนาบัตรประชาชน',             icon: '🪪', sortOrder: 3,  field: 'idCardUrl'         },
  house_reg_url:       { label: 'สำเนาทะเบียนบ้าน',             icon: '🏠', sortOrder: 4,  field: 'houseRegUrl'       },
  transcript_url:      { label: 'ใบทรานสคริปต์ (Transcript)',   icon: '🎓', sortOrder: 5,  field: 'transcriptUrl'     },
  edu_certificate_url: { label: 'ใบรับรองวุฒิการศึกษา',         icon: '📜', sortOrder: 6,  field: 'eduCertificateUrl' },
  military_cert_url:   { label: 'ใบผ่านการเกณฑ์ทหาร (สด.43)',  icon: '🎖️', sortOrder: 7,  field: 'militaryCertUrl'   },
  toeic_cert_url:      { label: 'ผลสอบภาษา (TOEIC / English)', icon: '🌐', sortOrder: 8,  field: 'toeicCertUrl'      },
  bank_book_url:       { label: 'สำเนาบัญชีธนาคาร',             icon: '💳', sortOrder: 9,  field: 'bankBookUrl'       },
  certificate_url:     { label: 'ใบรับรอง / ประกาศนียบัตร',     icon: '🎗️', sortOrder: 11, field: 'certificateUrl'    },
  other_docs_url:      { label: 'เอกสารประกอบอื่นๆ',            icon: '📁', sortOrder: 99, field: 'otherDocsUrl'      },
};

function getDocInfoFromKey(key: string, fieldName?: string): { label: string; icon: string; sortOrder: number; field: string } {
  if (fieldName && knownDocLabels[fieldName]) {
    return knownDocLabels[fieldName];
  }
  const filename = key.split('/').pop()?.toLowerCase() || '';
  for (const [keyPattern, info] of Object.entries(knownDocLabels)) {
    if (filename.includes(keyPattern.toLowerCase())) {
      return info;
    }
  }
  if (filename.includes('photo')) return knownDocLabels.photoUrl;
  if (filename.includes('resume') || filename.includes('cv')) return knownDocLabels.resumeUrl;
  if (filename.includes('idcard') || filename.includes('id_card') || filename.includes('id-card')) return knownDocLabels.idCardUrl;
  if (filename.includes('house') || filename.includes('house_reg')) return knownDocLabels.houseRegUrl;
  if (filename.includes('transcript')) return knownDocLabels.transcriptUrl;
  if (filename.includes('edu') || filename.includes('degree')) return knownDocLabels.eduCertificateUrl;
  if (filename.includes('military') || filename.includes('sd43')) return knownDocLabels.militaryCertUrl;
  if (filename.includes('toeic') || filename.includes('english')) return knownDocLabels.toeicCertUrl;
  if (filename.includes('bank') || filename.includes('passbook')) return knownDocLabels.bankBookUrl;
  if (filename.includes('cert')) return knownDocLabels.certificateUrl;

  return { label: 'เอกสารทั่วไป', icon: '📎', sortOrder: 90, field: 'unknownDoc' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST Request: Migration handler (migrating file from URL to S3)
  if (req.method === 'POST') {
    try {
      let { fileUrl, targetFolder, applicationId, fieldName } = req.body;

      if (!fileUrl) {
        return res.status(400).json({ error: 'Missing fileUrl in request body' });
      }

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

      if (fieldName && CANONICAL_FIELD_MAP[fieldName]) {
        fieldName = CANONICAL_FIELD_MAP[fieldName];
      }

      console.log(`[Migration] Fetching source file from: ${fileUrl}`);
      const fetchRes = await fetch(fileUrl);
      if (!fetchRes.ok) {
        return res.status(400).json({ error: `Failed to download source file: ${fetchRes.statusText}` });
      }

      const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
      const arrayBuffer = await fetchRes.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const rawFileName = fileUrl.split('/').pop()?.split('?')[0] || `file-${Date.now()}`;
      const cleanFileName = decodeURIComponent(rawFileName);
      const ext = cleanFileName.split('.').pop()?.toLowerCase() || 'bin';

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

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

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

      if (applicationId && fieldName) {
        const supabase = getSupabaseClient(req);
        if (supabase) {
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

            const { data: updatedRows, error: updateErr } = await supabase
              .from('applications')
              .update(updatePayload)
              .eq('id', applicationId)
              .select('id');

            if (updateErr || !updatedRows || updatedRows.length === 0) {
              console.error('[Migration DB Warning] Failed to update Supabase row (Check RLS / SUPABASE_SERVICE_ROLE_KEY):', updateErr || '0 rows updated');
              return res.status(500).json({
                error: `File copied to S3, but database update failed: ${updateErr?.message || '0 rows updated (RLS permission issue or SUPABASE_SERVICE_ROLE_KEY missing on server)'}`,
                dbUpdated: false,
                proxyUrl,
              });
            }
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

  // GET Request: S3 Explorer
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const s3 = getS3Client();
    const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';
    let prefix = (req.query.prefix as string) || '';

    if (prefix && !prefix.endsWith('/')) {
      prefix += '/';
    }

    let allDbAppsMap: Record<string, { id: string; fullName: string; position: string; formData: Record<string, any> }> = {};
    const supabase = getSupabaseClient(req);

    if (supabase) {
      let dbApps: any[] = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error: dbErr } = await supabase
          .from('applications')
          .select('id, full_name, first_name, last_name, title, position, department, form_data')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (dbErr) {
          console.error('[S3 Explorer] Error fetching applications from Supabase:', dbErr);
          break;
        }

        if (data && data.length > 0) {
          dbApps.push(...data);
          if (data.length < pageSize) break;
          page++;
        } else {
          break;
        }
      }

      dbApps.forEach((app: any) => {
        const fd = app.form_data || {};
        const rawFullName = app.full_name ? String(app.full_name).trim() : '';
        const colName = [app.title, app.first_name, app.last_name].filter(Boolean).join(' ').trim();
        const thaiName = [fd.prefix || fd.title || fd.titleTh, fd.firstName || fd.firstNameTh, fd.lastName || fd.lastNameTh].filter(Boolean).join(' ').trim();
        const engName = [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ').trim();
        const altName = fd.name || fd.applicantName || fd.fullName || '';

        const fullName = rawFullName || colName || thaiName || engName || altName || 'ไม่ระบุชื่อ';
        const position = app.position || fd.position || fd.positionEn || 'ไม่ระบุตำแหน่ง';

        const appMeta = {
          id: String(app.id),
          fullName,
          position,
          formData: fd,
        };
        const keyStr = String(app.id).trim();
        allDbAppsMap[keyStr] = appMeta;
        allDbAppsMap[keyStr.toLowerCase()] = appMeta;
      });
    }

    let isTruncated = true;
    let continuationToken: string | undefined = undefined;
    let allObjects: any[] = [];
    let totalBucketBytes = 0;
    let totalBucketObjects = 0;

    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });

      const response = await s3.send(command);
      const contents = response.Contents || [];

      contents.forEach((item) => {
        totalBucketObjects++;
        totalBucketBytes += item.Size || 0;
      });

      if (prefix) {
        const filtered = contents.filter((item) => item.Key && item.Key.startsWith(prefix));
        allObjects.push(...filtered);
      } else {
        allObjects.push(...contents);
      }

      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    const foldersSet = new Set<string>();
    const filesList: any[] = [];

    allObjects.forEach((item) => {
      if (!item.Key) return;
      const relativeKey = prefix ? item.Key.slice(prefix.length) : item.Key;
      if (!relativeKey) return;

      const slashIndex = relativeKey.indexOf('/');
      if (slashIndex !== -1) {
        const folderName = relativeKey.slice(0, slashIndex);
        foldersSet.add(folderName);
      } else {
        filesList.push(item);
      }
    });

    const pathSegments = prefix.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Root (Bucket)', prefix: '' }];
    let currentPath = '';

    pathSegments.forEach((segment, idx) => {
      currentPath += segment + '/';
      let displayName = segment;
      if (pathSegments[0] === 'applicants' && idx === 1) {
        const appMeta = allDbAppsMap[segment] || allDbAppsMap[segment.toLowerCase()];
        if (appMeta) {
          displayName = `👤 ${appMeta.fullName}`;
        }
      }
      breadcrumbs.push({
        name: displayName,
        prefix: currentPath,
      });
    });

    const folders = Array.from(foldersSet).sort().map((folderName) => {
      const folderPrefix = `${prefix}${folderName}/`;
      const isApplicantFolder = prefix === 'applicants/';
      let applicantMeta = null;

      if (isApplicantFolder) {
        const cleanName = folderName.trim();
        applicantMeta = allDbAppsMap[cleanName] || allDbAppsMap[cleanName.toLowerCase()] || null;
      }

      return {
        name: folderName,
        prefix: folderPrefix,
        type: 'folder',
        isApplicantFolder,
        applicantMeta,
      };
    });

    const files = filesList.map((item) => {
      const key = item.Key;
      const fileName = key.split('/').pop() || key;
      const ext = fileName.split('.').pop()?.toLowerCase() || '';

      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
      const isPdf = ext === 'pdf';
      const isDoc = ['doc', 'docx', 'xls', 'xlsx'].includes(ext);

      let matchedFieldName: string | undefined = undefined;
      let matchedApplicantId: string | undefined = undefined;
      let matchedApplicantName: string | undefined = undefined;

      const keySegments = key.split('/');
      if (keySegments.length >= 2 && keySegments[0] === 'applicants') {
        matchedApplicantId = keySegments[1];
        const dbApp = allDbAppsMap[matchedApplicantId] || allDbAppsMap[matchedApplicantId.toLowerCase()];

        if (dbApp) {
          matchedApplicantName = dbApp.fullName;
          for (const [k, v] of Object.entries(dbApp.formData)) {
            if (typeof v === 'string') {
              const urlStr = v.trim();
              const isS3 = urlStr.includes('amazonaws.com') || urlStr.startsWith('/api/files?key=');
              if (isS3 && urlStr.includes(encodeURIComponent(key))) {
                matchedFieldName = k;
                break;
              }
              if (urlStr.endsWith(fileName)) {
                matchedFieldName = k;
                break;
              }
            }
          }
        }
      }

      const docInfo = getDocInfoFromKey(key, matchedFieldName);

      return {
        key: key,
        name: fileName,
        size: item.Size || 0,
        formattedSize: (item.Size || 0) > 1024 * 1024
          ? `${((item.Size || 0) / (1024 * 1024)).toFixed(2)} MB`
          : `${((item.Size || 0) / 1024).toFixed(1)} KB`,
        lastModified: item.LastModified,
        proxyUrl: `/api/files?key=${encodeURIComponent(key)}`,
        isImage,
        isPdf,
        isDoc,
        docTitle: docInfo.label,
        docLabel: docInfo.label,
        docIcon: docInfo.icon,
        docSortOrder: docInfo.sortOrder,
        docField: docInfo.field,
        applicantId: matchedApplicantId,
        applicantName: matchedApplicantName,
      };
    }).sort((a, b) => a.docSortOrder - b.docSortOrder);

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const quotaCapGB = parseInt(process.env.AWS_S3_QUOTA_GB || '1000', 10);
    const quotaCapBytes = quotaCapGB * 1024 * 1024 * 1024;
    const usagePercent = Number(((totalBucketBytes / quotaCapBytes) * 100).toFixed(2));

    const bucketStats = {
      totalBytes: totalBucketBytes,
      formattedTotalSize: formatBytes(totalBucketBytes),
      totalObjects: totalBucketObjects,
      quotaCapGB: quotaCapGB,
      quotaCapBytes: quotaCapBytes,
      usagePercent: usagePercent,
    };

    return res.status(200).json({
      success: true,
      bucket: bucketName,
      prefix: prefix,
      breadcrumbs,
      folders,
      files,
      totalFolders: folders.length,
      totalFiles: files.length,
      bucketStats,
    });
  } catch (error: any) {
    console.error('[S3 Explorer Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to list S3 objects' });
  }
}
