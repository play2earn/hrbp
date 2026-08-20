import fs from 'node:fs';
import path from 'node:path';

const apiDirectory = path.resolve('api');
const maxFunctions = 12;

function collectFunctions(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFunctions(fullPath);
    if (!/\.(?:[cm]?[jt]s)$/.test(entry.name) || entry.name.endsWith('.d.ts')) return [];
    return [path.relative(process.cwd(), fullPath)];
  });
}

const functions = collectFunctions(apiDirectory).sort();
console.log(`Vercel function count: ${functions.length}/${maxFunctions}`);
for (const file of functions) console.log(`- ${file}`);
if (functions.length > maxFunctions) {
  console.error(`FAIL Hobby plan allows no more than ${maxFunctions} Serverless Functions.`);
  process.exit(1);
}
console.log('PASS Vercel Serverless Function count is within the Hobby plan limit.');
