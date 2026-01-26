-- ==============================================
-- FIX: Allow authenticated AND anon to read applications
-- This fixes the issue where legacy auth users can't see data
-- ==============================================

-- 1. Make sure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON applications;
DROP POLICY IF EXISTS "Enable read access for anon" ON applications;
DROP POLICY IF EXISTS "Allow all to read" ON applications;

-- 3. Create new broad read policy (for both authenticated and anon)
CREATE POLICY "Allow all to read"
ON applications FOR SELECT
TO public
USING (true);

-- 4. Keep insert policy for anon (application submission)
DROP POLICY IF EXISTS "Enable insert for everyone" ON applications;
CREATE POLICY "Enable insert for everyone"
ON applications FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Keep update policy for authenticated (status changes)
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON applications;
CREATE POLICY "Enable update for authenticated users only"
ON applications FOR UPDATE
TO authenticated
USING (true);

-- Also allow anon to update (for legacy auth users)
DROP POLICY IF EXISTS "Enable update for anon" ON applications;
CREATE POLICY "Enable update for anon"
ON applications FOR UPDATE
TO anon
USING (true);

-- ==============================================
-- VERIFICATION: Check the new policies
-- ==============================================
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'applications';
