import process from 'node:process';

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base-url');
const baseUrl = (baseIndex >= 0 ? args[baseIndex + 1] : process.env.BASE_URL || '').replace(/\/$/, '');
if (!baseUrl) {
  console.error('Usage: npm run smoke:security -- --base-url https://staging.example.com');
  process.exit(1);
}

const checks = [
  { name: 'session requires login', path: '/api/session', expected: [401] },
  { name: 'file requires authorization', path: '/api/files?key=applicants/00000000-0000-0000-0000-000000000000/test.pdf', expected: [401] },
  { name: 'trash requires admin', path: '/api/trash', expected: [401] },
  { name: 'S3 explorer requires admin', path: '/api/s3-explorer', expected: [401] },
  { name: 'blacklist requires staff', path: '/api/blacklist?action=entries', expected: [401] },
  {
    name: 'invalid draft ID is rejected', path: '/api/draft-session', method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId: 'predictable' }), expected: [400],
  },
  {
    name: 'invalid tracking ID is rejected', path: '/api/tracking', method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'tracking-id', value: 'invalid' }), expected: [400],
  },
  {
    name: 'untrusted origin is blocked', path: '/api/session', method: 'OPTIONS',
    headers: { Origin: 'https://evil.invalid' }, expected: [403],
  },
];

let failures = 0;
for (const check of checks) {
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      method: check.method || 'GET', headers: check.headers, body: check.body, redirect: 'manual',
    });
    const passed = check.expected.includes(response.status);
    console.log(`${passed ? 'PASS' : 'FAIL'} ${check.name}: HTTP ${response.status}, expected ${check.expected.join('/')}`);
    if (!passed) failures++;
  } catch (error) {
    console.error(`FAIL ${check.name}: ${error.message}`);
    failures++;
  }
}
if (failures) {
  console.error(`Security smoke test failed: ${failures}/${checks.length}`);
  process.exit(1);
}
console.log(`PASS security smoke test: ${checks.length}/${checks.length}`);
