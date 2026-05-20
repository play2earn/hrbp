/**
 * test_r2_direct.mjs
 * Tests R2 credentials directly (bypasses Vercel serverless routing)
 * Run: node test_r2_direct.mjs
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';

const env = dotenv.parse(fs.readFileSync('.env'));

const ACCOUNT_ID = env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = env.R2_BUCKET_NAME;
const PUBLIC_DOMAIN = env.R2_PUBLIC_DOMAIN;

console.log('=== R2 Direct Connection Test ===');
console.log(`Account ID : ${ACCOUNT_ID}`);
console.log(`Bucket     : ${BUCKET_NAME}`);
console.log(`Domain     : ${PUBLIC_DOMAIN}`);
console.log('');

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('❌ Missing R2 credentials in .env');
  process.exit(1);
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
  forcePathStyle: true,
});

const testKey = `test/r2-connection-test-${Date.now()}.txt`;
const testContent = Buffer.from('Hello from R2 test!');

async function run() {
  // 1. Upload
  console.log(`📤 Uploading test file: ${testKey}`);
  try {
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    }));
    const publicUrl = `${PUBLIC_DOMAIN}/${testKey}`;
    console.log(`✅ Upload SUCCESS`);
    console.log(`   Public URL: ${publicUrl}`);

    // 2. Delete (cleanup)
    console.log(`\n🗑️  Cleaning up test file...`);
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: testKey }));
    console.log(`✅ Cleanup SUCCESS`);
    console.log('\n🎉 R2 credentials are working correctly!');
    console.log('\n📌 NOTE: /api/upload-r2 is a Vercel Serverless Function.');
    console.log('   It does NOT run with "npm run dev" (Vite only).');
    console.log('   Use "vercel dev" to test the full stack locally,');
    console.log('   or test on production (Vercel) deployment.');
  } catch (err) {
    console.error('❌ R2 operation FAILED:', err.message);
    console.error('\nPossible causes:');
    console.error('  - Invalid R2 credentials (check .env)');
    console.error('  - Bucket name mismatch');
    console.error('  - R2 bucket not created yet');
    process.exit(1);
  }
}

run();
