import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

const envPath = path.resolve(valueAfter('--env', '.env.local'));
const bundleDir = path.resolve(valueAfter('--dir', 'dist'));
if (!fs.existsSync(envPath) || !fs.existsSync(bundleDir)) {
  console.error('FAIL bundle scan requires an environment file and a built output directory');
  process.exit(1);
}

const env = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
const secretNames = [
  'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'HRBP_SESSION_SECRET',
  'CRON_SECRET', 'IDMS_AGENT_CODE', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
  'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY',
];

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(resolved) : [resolved];
  });
}

const bundleFiles = filesUnder(bundleDir);
const leaks = [];
for (const name of secretNames) {
  const value = String(env[name] || '').replace(/^['"]|['"]$/g, '').trim();
  if (value.length < 8) continue;
  if (bundleFiles.some(file => fs.readFileSync(file).includes(value))) leaks.push(name);
}

if (leaks.length) {
  leaks.forEach(name => console.error(`FAIL ${name} value was found in the frontend bundle`));
  process.exit(1);
}

console.log(`PASS frontend bundle secret scan (${secretNames.length} server-only keys checked; no values printed)`);
