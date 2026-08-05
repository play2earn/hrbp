import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

const knownDocLabels: Record<string, { label: string; icon: string; sortOrder: number; field: string }> = {
  // camelCase (S3 file basenames & form_data keys)
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
  // snake_case aliases (old form_data schema & S3 filenames after some migrations)
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

// Map S3 key patterns to document labels if filename contains key hints
function getDocInfoFromKey(key: string, fieldName?: string): { label: string; icon: string; sortOrder: number; field: string } {
  // 1. Direct match on provided fieldName (e.g. from upload metadata)
  if (fieldName && knownDocLabels[fieldName]) {
    return knownDocLabels[fieldName];
  }

  // 2. Extract basename (without extension) from key and try direct match
  //    e.g. applicants/UUID/idCardUrl.jpg -> basename = "idCardUrl"
  const baseName = (key.split('/').pop() || '').replace(/\.[^.]+$/, '');
  if (baseName && knownDocLabels[baseName]) {
    return knownDocLabels[baseName];
  }

  // 3. Case-insensitive keyword matching on the full key
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('photo') || lowerKey.includes('avatar'))                         return knownDocLabels['photo_url'];
  if (lowerKey.includes('resume') || lowerKey.includes('_cv'))                           return knownDocLabels['resume_url'];
  if (lowerKey.includes('transcript'))                                                    return knownDocLabels['transcriptUrl'];
  if (lowerKey.includes('idcard') || lowerKey.includes('id_card') || lowerKey.includes('idcardurl')) return knownDocLabels['idCardUrl'];
  if (lowerKey.includes('housereg') || lowerKey.includes('house_reg'))                   return knownDocLabels['houseRegUrl'];
  if (lowerKey.includes('educert') || lowerKey.includes('edu_cert'))                     return knownDocLabels['eduCertificateUrl'];
  if (lowerKey.includes('military') || lowerKey.includes('sd43'))                        return knownDocLabels['militaryCertUrl'];
  if (lowerKey.includes('toeic') || lowerKey.includes('english'))                        return knownDocLabels['toeicCertUrl'];
  if (lowerKey.includes('bankbook') || lowerKey.includes('bank_book'))                   return knownDocLabels['bankBookUrl'];
  if (lowerKey.includes('cert'))                                                          return knownDocLabels['certificateUrl'];

  return { label: 'เอกสารแนบผู้สมัคร', icon: '📎', sortOrder: 50, field: baseName || 'unknown' };
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const s3 = getS3Client();
    const supabase = getSupabaseClient();
    const bucketName = process.env.AWS_S3_BUCKET || 'hr-recruitment-01';
    let prefix = (req.query.prefix as string) || '';

    if (prefix && !prefix.endsWith('/')) prefix += '/';

    // List native S3 objects
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/',
    });

    const response = await s3.send(command);
    const folderMap = new Map<string, { name: string; prefix: string; candidateName?: string }>();

    // 1. Map S3 CommonPrefixes (Subfolders)
    (response.CommonPrefixes || []).forEach((cp) => {
      const fullPrefix = cp.Prefix || '';
      if (fullPrefix.startsWith('.trash/')) return;
      const parts = fullPrefix.replace(/\/$/, '').split('/');
      const folderName = parts[parts.length - 1] || fullPrefix;
      folderMap.set(fullPrefix, { name: folderName, prefix: fullPrefix });
    });

    // 2. Ensure Root standard folders
    if (prefix === '') {
      if (!folderMap.has('applicants/')) folderMap.set('applicants/', { name: 'applicants (ผู้สมัครงาน)', prefix: 'applicants/' });
      if (!folderMap.has('hrd-documents/')) folderMap.set('hrd-documents/', { name: 'hrd-documents (เอกสารกลาง HRD)', prefix: 'hrd-documents/' });
      if (!folderMap.has('drafts/')) folderMap.set('drafts/', { name: 'drafts (ไฟล์ร่าง)', prefix: 'drafts/' });
    }

    // 3. Parse native S3 Files
    const files: any[] = (response.Contents || [])
      .filter((obj) => obj.Key && obj.Key !== prefix && !obj.Key.startsWith('.trash/'))
      .map((obj) => {
        const key = obj.Key || '';
        const parts = key.split('/');
        const fileName = parts[parts.length - 1] || key;
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const docInfo = getDocInfoFromKey(key);

        return {
          name: fileName,
          docTitle: `${docInfo.icon} ${docInfo.label}`,
          field: docInfo.field,
          sortOrder: docInfo.sortOrder,
          key: key,
          size: obj.Size || 0,
          lastModified: obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString(),
          extension: ext,
          provider: 's3' as const,
          proxyUrl: `/api/files?key=${encodeURIComponent(key)}`,
        };
      })
      // Sort by category order defined in knownDocLabels
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));


    // 4. Supabase DB Applicant Name Enrichment & Hybrid Resolving
    const applicantInfoMap = new Map<string, { candidateName: string; refCode: string }>();

    if (supabase) {
      // Pre-fetch applicant names to replace raw UUID folder names
      if (prefix === 'applicants/' || prefix.startsWith('applicants/')) {
        const { data: dbApps, error: dbErr } = await supabase
          .from('applications')
          .select('id, first_name, last_name, form_data');

        console.log(`[s3-explorer DB Apps]: count=${dbApps ? dbApps.length : 0}`, dbErr);

        if (dbApps) {
          dbApps.forEach((app) => {
            const appId = String(app.id || app.form_data?.id || '').trim();
            const fd = app.form_data || {};
            const firstName = app.first_name || fd.firstName || fd.thFirstName || fd.first_name_th || '';
            const lastName = app.last_name || fd.lastName || fd.thLastName || fd.last_name_th || '';
            const fullName = `${firstName} ${lastName}`.trim() || `ผู้สมัคร`;
            const candidateName = `👤 ${fullName}`;
            const refCode = `Ref: ${appId}`;

            if (appId) {
              applicantInfoMap.set(appId.toLowerCase(), { candidateName, refCode });
              applicantInfoMap.set(appId, { candidateName, refCode });

              // ONLY populate virtual folders when browsing the root applicants/ directory
              if (prefix === 'applicants/') {
                const appFolderPrefix = `applicants/${appId}/`;
                folderMap.set(appFolderPrefix, {
                  name: candidateName,
                  prefix: appFolderPrefix,
                  refCode: refCode,
                } as any);
              }
            }
          });
        }
      }

      // Case: Browsing specific applicant folder (applicants/APP-XXXX/)
      const matchAppId = prefix.match(/^applicants\/([^/]+)\/$/);
      if (matchAppId) {
        // Clear folderMap so no root candidate folders bleed into specific candidate's view
        folderMap.clear();

        const appId = matchAppId[1];
        const { data: app } = await supabase
          .from('applications')
          .select('id, first_name, last_name, photo_url, resume_url, form_data')
          .eq('id', appId)
          .single();

        if (app) {
          const fd = app.form_data || {};
          const firstName = app.first_name || fd.firstName || fd.thFirstName || fd.first_name_th || '';
          const lastName = app.last_name || fd.lastName || fd.thLastName || fd.last_name_th || '';
          const fullName = `${firstName} ${lastName}`.trim() || `ผู้สมัคร`;
          const candidateName = `👤 ${fullName}`;
          const refCode = `Ref: ${app.id}`;

          const cleanId = String(app.id).trim().toLowerCase();
          applicantInfoMap.set(cleanId, { candidateName, refCode });
          applicantInfoMap.set(String(app.id), { candidateName, refCode });

          // Map docTitles onto native S3 file objects
          // Priority: only override if new match is from knownDocLabels (quality > generic fallback)
          files.forEach((f) => {
            Object.entries(fd).forEach(([fieldName, fieldVal]) => {
              if (typeof fieldVal === 'string' && fieldVal) {
                const isKeyMatch = f.key.includes(fieldName);
                const isValMatch = fieldVal.includes(f.name) && f.name.length > 5; // avoid short names matching everywhere
                if (isKeyMatch || isValMatch) {
                  const knownInfo = knownDocLabels[fieldName];
                  if (knownInfo) {
                    // Always prefer a proper known label
                    f.docTitle = `${knownInfo.icon} ${knownInfo.label}`;
                    if (!f.field || f.field === 'unknown') f.field = knownInfo.field;
                    if (!f.sortOrder || f.sortOrder === 50) f.sortOrder = knownInfo.sortOrder;
                  } else if (!f.docTitle || f.docTitle.includes('เอกสารแนบผู้สมัคร')) {
                    // Only use fallback if we have nothing better
                    f.docTitle = `📎 ${fieldName}`;
                  }
                }
              }
            });

            if (app.photo_url && app.photo_url.includes(f.name)) {
              f.docTitle = '📷 รูปถ่ายหน้าตรง';
            }
            if (app.resume_url && app.resume_url.includes(f.name)) {
              f.docTitle = '📄 เรซูเม่ (Resume / CV)';
            }
          });


          const candidateFilesMap = new Map<string, { label: string; icon: string; url: string; field: string }>();

          if (app.photo_url) candidateFilesMap.set(app.photo_url, { label: 'รูปถ่ายหน้าตรง', icon: '📷', url: app.photo_url, field: 'photo_url' });
          if (app.resume_url) candidateFilesMap.set(app.resume_url, { label: 'เรซูเม่ (Resume / CV)', icon: '📄', url: app.resume_url, field: 'resume_url' });

          Object.entries(fd).forEach(([k, v]) => {
            if (typeof v === 'string' && v.trim() !== '') {
              if (k.toLowerCase().endsWith('url') || v.startsWith('http') || v.startsWith('/api/files')) {
                const info = knownDocLabels[k] || { label: `เอกสารแนบ (${k})`, icon: '📎' };
                if (!candidateFilesMap.has(v)) {
                  candidateFilesMap.set(v, { label: info.label, icon: info.icon, url: v, field: k });
                }
              }
            }
          });

          Array.from(candidateFilesMap.values()).forEach((file) => {
            const urlStr = file.url || '';
            const isS3 = urlStr.includes('amazonaws.com') || urlStr.startsWith('/api/files?key=');
            const isR2 = urlStr.includes('r2.dev') || urlStr.includes('r2.cloudflarestorage.com');
            const isSupa = urlStr.includes('supabase.co');

            const ext = urlStr.split('.').pop()?.split('?')[0].toLowerCase() || 'pdf';
            const fileName = `${file.field}.${ext}`;

            const existingS3 = files.find((f) => 
              f.originalUrl === urlStr || 
              f.proxyUrl === urlStr || 
              f.key.includes(file.field) ||
              (f.name && urlStr.includes(f.name))
            );

            if (!existingS3) {
              files.push({
                name: fileName,
                docTitle: `${file.icon} ${file.label}`,
                key: `${prefix}${fileName}`,
                size: isS3 ? 850000 : 450000,
                lastModified: new Date().toISOString(),
                extension: ext,
                provider: isS3 ? 's3' : isR2 ? 'r2' : isSupa ? 'supabase' : 's3',
                proxyUrl: isS3
                  ? urlStr.startsWith('/api/files')
                    ? urlStr
                    : `/api/files?url=${encodeURIComponent(urlStr)}`
                  : `/api/files?url=${encodeURIComponent(urlStr)}`,
                originalUrl: urlStr,
                field: file.field,
              });
            } else if (!existingS3.docTitle || existingS3.docTitle.includes('เอกสารแนบผู้สมัคร')) {
              existingS3.docTitle = `${file.icon} ${file.label}`;
            }
          });
        }
      }
    }

    // Enhance Folder Display Names with DB Applicant Names if matching UUID
    const folders = Array.from(folderMap.values()).map((f: any) => {
      const parts = f.prefix.replace(/\/$/, '').split('/');
      const folderId = parts[parts.length - 1];
      const cleanFolderId = String(folderId).trim().toLowerCase();
      if (applicantInfoMap.has(cleanFolderId) || applicantInfoMap.has(folderId)) {
        const info = applicantInfoMap.get(cleanFolderId) || applicantInfoMap.get(folderId)!;
        return {
          ...f,
          name: info.candidateName,
          refCode: info.refCode,
        };
      }
      return f;
    });

    // Build Friendly Breadcrumbs with Applicant Name
    const parts = prefix.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', prefix: '' }];
    let currentPath = '';
    for (const part of parts) {
      currentPath += `${part}/`;
      let displayName = part;
      const cleanPart = String(part).trim().toLowerCase();
      if (applicantInfoMap.has(cleanPart) || applicantInfoMap.has(part)) {
        const info = applicantInfoMap.get(cleanPart) || applicantInfoMap.get(part)!;
        displayName = `${info.candidateName} (${part})`;
      }
      breadcrumbs.push({ name: displayName, prefix: currentPath });
    }

    // Calculate total bucket storage size & stats
    const statsCmd = new ListObjectsV2Command({ Bucket: bucketName });
    const statsRes = await s3.send(statsCmd);
    let totalBucketBytes = 0;
    let totalBucketObjects = 0;
    (statsRes.Contents || []).forEach((obj) => {
      if (obj.Size) totalBucketBytes += obj.Size;
      if (obj.Key && !obj.Key.endsWith('/')) totalBucketObjects++;
    });

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
