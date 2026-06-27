-- Create table system_activity_logs
CREATE TABLE IF NOT EXISTS system_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- WHO (user_id can be null if failed login or system action)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT, -- 'admin', 'mod', 'unauthenticated'
  
  -- WHAT & WHERE
  action TEXT NOT NULL, -- 'login_success', 'login_failed', 'view_candidate_profile', 'view_blacklist_detail', 'view_tab_reports', 'view_tab_config', 'view_tab_blacklist', 'export_report'
  target_id UUID, -- application_id or blacklist_id etc.
  target_name TEXT, -- candidate name or other entity labels
  
  -- HOW/DETAILS
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE system_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (authenticated or anon) to insert logs
DROP POLICY IF EXISTS "Allow insertion of system logs for everyone" ON system_activity_logs;
CREATE POLICY "Allow insertion of system logs for everyone" 
ON system_activity_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Policy: Allow reading logs for authenticated users (we will enforce admin-only check in code, but allow reading for authorized client requests)
DROP POLICY IF EXISTS "Allow read of system logs for everyone" ON system_activity_logs;
CREATE POLICY "Allow read of system logs for everyone" 
ON system_activity_logs FOR SELECT 
TO authenticated 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_name ON system_activity_logs(user_name);
