
-- Part 1: Ensure is_active column exists (IDEMPOTENT)
ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE business_units ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE subdistricts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Part 2: RLS Policies for INSERT and UPDATE (IDEMPOTENT)
-- CRITICAL FIX: Changed TO 'anon' because the app uses a custom 'users' table
-- and does not establish a Supabase Auth session for these users.
-- This effectively makes the tables public-writable, which is necessary for this custom auth impl.

-- Departments
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON departments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON departments;
DROP POLICY IF EXISTS "Enable insert for anon users" ON departments;
DROP POLICY IF EXISTS "Enable update for anon users" ON departments;

CREATE POLICY "Enable insert for anon users" ON departments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON departments FOR UPDATE TO anon USING (true);

-- Positions
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON positions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON positions;
DROP POLICY IF EXISTS "Enable insert for anon users" ON positions;
DROP POLICY IF EXISTS "Enable update for anon users" ON positions;

CREATE POLICY "Enable insert for anon users" ON positions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON positions FOR UPDATE TO authenticated, anon USING (true);

-- Business Units
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON business_units;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON business_units;
DROP POLICY IF EXISTS "Enable insert for anon users" ON business_units;
DROP POLICY IF EXISTS "Enable update for anon users" ON business_units;

CREATE POLICY "Enable insert for anon users" ON business_units FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON business_units FOR UPDATE TO anon USING (true);

-- Channels
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON channels;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON channels;
DROP POLICY IF EXISTS "Enable insert for anon users" ON channels;
DROP POLICY IF EXISTS "Enable update for anon users" ON channels;

CREATE POLICY "Enable insert for anon users" ON channels FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON channels FOR UPDATE TO anon USING (true);

-- Universities
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON universities;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON universities;
DROP POLICY IF EXISTS "Enable insert for anon users" ON universities;
DROP POLICY IF EXISTS "Enable update for anon users" ON universities;

CREATE POLICY "Enable insert for anon users" ON universities FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON universities FOR UPDATE TO anon USING (true);

-- Faculties
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON faculties;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON faculties;
DROP POLICY IF EXISTS "Enable insert for anon users" ON faculties;
DROP POLICY IF EXISTS "Enable update for anon users" ON faculties;

CREATE POLICY "Enable insert for anon users" ON faculties FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON faculties FOR UPDATE TO anon USING (true);

-- Provinces
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON provinces;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON provinces;
DROP POLICY IF EXISTS "Enable insert for anon users" ON provinces;
DROP POLICY IF EXISTS "Enable update for anon users" ON provinces;

CREATE POLICY "Enable insert for anon users" ON provinces FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON provinces FOR UPDATE TO anon USING (true);

-- Districts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON districts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON districts;
DROP POLICY IF EXISTS "Enable insert for anon users" ON districts;
DROP POLICY IF EXISTS "Enable update for anon users" ON districts;

CREATE POLICY "Enable insert for anon users" ON districts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON districts FOR UPDATE TO anon USING (true);

-- Subdistricts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON subdistricts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON subdistricts;
DROP POLICY IF EXISTS "Enable insert for anon users" ON subdistricts;
DROP POLICY IF EXISTS "Enable update for anon users" ON subdistricts;

CREATE POLICY "Enable insert for anon users" ON subdistricts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable update for anon users" ON subdistricts FOR UPDATE TO anon USING (true);
