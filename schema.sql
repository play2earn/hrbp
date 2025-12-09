-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- Create the 'applications' table
create table if not exists applications (
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

-- Enable Row Level Security (RLS)
alter table applications enable row level security;

-- Policy: Allow anyone (anon) to insert applications
create policy "Enable insert for everyone"
on applications for insert
to anon
with check (true);

-- Policy: Allow authenticated users (admin/mod) to view applications
create policy "Enable read access for authenticated users only"
on applications for select
to authenticated
using (true);

-- Policy: Allow authenticated users to update applications
create policy "Enable update for authenticated users only"
on applications for update
to authenticated
using (true);

-- Create a storage bucket for applicant files
insert into storage.buckets (id, name, public)
values ('applicants', 'applicants', true)
on conflict (id) do nothing;

-- Policy: Allow anyone to upload files to 'applicants' bucket
create policy "Give public access to insert"
on storage.objects for insert
to anon
with check ( bucket_id = 'applicants' );

-- Policy: Allow anyone to view files in 'applicants' bucket
create policy "Give public access to select"
on storage.objects for select
to public
using ( bucket_id = 'applicants' );
