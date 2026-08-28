-- ==============================================================================
-- 1. Create table system_api_key_logs (API Traffic & Latency Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS system_api_key_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Reference to API Key
  api_key_id UUID REFERENCES system_api_keys(id) ON DELETE CASCADE,
  key_prefix TEXT,
  key_name TEXT,
  
  -- Request Details
  endpoint TEXT NOT NULL,          -- e.g. '/api?route=hrms-export'
  http_method TEXT NOT NULL,       -- 'GET', 'POST', etc.
  status_code INTEGER NOT NULL,    -- 200, 400, 401, 500
  ip_address TEXT,                 -- Client IP
  user_agent TEXT,                 -- Client User-Agent string
  response_time_ms INTEGER,        -- Latency in milliseconds
  
  -- Parameters & Summary
  query_params JSONB DEFAULT '{}'::jsonb,
  summary TEXT,                    -- e.g. 'Exported 3 records', 'ACK Employee EMP-69001'
  error_message TEXT               -- Failure reason if any
);

-- Enable RLS
ALTER TABLE system_api_key_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon/authenticated (server-side handles actual verification)
DROP POLICY IF EXISTS "Allow insertion of api key logs" ON system_api_key_logs;
CREATE POLICY "Allow insertion of api key logs"
ON system_api_key_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow select for authenticated staff
DROP POLICY IF EXISTS "Allow select of api key logs" ON system_api_key_logs;
CREATE POLICY "Allow select of api key logs"
ON system_api_key_logs FOR SELECT
TO authenticated
USING (true);

-- Allow delete for authenticated staff (for retention cleanup)
DROP POLICY IF EXISTS "Allow delete of api key logs" ON system_api_key_logs;
CREATE POLICY "Allow delete of api key logs"
ON system_api_key_logs FOR DELETE
TO authenticated
USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_key_id ON system_api_key_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON system_api_key_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON system_api_key_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON system_api_key_logs(endpoint);
