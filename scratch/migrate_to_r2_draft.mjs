// scratch/migrate_to_r2_draft.mjs
// ย้ายไฟล์แนบสะสม (Legacy) จาก Supabase Storage → Cloudflare R2
// พร้อมอัปเดต URL ใน DB และลบไฟล์ต้นทาง
//
// วิธีใช้:
//   node scratch/migrate_to_r2_draft.mjs              ← ย้ายทั้งหมด (DRY_RUN=true)
//   node scratch/migrate_to_r2_draft.mjs <app-id>     ← ย้ายเฉพาะ 1 ใบสมัคร

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

// ── 1. โหลด Environment Variables ───────────────────────────────────────────
try {
  const env = readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) {
      process.env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}
dotenv.config();

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SECRET_KEY;     // sb_secret_... (bypass RLS)
const R2_ACCOUNT_ID     = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID  = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET         = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET         = process.env.R2_BUCKET_NAME || 'hrbp-applicants';
const R2_DOMAIN         = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, '');

if (!SUPABASE_URL || !SUPABASE_KEY || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET || !R2_DOMAIN) {
  console.error('❌ Missing required env vars. Check .env');
  process.exit(1);
}

// ── 2. Config ─────────────────────────────────────────────────────────────
const DRY_RUN      = process.env.DRY_RUN === 'false' ? false : true; // true = จำลองเท่านั้น | false = ทำจริง (ค่าเริ่มต้นเป็น true เพื่อความปลอดภัย)
const BATCH_DELAY  = 1500;  // ms หน่วงระหว่างใบสมัคร ป้องกัน rate-limit และระบบหน่วง (เว้นระยะระหว่าง transaction)
const BATCH_LIMIT  = 200;   // จำกัดย้ายสูงสุดต่อรอบ (เฉพาะตอนรันย้ายทั้งหมด) ป้องกัน rate-limit และระบบหน่วง
const TARGET_IDS   = process.argv.slice(2).flatMap(arg => arg.split(',')).map(id => id.trim()).filter(Boolean);

// ── 3. Initialize Clients ────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET },
  forcePathStyle: true,
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function isSupabaseUrl(url) {
  return !!url && (url.includes('supabase.co') || url.includes('/storage/v1/object/public/'));
}

function extractPath(url) {
  if (!url) return null;
  const m = url.match(/\/public\/applicants\/(.+)$/);
  return m ? m[1] : null;
}

function toR2Url(supabaseUrl) {
  const path = extractPath(supabaseUrl);
  return path ? `${R2_DOMAIN}/${path}` : supabaseUrl;
}

function guessContentType(path) {
  if (path.endsWith('.pdf'))  return 'application/pdf';
  if (path.endsWith('.png'))  return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg'; // jpg / jpeg / default
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ตรวจว่า object นั้นมีอยู่บน R2 แล้วหรือยัง (skip re-upload ถ้ามีแล้ว)
async function existsOnR2(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ── Core: Migrate single file ────────────────────────────────────────────────
async function migrateFile(supabaseUrl) {
  const path = extractPath(supabaseUrl);
  if (!path) return { success: false, r2Url: null, alreadyOnR2: false };

  const r2Url = `${R2_DOMAIN}/${path}`;

  if (DRY_RUN) {
    console.log(`   [Dry-run] Would migrate: ${path}`);
    return { success: true, r2Url, alreadyOnR2: false };
  }

  // ตรวจว่ามีบน R2 แล้วหรือยัง
  if (await existsOnR2(path)) {
    console.log(`   [Skip] Already on R2: ${path}`);
    return { success: true, r2Url, alreadyOnR2: true };
  }

  // Download จาก Supabase Storage
  const { data: fileData, error: dlErr } = await supabase.storage
    .from('applicants')
    .download(path);

  if (dlErr || !fileData) {
    console.error(`   ❌ Download failed: ${path} — ${dlErr?.message || 'no data'}`);
    return { success: false, r2Url: null, alreadyOnR2: false };
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());

  // Upload ไป R2
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: path,
    Body: buffer,
    ContentType: guessContentType(path),
  }));

  console.log(`   ✅ Migrated (${(buffer.length / 1024).toFixed(1)} KB): ${path}`);
  return { success: true, r2Url, alreadyOnR2: false };
}

// ── Core: Process one application ────────────────────────────────────────────
async function processApp(app) {
  const fd = { ...(app.form_data || {}) };
  const fileFields = ['photoUrl', 'originalPhotoUrl', 'resumeUrl', 'transcriptUrl', 'certificateUrl', 'otherDocsUrl'];

  const supabaseUrls = fileFields
    .filter(f => isSupabaseUrl(fd[f]))
    .map(f => ({ field: f, url: fd[f] }));

  if (supabaseUrls.length === 0) return { migrated: 0, skipped: 0 };

  console.log(`\n📦 ${app.full_name} (${app.id}) — ${supabaseUrls.length} file(s) to migrate`);

  let migrated = 0;
  let skipped  = 0;
  let newPhotoUrl  = app.photo_url;
  let newResumeUrl = app.resume_url;
  const successPaths = [];

  for (const { field, url } of supabaseUrls) {
    const result = await migrateFile(url);
    if (result.success) {
      fd[field] = result.r2Url;
      if (field === 'photoUrl')  newPhotoUrl  = result.r2Url;
      if (field === 'resumeUrl') newResumeUrl = result.r2Url;
      if (result.alreadyOnR2) {
        skipped++;
      } else {
        migrated++;
        if (!DRY_RUN) successPaths.push(extractPath(url));
      }
    }
  }

  // อัปเดต DB (ทั้งกรณี upload ใหม่ และ skip เพราะมี R2 แล้ว)
  if (!DRY_RUN) {
    const { error: updateErr } = await supabase
      .from('applications')
      .update({ form_data: fd, photo_url: newPhotoUrl, resume_url: newResumeUrl })
      .eq('id', app.id);

    if (updateErr) {
      console.error(`   ❌ DB update failed: ${updateErr.message}`);
      return { migrated: 0, skipped: 0 };
    }
    console.log(`   💾 DB updated`);

    // ลบไฟล์ต้นทางบน Supabase Storage เฉพาะที่เพิ่งอัปโหลดใหม่
    if (successPaths.length > 0) {
      const { error: delErr } = await supabase.storage
        .from('applicants')
        .remove(successPaths);
      if (delErr) {
        console.warn(`   ⚠️ Storage delete warning: ${delErr.message}`);
      } else {
        console.log(`   🗑️ Deleted ${successPaths.length} file(s) from Supabase Storage`);
      }
    }
  } else {
    console.log(`   [Dry-run] Would update DB and delete ${supabaseUrls.length} Supabase file(s)`);
  }

  return { migrated, skipped };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🏁 Supabase → R2 Storage Migration (Loop Mode)');
  console.log('='.repeat(50));
  console.log(`Mode:       ${DRY_RUN ? '⚠️  DRY-RUN (no changes)' : '🔴 LIVE'}`);
  console.log(`Target:     ${TARGET_IDS.length > 0 ? `${TARGET_IDS.length} specific application(s)` : 'ALL applications with Supabase URLs'}`);
  console.log('='.repeat(50));

  let query = supabase
    .from('applications')
    .select('id, full_name, photo_url, resume_url, form_data')
    .order('created_at', { ascending: true }); // เก่าสุดก่อน

  if (TARGET_IDS.length > 0) query = query.in('id', TARGET_IDS);

  const { data: apps, error } = await query;
  if (error) { console.error('❌ Fetch failed:', error.message); return; }

  // กรองเฉพาะที่มี Supabase URL
  const allToProcess = apps.filter(app => {
    const fd = app.form_data || {};
    return ['photoUrl','originalPhotoUrl','resumeUrl','transcriptUrl','certificateUrl','otherDocsUrl']
      .some(f => isSupabaseUrl(fd[f]));
  });

  const totalRemaining = allToProcess.length;
  
  // จำกัดการรันตาม BATCH_LIMIT หากไม่ระบุ ID เจาะจง
  const toProcess = (TARGET_IDS.length === 0 && BATCH_LIMIT)
    ? allToProcess.slice(0, BATCH_LIMIT)
    : allToProcess;

  console.log(`\n📋 Total apps in DB: ${apps.length}`);
  console.log(`📋 Total apps needing migration: ${totalRemaining}`);
  console.log(`📋 Processing in this session: ${toProcess.length} oldest applications\n`);

  let totalMigrated = 0;
  let totalSkipped  = 0;
  let totalFailed   = 0;
  const migratedApps = [];

  const CHUNK_SIZE = 25;
  const CHUNK_PAUSE = 15000; // 15 seconds pause between chunks of 25

  for (let chunkIdx = 0; chunkIdx < toProcess.length; chunkIdx += CHUNK_SIZE) {
    const chunk = toProcess.slice(chunkIdx, chunkIdx + CHUNK_SIZE);
    const chunkNum = Math.floor(chunkIdx / CHUNK_SIZE) + 1;
    const totalChunks = Math.ceil(toProcess.length / CHUNK_SIZE);

    console.log(`\n==================================================`);
    console.log(`🚀 Starting Chunk ${chunkNum}/${totalChunks} (${chunk.length} apps)`);
    console.log(`==================================================`);

    let i = 0;
    for (const app of chunk) {
      i++;
      const overallIndex = chunkIdx + i;
      process.stdout.write(`[${overallIndex}/${toProcess.length}] `);
      try {
        const { migrated, skipped } = await processApp(app);
        totalMigrated += migrated;
        totalSkipped  += skipped;
        if (migrated > 0 || skipped > 0) {
          migratedApps.push({ id: app.id, name: app.full_name, migrated, skipped });
        }
      } catch (err) {
        console.error(`   ❌ Unexpected error: ${err.message}`);
        totalFailed++;
      }
      if (!DRY_RUN && BATCH_DELAY > 0) await sleep(BATCH_DELAY);
    }

    if (chunkIdx + CHUNK_SIZE < toProcess.length) {
      console.log(`\n⏳ Chunk ${chunkNum} finished. Sleeping for ${(CHUNK_PAUSE / 1000)} seconds before next chunk...`);
      await sleep(CHUNK_PAUSE);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Session Migration Complete!');
  console.log(`   ✅ Migrated:  ${totalMigrated} files`);
  console.log(`   ⏭️  Skipped:   ${totalSkipped} files (already on R2)`);
  console.log(`   ❌ Failed:    ${totalFailed} apps`);
  console.log('='.repeat(50));

  if (migratedApps.length > 0) {
    console.log('\n📄 List of processed applications in this session:');
    migratedApps.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.name} (${item.id}) - Migrated: ${item.migrated}, Skipped: ${item.skipped}`);
    });
    console.log('='.repeat(50));
  }
}

main().catch(console.error);
