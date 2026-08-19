const test = require('node:test');
const assert = require('node:assert/strict');

process.env.HRBP_SESSION_SECRET = 'test-only-session-secret-that-is-at-least-32-characters';
process.env.R2_PUBLIC_DOMAIN = 'https://files.example.com/hrbp';
process.env.SUPABASE_URL = 'https://project.supabase.co';
process.env.AWS_S3_BUCKET = 'private-hrbp';
process.env.AWS_REGION = 'ap-southeast-1';
const security = require('../.tmp-test/security.cjs');
const fileAccess = require('../.tmp-test/file-access.cjs');
const storage = require('../.tmp-test/storage.cjs');
const origin = require('../.tmp-test/origin.cjs');
const orphanCleanup = require('../.tmp-test/orphan-cleanup.cjs');
const hrAccess = require('../.tmp-test/hr-access.cjs');

test('signed staff session verifies and preserves claims', () => {
  const now = Math.floor(Date.now() / 1000);
  const token = security.signSession({ kind: 'staff', iat: now, exp: now + 60, sub: 'user-1' });
  const result = security.verifySessionToken(token, 'staff');
  assert.equal(result.sub, 'user-1');
});

test('tampered and wrong-kind sessions fail closed', () => {
  const now = Math.floor(Date.now() / 1000);
  const token = security.signSession({ kind: 'draft', iat: now, exp: now + 60, draftId: 'draft-1' });
  assert.equal(security.verifySessionToken(`${token.slice(0, -1)}x`, 'draft'), null);
  assert.equal(security.verifySessionToken(token, 'staff'), null);
});

test('expired sessions fail closed', () => {
  const now = Math.floor(Date.now() / 1000);
  const token = security.signSession({ kind: 'staff', iat: now - 120, exp: now - 60, sub: 'user-1' });
  assert.equal(security.verifySessionToken(token, 'staff'), null);
});

test('cookie parser handles encoded values and embedded equals signs', () => {
  assert.deepEqual(security.parseCookies('a=one%20two; token=abc%3Ddef'), { a: 'one two', token: 'abc=def' });
});

test('safe comparison rejects different secrets', () => {
  assert.equal(security.safeEqual('same', 'same'), true);
  assert.equal(security.safeEqual('same', 'different'), false);
});

test('storage URL allowlist accepts object paths but rejects same-host REST endpoints', () => {
  assert.equal(fileAccess.isAllowedStorageUrl('https://files.example.com/hrbp/drafts/file.pdf'), true);
  assert.equal(fileAccess.isAllowedStorageUrl('https://project.supabase.co/storage/v1/object/public/applicants/file.pdf'), true);
  assert.equal(fileAccess.isAllowedStorageUrl('https://project.supabase.co/rest/v1/users?select=*'), false);
  assert.equal(fileAccess.isAllowedStorageUrl('https://private-hrbp.s3.ap-southeast-1.amazonaws.com/applicants/file.pdf'), true);
  assert.equal(fileAccess.isAllowedStorageUrl('http://169.254.169.254/latest/meta-data'), false);
});

test('storage feature flags default to legacy and private modes produce API URLs', () => {
  assert.equal(storage.getAttachmentStorageMode({}), 'r2-legacy');
  assert.equal(storage.getDraftAccessMode({}), 'legacy-public');
  const env = { R2_DRAFT_ACCESS_MODE: 'private-proxy', ATTACHMENT_STORAGE_MODE: 's3-primary' };
  assert.equal(storage.draftObjectUrl('draft-12345678901234567890', 'drafts/draft-12345678901234567890/file.pdf', env),
    '/api/draft-files?draftId=draft-12345678901234567890&key=drafts%2Fdraft-12345678901234567890%2Ffile.pdf');
  assert.equal(storage.permanentObjectUrl('applicants/app-1/file.pdf', env), '/api/files?key=applicants%2Fapp-1%2Ffile.pdf');
  assert.throws(() => storage.getAttachmentStorageMode({ ATTACHMENT_STORAGE_MODE: 'invalid' }));
});

test('draft URL replacement rewrites nested attachment references only', () => {
  const input = { photoUrl: 'https://files.example.com/drafts/draft-1/photo.jpg', note: 'unchanged' };
  const output = storage.replaceObjectReferences(input, [{
    from: 'https://files.example.com/drafts/draft-1/photo.jpg',
    to: '/api/files?key=applicants%2Fapp-1%2Fphoto.jpg',
  }]);
  assert.deepEqual(output, { photoUrl: '/api/files?key=applicants%2Fapp-1%2Fphoto.jpg', note: 'unchanged' });
});

test('preview share links use the current Vercel branch host', () => {
  const req = { headers: { host: 'hrbp-git-security-review.example.vercel.app', 'x-forwarded-proto': 'https' } };
  const env = { NODE_ENV: 'production', VERCEL_ENV: 'preview', APP_ORIGIN: 'https://hrbp-three.vercel.app' };
  assert.equal(origin.publicAppOrigin(req, env), 'https://hrbp-git-security-review.example.vercel.app');
});

test('production share links retain the configured canonical origin', () => {
  const req = { headers: { host: 'hrbp-immutable-build.vercel.app', 'x-forwarded-proto': 'https' } };
  const env = { NODE_ENV: 'production', VERCEL_ENV: 'production', APP_ORIGIN: 'https://hrbp-three.vercel.app' };
  assert.equal(origin.publicAppOrigin(req, env), 'https://hrbp-three.vercel.app');
});

test('orphan reference scan finds every nested R2 URL', () => {
  const domain = 'https://files.example.com';
  const value = {
    photo_url: `${domain}/applicants/app-1/photo.jpg`,
    form_data: {
      idCardUrl: `${domain}/applicants/app-1/id-card.pdf`,
      education: [{ transcriptUrl: `${domain}/applicants/app-1/transcript.pdf?version=1` }],
    },
  };
  assert.deepEqual([...orphanCleanup.collectReferencedR2Keys(value, domain)].sort(), [
    'applicants/app-1/id-card.pdf',
    'applicants/app-1/photo.jpg',
    'applicants/app-1/transcript.pdf',
  ]);
});

test('HR authorization fails closed when organization data is missing', () => {
  assert.equal(hrAccess.checkIsHrTeam(), false);
  assert.equal(hrAccess.checkIsHrTeam('Software Engineer', 'Technology'), false);
  assert.equal(hrAccess.checkIsHrTeam('Three-dimensional designer', 'Creative'), false);
  assert.equal(hrAccess.checkIsHrTeam('Recruiter', 'Human Resources'), true);
  assert.equal(hrAccess.checkIsHrTeam('Manager', 'HRBP'), true);
});
