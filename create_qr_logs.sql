-- Create 'qr_logs' table for QR Code generation history
CREATE TABLE IF NOT EXISTS qr_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  business_unit text,
  channel text,
  campaign_tag text,
  generated_url text NOT NULL,
  created_by text NOT NULL
);

-- Enable RLS
ALTER TABLE qr_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert qr_logs"
ON qr_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow anon insert (for users using legacy auth)
CREATE POLICY "Allow anon insert qr_logs"
ON qr_logs FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Allow reading logs
CREATE POLICY "Allow read qr_logs"
ON qr_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anon read qr_logs"
ON qr_logs FOR SELECT
TO anon
USING (true);

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_qr_logs_created_at ON qr_logs(created_at DESC);
