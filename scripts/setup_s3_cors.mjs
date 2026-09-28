import fs from 'fs';
import dotenv from 'dotenv';
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const envLocalConfig = fs.existsSync('.env.local') ? dotenv.parse(fs.readFileSync('.env.local')) : {};
const config = { ...envConfig, ...envLocalConfig };

const bucket = config['AWS_S3_BUCKET'] || 'hr-recruitment-01';
const region = config['AWS_REGION'] || 'ap-southeast-1';
const accessKeyId = config['AWS_ACCESS_KEY_ID'];
const secretAccessKey = config['AWS_SECRET_ACCESS_KEY'];

if (!accessKeyId || !secretAccessKey) {
  console.error('❌ AWS S3 credentials missing from environment.');
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey }
});

async function main() {
  console.log(`Configuring CORS for bucket: ${bucket} in ${region}...`);
  try {
    await s3.send(new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag', 'Content-Type', 'Content-Length'],
            MaxAgeSeconds: 3600
          }
        ]
      }
    }));
    console.log('✅ CORS configuration applied successfully!');

    const res = await s3.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log('Current CORS Rules:', JSON.stringify(res.CORSRules, null, 2));
  } catch (err) {
    console.error('❌ Failed to configure S3 CORS:', err.message);
    process.exit(1);
  }
}

main();
