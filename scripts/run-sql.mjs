import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;

// Load and merge environment variables from both .env and .env.local
const envBase = fs.existsSync('.env') ? dotenv.parse(fs.readFileSync('.env')) : {};
const envLocal = fs.existsSync('.env.local') ? dotenv.parse(fs.readFileSync('.env.local')) : {};
const env = { ...envBase, ...envLocal };

const sqlFilePath = process.argv[2] || 'supabase/create_candidate_evaluations.sql';

if (!fs.existsSync(sqlFilePath)) {
  console.error(`❌ File not found: ${sqlFilePath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

async function runWithPostgres(connectionString) {
  console.log(`🔌 Connecting to PostgreSQL...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`🚀 Executing SQL from ${sqlFilePath}...`);
    await client.query(sqlContent);
    console.log(`✅ SQL executed successfully!`);
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Error executing SQL via PostgreSQL:`, err.message);
    try { await client.end(); } catch {}
    return false;
  }
}

async function runWithSupabaseManagementApi(token, projectRef) {
  console.log(`🌐 Executing SQL via Supabase Management API (project: ${projectRef})...`);
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: sqlContent }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ Supabase Management API failed (${response.status}):`, errText);
      return false;
    }

    console.log(`✅ SQL executed successfully via Supabase Management API!`);
    return true;
  } catch (err) {
    console.error(`❌ Network error calling Supabase Management API:`, err.message);
    return false;
  }
}

async function main() {
  console.log(`====================================================`);
  console.log(`  HRBP SQL Migration Runner`);
  console.log(`  File: ${sqlFilePath}`);
  console.log(`====================================================\n`);

  const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || env.POSTGRES_URL;
  const mgmtToken = env.SUPABASE_ACCESS_TOKEN;
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;

  let projectRef = '';
  if (supabaseUrl) {
    try {
      projectRef = new URL(supabaseUrl).host.split('.')[0];
    } catch {}
  }

  if (dbUrl) {
    const success = await runWithPostgres(dbUrl);
    if (success) process.exit(0);
  }

  if (mgmtToken && projectRef) {
    const success = await runWithSupabaseManagementApi(mgmtToken, projectRef);
    if (success) process.exit(0);
  }

  if (!dbUrl && !mgmtToken) {
    console.log(`⚠️  ไม่พบ DATABASE_URL หรือ SUPABASE_ACCESS_TOKEN ใน ${envPath}`);
    console.log(`\nเนื่องจาก SUPABASE_SECRET_KEY ใน .env.local เป็น API Key สำหรับ Data/Auth เท่านั้น (ไม่สามารถรันคำสั่ง DDL เช่น CREATE TABLE ผ่าน PostgREST ได้โดยตรง)\n`);
    console.log(`ท่านสามารถเลือกดำเนินการได้ 2 วิธี:`);
    console.log(`----------------------------------------------------`);
    console.log(`วิธีที่ 1 (แนะนำ - รวดเร็วที่สุด):`);
    console.log(`  1. เปิด Supabase Dashboard -> เลือกโปรเจกต์ "${projectRef || 'your-project'}"`);
    console.log(`  2. ไปที่เมนู "SQL Editor" -> New query`);
    console.log(`  3. คัดลอกโค้ดจากไฟล์ "${sqlFilePath}" ไปวางแล้วกด "Run"\n`);
    console.log(`วิธีที่ 2 (ผ่าน .env.local):`);
    console.log(`  เพิ่มตัวแปรใดตัวแปรหนึ่งใน .env.local:`);
    console.log(`  - DATABASE_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`);
    console.log(`  หรือ`);
    console.log(`  - SUPABASE_ACCESS_TOKEN=[YOUR-SUPABASE-PERSONAL-ACCESS-TOKEN] (ดูได้จาก https://supabase.com/dashboard/account/tokens)`);
    console.log(`  แล้วรันคำสั่ง: node scripts/run-sql.mjs ${sqlFilePath}`);
    console.log(`----------------------------------------------------\n`);
    process.exit(1);
  }
}

main();
