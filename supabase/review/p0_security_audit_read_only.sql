-- READ ONLY: run in Supabase SQL Editor before approving any RLS/GRANT migration.
-- This file intentionally contains SELECT statements only.

-- 1. RLS state for application-owned tables in the exposed public schema.
select
  n.nspname as schema_name,
  c.relname as relation_name,
  c.relkind as relation_kind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p', 'v', 'm')
order by c.relkind, c.relname;

-- 2. Policies granted to public/browser roles.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and roles::text[] && array['public', 'anon', 'authenticated']::text[]
order by tablename, policyname;

-- 3. Explicit table/view grants to browser roles.
select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 4. SECURITY DEFINER routines and browser execution grants.
select
  n.nspname as schema_name,
  p.proname as routine_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname, arguments;

-- 5. Views and whether security_invoker is explicitly enabled.
select
  n.nspname as schema_name,
  c.relname as view_name,
  coalesce(c.reloptions::text, '') as relation_options
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'v'
order by c.relname;

-- 6. Detect legacy header/shared-secret policies without exposing secret values separately.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and (
    coalesce(qual, '') ilike '%request.headers%'
    or coalesce(with_check, '') ilike '%request.headers%'
    or coalesce(qual, '') ilike '%x-admin-key%'
    or coalesce(with_check, '') ilike '%x-admin-key%'
  )
order by tablename, policyname;

-- 7. Supabase Storage bucket visibility.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
order by id;
