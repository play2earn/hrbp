-- Policy: Allow authenticated users to insert applications
create policy "Enable insert for authenticated users"
on applications for insert
to authenticated
with check (true);
