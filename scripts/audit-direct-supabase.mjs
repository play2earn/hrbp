import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const roots = ['services', 'components', 'App.tsx'];
const protectedResources = new Set([
  'applications', 'users', 'application_share_tokens', 'blacklist', 'blacklist_audit_logs',
  'application_logs', 'system_activity_logs', 'interview_evaluations', 'qr_logs', 'applicants',
]);
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.html']);

function filesUnder(entry) {
  if (!fs.existsSync(entry)) return [];
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry];
  return fs.readdirSync(entry, { withFileTypes: true }).flatMap(item =>
    filesUnder(path.join(entry, item.name))
  );
}

const findings = [];
for (const file of roots.flatMap(filesUnder).filter(file => extensions.has(path.extname(file)))) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\.from\(['"]([^'"]+)['"]\)|\.rpc\(['"]([^'"]+)['"]\)|\.storage\b/g)) {
      const resource = match[1] || (match[2] ? `rpc:${match[2]}` : 'storage');
      findings.push({ file, line: index + 1, resource, protected: protectedResources.has(resource) || resource.startsWith('rpc:') || resource === 'storage' });
    }
  });
}

const counts = findings.reduce((result, item) => {
  result[item.resource] = (result[item.resource] || 0) + 1;
  return result;
}, {});
const protectedFindings = findings.filter(item => item.protected);
if (process.argv.includes('--summary')) {
  console.log(JSON.stringify({ counts, protectedCallCount: protectedFindings.length }, null, 2));
} else {
  console.log(JSON.stringify({ counts, protectedFindings }, null, 2));
}

if (process.argv.includes('--strict') && protectedFindings.length) {
  console.error(`FAIL ${protectedFindings.length} protected direct Supabase call(s) remain in browser code.`);
  process.exit(1);
}
