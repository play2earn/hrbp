-- DANGER: This will delete existing application data
-- 1. Reset Table
drop table if exists applications cascade;

-- 2. Reset Extenstions
create extension if not exists "uuid-ossp";

-- 3. Recreate Table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  position text not null,
  department text not null,
  full_name text not null,
  email text not null,
  phone text,
  status text default 'Pending'::text,
  form_data jsonb default '{}'::jsonb
);

-- 4. Re-Security
alter table applications enable row level security;

create policy "Enable insert for everyone"
on applications for insert
to anon
with check (true);

create policy "Enable read access for authenticated users only"
on applications for select
to authenticated
using (true);

create policy "Enable update for authenticated users only"
on applications for update
to authenticated
using (true);

-- 5. STORAGE RESET (Try to insert bucket if not exists)
insert into storage.buckets (id, name, public)
values ('applicants', 'applicants', true)
on conflict (id) do nothing;

-- 6. Storage Policies (Drop old ones first to be safe)
drop policy if exists "Give public access to insert" on storage.objects;
drop policy if exists "Give public access to select" on storage.objects;

create policy "Give public access to insert"
on storage.objects for insert
to anon
with check ( bucket_id = 'applicants' );

create policy "Give public access to select"
on storage.objects for select
to public
using ( bucket_id = 'applicants' );
