-- ==============================================
-- VERIFY ALL RLS POLICIES FOR APPLICATIONS TABLE
-- ==============================================

-- 1. Check current policies
SELECT 
  policyname, 
  permissive, 
  roles::text, 
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'applications'
ORDER BY cmd;

-- ==============================================
-- ENSURE COMPLETE RLS COVERAGE
-- ==============================================

-- Make sure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- DROP all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all to read" ON applications;
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON applications;
DROP POLICY IF EXISTS "Enable read access for anon" ON applications;
DROP POLICY IF EXISTS "Enable insert for everyone" ON applications;
DROP POLICY IF EXISTS "Enable insert for anon" ON applications;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON applications;
DROP POLICY IF EXISTS "Enable update for anon" ON applications;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON applications;

-- ==============================================
-- CREATE COMPLETE POLICY SET
-- ==============================================

-- SELECT: Allow everyone to read (fixes legacy auth issue)
CREATE POLICY "Allow public read"
ON applications FOR SELECT
TO public
USING (true);

-- INSERT: Allow anon to submit applications (public form)
CREATE POLICY "Allow anon insert"
ON applications FOR INSERT
TO anon
WITH CHECK (true);

-- INSERT: Allow authenticated to also insert (for admin creating apps)
CREATE POLICY "Allow authenticated insert"
ON applications FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Allow anon to update (legacy auth admins)
CREATE POLICY "Allow anon update"
ON applications FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- UPDATE: Allow authenticated to update (proper auth admins)
CREATE POLICY "Allow authenticated update"
ON applications FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Allow authenticated to delete (optional, for cleanup)
CREATE POLICY "Allow authenticated delete"
ON applications FOR DELETE
TO authenticated
USING (true);

-- ==============================================
-- VERIFY FINAL POLICIES
-- ==============================================
SELECT 
  policyname, 
  roles::text, 
  cmd
FROM pg_policies 
WHERE tablename = 'applications'
ORDER BY cmd, policyname;

-- ==============================================
-- TEST INSERT (run this to verify insert works)
-- ==============================================
-- INSERT INTO applications (position, department, full_name, email, status)
-- VALUES ('Test Position', 'Test Dept', 'Test User', 'test@test.com', 'Pending')
-- RETURNING id, full_name;

-- Then delete the test:
-- DELETE FROM applications WHERE email = 'test@test.com';
