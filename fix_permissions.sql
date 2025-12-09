-- 1. Reset RLS Policies for 'applications'
alter table applications enable row level security;

drop policy if exists "Enable insert for everyone" on applications;
drop policy if exists "Enable read access for authenticated users only" on applications;
drop policy if exists "Enable update for authenticated users only" on applications;

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

-- 2. Create Storage Bucket (if missing)
insert into storage.buckets (id, name, public)
values ('applicants', 'applicants', true)
on conflict (id) do nothing;

-- 3. Reset Storage Policies
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
