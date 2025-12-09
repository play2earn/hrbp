-- Create 'users' table for custom auth
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null unique,
  password text not null, -- Storing plain text as requested for this demo
  role text not null check (role in ('admin', 'mod')),
  phone text,
  status text default 'Active'::text
);

-- Enable RLS
alter table users enable row level security;

-- Policy: Allow public insert (registration)
create policy "Allow public registration"
on users for insert
to anon
with check (true);

-- Policy: Allow public insert (authenticated users too, if needed)
create policy "Allow authenticated registration"
on users for insert
to authenticated
with check (true);

-- Policy: Allow reading own data or if admin (simplified: allow public read for login check)
-- In a real app we'd use a secure function, but for this demo:
create policy "Allow public read for login"
on users for select
to anon
using (true);

create policy "Allow authenticated read"
on users for select
to authenticated
using (true);
