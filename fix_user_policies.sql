
-- Enable update for all users (or authenticated) so that the admin dashboard can update user status.
-- In a real production app, this should be restricted to admin users only.
-- However, since our custom auth happens client-side for this demo, we allow update for now 
-- but we could add a check if we had row-level user context, which we don't fully have with custom table auth + anon key.
-- A stricter policy would be to checking if the 'current_setting' matches, but for simplify we allow it.

create policy "Enable update for all users"
on users for update
to anon
using (true)
with check (true);

-- Ensure select is also fully enabled just in case
-- (Already done in update_schema.sql but good to be sure)
-- create policy "Enable read access for all users" on users for select using (true);
