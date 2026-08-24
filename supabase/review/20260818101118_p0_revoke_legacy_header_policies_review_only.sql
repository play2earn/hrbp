-- REVIEW ONLY — DO NOT APPLY until all approval gates in
-- docs/review/04_SUPABASE_RLS_APPROVAL.md are complete.
--
-- Scope: resources whose browser callers have already moved behind server APIs.
-- This intentionally excludes users, applications, logs, reports, master data,
-- workflow RPCs, and storage.objects because direct browser callers remain.

begin;

do $$
declare
  missing_relations text[] := array[]::text[];
  relation_name text;
begin
  foreach relation_name in array array['blacklist', 'blacklist_audit_logs', 'application_share_tokens']
  loop
    if to_regclass(format('public.%I', relation_name)) is null then
      missing_relations := array_append(missing_relations, relation_name);
    end if;
  end loop;
  if cardinality(missing_relations) > 0 then
    raise exception 'P0 migration precondition failed; missing relations: %', array_to_string(missing_relations, ', ');
  end if;
end
$$;

alter table public.blacklist enable row level security;
alter table public.blacklist_audit_logs enable row level security;
alter table public.application_share_tokens enable row level security;

-- Remove only policies that include browser/public roles. Policies dedicated to
-- another database role are preserved.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('blacklist', 'blacklist_audit_logs', 'application_share_tokens')
      and roles::text[] && array['public', 'anon', 'authenticated']::text[]
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

revoke all privileges on table public.blacklist from public, anon, authenticated;
revoke all privileges on table public.blacklist_audit_logs from public, anon, authenticated;
revoke all privileges on table public.application_share_tokens from public, anon, authenticated;

commit;

-- Required post-apply negative tests (run with the browser publishable/anon key):
-- * SELECT/INSERT/UPDATE/DELETE blacklist => denied
-- * SELECT/INSERT blacklist_audit_logs => denied
-- * SELECT/INSERT/UPDATE application_share_tokens => denied
-- Server APIs /api/blacklist, /api/share-tokens, /api/tracking and resubmit flows
-- must continue to work through server-only service credentials.
