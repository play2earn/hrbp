# Production Cutover

## Go criteria

- [ ] Environment preflight passes
- [ ] `npm run check` passes
- [ ] Staging security smoke test passes
- [ ] Manual acceptance checklist passes
- [ ] New secrets exist in production environment
- [ ] Frontend and API are built from the same revision
- [ ] Database migration is either explicitly approved or excluded from this change window
- [ ] Storage flags and rollback target are recorded

## Change window

1. Record current deployment revision and feature flags
2. Confirm backup and external provider status
3. Deploy frontend and API together
4. Run unauthenticated smoke test
5. Run admin/mod/applicant/share/resubmit acceptance samples
6. Monitor authentication failures, 4xx/5xx and upload failures
7. Revoke old credentials only after validation

`/api/clean-orphans` เป็น report-only สำหรับ Vercel Cron; การลบต้องมาจาก admin session พร้อม `POST { "action": "delete-confirmed" }` หลังตรวจรายชื่อ candidate แล้วเท่านั้น

## Stop/rollback triggers

- Login activation failure above agreed threshold
- Applicant submit/finalize failure
- Unauthorized file access or unexpected public object access
- Database authorization errors on normal HR workflow
- New 5xx spike

## Actions requiring explicit approval

- Production deploy/cutover
- Secret or AgentCode rotation/revocation
- Supabase migration apply
- S3/R2 public-access changes
- Permanent object deletion
