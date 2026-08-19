import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

const envPath = path.resolve(valueAfter('--env', '.env'));
const target = valueAfter('--target', 'staging');
if (!['staging', 'production'].includes(target)) {
  console.error('FAIL invalid --target; use staging or production');
  process.exit(1);
}
if (!fs.existsSync(envPath)) {
  console.error(`FAIL environment file not found: ${envPath}`);
  process.exit(1);
}

const rawEnv = fs.readFileSync(envPath, 'utf8');
const parsed = dotenv.parse(rawEnv);
const env = { ...parsed, ...process.env };
const errors = [];
const warnings = [];
rawEnv.split(/\r?\n/).forEach((line, index) => {
  if (line.trim() && !line.trimStart().startsWith('#') && !/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)) {
    errors.push(`environment file line ${index + 1} is not KEY=value or a comment`);
  }
});
const clean = (name) => String(env[name] || '').replace(/^['"]|['"]$/g, '').trim();
const requireKey = (name) => {
  if (!clean(name)) errors.push(`${name} is required`);
};
const requireOne = (names) => {
  if (!names.some(name => clean(name))) errors.push(`one of ${names.join(', ')} is required`);
};
const requireMin = (name, length) => {
  requireKey(name);
  if (clean(name) && clean(name).length < length) errors.push(`${name} must be at least ${length} characters`);
};

requireKey('VITE_SUPABASE_URL');
requireKey('VITE_SUPABASE_ANON_KEY');
requireOne(['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY']);
requireMin('HRBP_SESSION_SECRET', 32);
requireMin('CRON_SECRET', 32);
requireKey('APP_ORIGIN');
requireKey('IDMS_AGENT_CODE');

for (const name of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']) requireKey(name);
for (const name of ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET']) requireKey(name);

const attachmentMode = clean('ATTACHMENT_STORAGE_MODE') || 'r2-legacy';
const draftMode = clean('R2_DRAFT_ACCESS_MODE') || 'legacy-public';
if (!['r2-legacy', 's3-primary'].includes(attachmentMode)) errors.push('ATTACHMENT_STORAGE_MODE must be r2-legacy or s3-primary');
if (!['legacy-public', 'private-proxy'].includes(draftMode)) errors.push('R2_DRAFT_ACCESS_MODE must be legacy-public or private-proxy');
if (draftMode === 'legacy-public') requireKey('R2_PUBLIC_DOMAIN');
if (target === 'production' && attachmentMode !== 's3-primary') warnings.push('production is still using R2 permanent attachments');
if (target === 'production' && draftMode !== 'private-proxy') warnings.push('production R2 drafts are still publicly addressable');

const publicSecretPattern = /(SECRET|SERVICE_ROLE|ACCESS_KEY|IDMS|CRON|SESSION|PASSWORD|PRIVATE)/i;
for (const name of Object.keys(env)) {
  if (name.startsWith('VITE_') && publicSecretPattern.test(name)) errors.push(`${name} looks secret but VITE_ variables are bundled into the browser`);
}

if (clean('APP_ORIGIN')) {
  try {
    const appOrigin = new URL(clean('APP_ORIGIN'));
    if (target === 'production' && appOrigin.protocol !== 'https:') errors.push('APP_ORIGIN must use https in production');
    if (appOrigin.pathname !== '/' || appOrigin.search || appOrigin.hash) warnings.push('APP_ORIGIN should contain origin only, without path/query/hash');
  } catch {
    errors.push('APP_ORIGIN must be a valid absolute URL');
  }
}

try {
  const supabaseUrl = new URL(clean('VITE_SUPABASE_URL'));
  if (supabaseUrl.protocol !== 'https:') errors.push('VITE_SUPABASE_URL must use https');
} catch {
  errors.push('VITE_SUPABASE_URL must be a valid absolute URL');
}

if (clean('SUPABASE_SERVICE_ROLE_KEY') && clean('SUPABASE_SERVICE_ROLE_KEY') === clean('VITE_SUPABASE_ANON_KEY')) {
  errors.push('SUPABASE_SERVICE_ROLE_KEY must not equal the browser publishable/anon key');
}

console.log(`HRBP preflight: target=${target}, env=${path.basename(envPath)}`);
console.log(`Storage: attachments=${attachmentMode}, drafts=${draftMode}`);
for (const warning of warnings) console.log(`WARN ${warning}`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) {
  console.error(`Preflight failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`PASS environment preflight (${warnings.length} warning(s)); no secret values were printed.`);
