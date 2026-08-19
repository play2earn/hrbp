export type AttachmentStorageMode = 'r2-legacy' | 's3-primary';
export type DraftAccessMode = 'legacy-public' | 'private-proxy';

export function getAttachmentStorageMode(env: NodeJS.ProcessEnv = process.env): AttachmentStorageMode {
  const value = env.ATTACHMENT_STORAGE_MODE || 'r2-legacy';
  if (value !== 'r2-legacy' && value !== 's3-primary') throw new Error(`Invalid ATTACHMENT_STORAGE_MODE: ${value}`);
  return value;
}

export function getDraftAccessMode(env: NodeJS.ProcessEnv = process.env): DraftAccessMode {
  const value = env.R2_DRAFT_ACCESS_MODE || 'legacy-public';
  if (value !== 'legacy-public' && value !== 'private-proxy') throw new Error(`Invalid R2_DRAFT_ACCESS_MODE: ${value}`);
  return value;
}

function normalizedPublicDomain(env: NodeJS.ProcessEnv): string {
  const domain = String(env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, '');
  if (!domain) throw new Error('R2_PUBLIC_DOMAIN is required for legacy-public access');
  return domain;
}

export function draftObjectUrl(draftId: string, key: string, env: NodeJS.ProcessEnv = process.env): string {
  if (getDraftAccessMode(env) === 'private-proxy') {
    return `/api/draft-files?draftId=${encodeURIComponent(draftId)}&key=${encodeURIComponent(key)}`;
  }
  return `${normalizedPublicDomain(env)}/${key}`;
}

export function permanentObjectUrl(key: string, env: NodeJS.ProcessEnv = process.env): string {
  if (getAttachmentStorageMode(env) === 's3-primary') return `/api/files?key=${encodeURIComponent(key)}`;
  return `${normalizedPublicDomain(env)}/${key}`;
}

export function possibleDraftUrls(draftId: string, key: string, env: NodeJS.ProcessEnv = process.env): string[] {
  const urls = [`/api/draft-files?draftId=${encodeURIComponent(draftId)}&key=${encodeURIComponent(key)}`];
  if (env.R2_PUBLIC_DOMAIN) urls.push(`${String(env.R2_PUBLIC_DOMAIN).replace(/\/$/, '')}/${key}`);
  return urls;
}

export function replaceObjectReferences<T>(value: T, replacements: Array<{ from: string; to: string }>): T {
  if (value === null || value === undefined) return value;
  let serialized = JSON.stringify(value);
  for (const replacement of replacements) serialized = serialized.split(replacement.from).join(replacement.to);
  return JSON.parse(serialized) as T;
}
