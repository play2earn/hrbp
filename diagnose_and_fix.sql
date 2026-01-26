-- ==============================================
-- STEP 1: CHECK IF APPLICATIONS EXIST
-- ==============================================
SELECT 
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'Hired' THEN 1 END) as hired,
  COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
FROM applications;

-- View latest 10 applications
SELECT id, full_name, email, status, created_at 
FROM applications 
ORDER BY created_at DESC 
LIMIT 10;

-- ==============================================
-- STEP 2: CHECK RLS STATUS
-- ==============================================
SELECT 
  relname as table_name, 
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'applications';

-- Check existing policies
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual::text as using_clause, 
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'applications';

-- ==============================================
-- STEP 3: FIX - ALLOW AUTHENTICATED USERS TO READ
-- Run this if you see applications exist but can't read them
-- ==============================================

-- Make sure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing select policy and recreate
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON applications;

CREATE POLICY "Enable read access for authenticated users only"
ON applications FOR SELECT
TO authenticated
USING (true);

-- Also add policy for anon to read (for testing/fallback)
-- Uncomment below if you want anon users to also read:
-- DROP POLICY IF EXISTS "Enable read access for anon" ON applications;
-- CREATE POLICY "Enable read access for anon"
-- ON applications FOR SELECT
-- TO anon
-- USING (true);

-- ==============================================
-- STEP 4: CHECK USERS TABLE FOR YOUR LOGIN
-- ==============================================
SELECT id, email, role, status, created_at
FROM users
WHERE status = 'Active'
ORDER BY created_at DESC;

-- ==============================================
-- STEP 5: VERIFY AUTH SETTINGS
-- Check if your user exists in Supabase Auth
-- ==============================================
SELECT id, email, role, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
