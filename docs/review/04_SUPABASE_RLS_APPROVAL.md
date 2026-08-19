# Supabase RLS and GRANT Approval

## Current blocker

Repository audit currently finds protected direct Supabase calls in browser code. Therefore the revoke migration must remain unapplied until:

```bash
npm run audit:supabase-client:strict
```

passes with zero protected findings.

## Migration sequence per resource group

1. Add authenticated BFF endpoint using server-only service credentials
2. Change browser caller to the BFF endpoint
3. Test happy path and unauthorized path
4. Deploy application code
5. Revoke `anon`/`authenticated` grants and remove permissive RLS policies for that resource
6. Run a negative query using the browser key and confirm denial

## Recommended order

1. `blacklist`, `blacklist_audit_logs`, `application_share_tokens`
2. `users`
3. `system_activity_logs`, `application_logs`, `interview_evaluations`, `qr_logs`
4. `applications` and workflow RPCs
5. Reports/views
6. Master/reference tables; retain public SELECT only where the applicant form genuinely needs it

## Security rules

- RLS and table/function GRANT are separate controls; review both
- Views must use `security_invoker` where supported or be removed from exposed roles
- `SECURITY DEFINER` functions must not be executable by `anon` unless explicitly designed as a narrow public API
- Public submission should use a narrow server endpoint, not broad `anon INSERT/UPDATE`
- Service-role credentials remain server-only

## Approval checklist

- [ ] Read-only audit SQL reviewed and executed in staging
- [ ] Migration preconditions match the actual policy/function names
- [ ] Browser strict audit passes
- [ ] Negative anon tests pass per table/function
- [ ] Supabase Security Advisor reviewed after staging migration
- [ ] Backup and rollback SQL reviewed
