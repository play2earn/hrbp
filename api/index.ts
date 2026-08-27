import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatchApiRoute, type ApiHandlerLoader } from '../server/api-router.js';

const handlers: Record<string, ApiHandlerLoader> = {
  'application-delete': () => import('../handlers/application-delete.js'),
  'application-edit': () => import('../handlers/application-edit.js'),
  blacklist: () => import('../handlers/blacklist.js'),
  'candidate-evaluations': () => import('../handlers/candidate-evaluations.js'),
  'clean-orphans': () => import('../handlers/clean-orphans.js'),
  'complete-resubmit': () => import('../handlers/complete-resubmit.js'),
  'draft-files': () => import('../handlers/draft-files.js'),
  'draft-session': () => import('../handlers/draft-session.js'),
  'evaluation-templates': () => import('../handlers/evaluation-templates.js'),
  files: () => import('../handlers/files.js'),
  'finalize-attachments': () => import('../handlers/finalize-attachments.js'),
  'idms-auth': () => import('../handlers/idms-auth.js'),
  'proxy-image': () => import('../handlers/proxy-image.js'),
  'register-hrms-user': () => import('../handlers/register-hrms-user.js'),
  's3-explorer': () => import('../handlers/s3-explorer.js'),
  session: () => import('../handlers/session.js'),
  'share-tokens': () => import('../handlers/share-tokens.js'),
  'storage-migration-audit': () => import('../handlers/storage-migration-audit.js'),
  tracking: () => import('../handlers/tracking.js'),
  trash: () => import('../handlers/trash.js'),
  'upload-s3': () => import('../handlers/upload-s3.js'),
  'verify-resubmit-pin': () => import('../handlers/verify-resubmit-pin.js'),
  'worklog-emp-info': () => import('../handlers/worklog-emp-info.js'),
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return dispatchApiRoute(req, res, handlers);
}
