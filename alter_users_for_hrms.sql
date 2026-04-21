-- Update users table for HRMS Integration
-- 1. Add fields for IDMS linkage
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS emp_id TEXT,
ADD COLUMN IF NOT EXISTS hrms_username TEXT;

-- 2. Drop the legacy password field since IDMS validates password now
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- 3. Update RLS policies (optional, to ensure no password requirements break insertion)
-- Existing policies using (true) should still apply properly.
