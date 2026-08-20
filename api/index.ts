import type { VercelRequest, VercelResponse } from '@vercel/node';
import blacklist from '../handlers/blacklist';
import cleanOrphans from '../handlers/clean-orphans';
import completeResubmit from '../handlers/complete-resubmit';
import draftFiles from '../handlers/draft-files';
import draftSession from '../handlers/draft-session';
import files from '../handlers/files';
import finalizeAttachments from '../handlers/finalize-attachments';
import idmsAuth from '../handlers/idms-auth';
import proxyImage from '../handlers/proxy-image';
import registerHrmsUser from '../handlers/register-hrms-user';
import s3Explorer from '../handlers/s3-explorer';
import session from '../handlers/session';
import shareTokens from '../handlers/share-tokens';
import tracking from '../handlers/tracking';
import trash from '../handlers/trash';
import uploadS3 from '../handlers/upload-s3';
import verifyResubmitPin from '../handlers/verify-resubmit-pin';
import worklogEmpInfo from '../handlers/worklog-emp-info';
import { dispatchApiRoute, type ApiHandler } from '../server/api-router';

const handlers: Record<string, ApiHandler> = {
  blacklist,
  'clean-orphans': cleanOrphans,
  'complete-resubmit': completeResubmit,
  'draft-files': draftFiles,
  'draft-session': draftSession,
  files,
  'finalize-attachments': finalizeAttachments,
  'idms-auth': idmsAuth,
  'proxy-image': proxyImage,
  'register-hrms-user': registerHrmsUser,
  's3-explorer': s3Explorer,
  session,
  'share-tokens': shareTokens,
  tracking,
  trash,
  'upload-s3': uploadS3,
  'verify-resubmit-pin': verifyResubmitPin,
  'worklog-emp-info': worklogEmpInfo,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return dispatchApiRoute(req, res, handlers);
}
