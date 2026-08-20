import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatchApiRoute, type ApiHandlerLoader } from '../server/api-router';

const handlers: Record<string, ApiHandlerLoader> = {
  blacklist: () => import('../handlers/blacklist'),
  'clean-orphans': () => import('../handlers/clean-orphans'),
  'complete-resubmit': () => import('../handlers/complete-resubmit'),
  'draft-files': () => import('../handlers/draft-files'),
  'draft-session': () => import('../handlers/draft-session'),
  files: () => import('../handlers/files'),
  'finalize-attachments': () => import('../handlers/finalize-attachments'),
  'idms-auth': () => import('../handlers/idms-auth'),
  'proxy-image': () => import('../handlers/proxy-image'),
  'register-hrms-user': () => import('../handlers/register-hrms-user'),
  's3-explorer': () => import('../handlers/s3-explorer'),
  session: () => import('../handlers/session'),
  'share-tokens': () => import('../handlers/share-tokens'),
  tracking: () => import('../handlers/tracking'),
  trash: () => import('../handlers/trash'),
  'upload-s3': () => import('../handlers/upload-s3'),
  'verify-resubmit-pin': () => import('../handlers/verify-resubmit-pin'),
  'worklog-emp-info': () => import('../handlers/worklog-emp-info'),
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return dispatchApiRoute(req, res, handlers);
}
