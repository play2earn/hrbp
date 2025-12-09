
-- Decouple Channels from Business Units
-- Remove the FK constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'channels_bu_id_fkey') THEN
    ALTER TABLE channels DROP CONSTRAINT channels_bu_id_fkey;
  END IF;
END $$;

-- Make bu_id nullable (it might already be, but good to ensure)
ALTER TABLE channels ALTER COLUMN bu_id DROP NOT NULL;

-- Remove validiation/constraint if any others exist
-- (Assuming standard constraint naming from CREATE TABLE ... REFERENCES)
