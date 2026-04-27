-- Create 'users' table for custom auth
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null unique,
  password text not null, -- Storing plain text as requested for this demo
  role text not null check (role in ('admin', 'mod')),
  phone text,
  status text default 'Active'::text
);

-- Enable RLS
alter table users enable row level security;

-- Policy: Allow public insert (registration)
create policy "Allow public registration"
on users for insert
to anon
with check (true);

-- Policy: Allow public insert (authenticated users too, if needed)
create policy "Allow authenticated registration"
on users for insert
to authenticated
with check (true);

-- Policy: Allow reading own data or if admin (simplified: allow public read for login check)
-- In a real app we'd use a secure function, but for this demo:
create policy "Allow public read for login"
on users for select
to anon
using (true);

create policy "Allow authenticated read"
on users for select
to authenticated
using (true);

-- Reporting Columns
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS interviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS hired_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================================
-- Recruitment Workflow: assignment, audit log, reports, RPC
-- ============================================================

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_by TEXT,
ADD COLUMN IF NOT EXISTS interview_date DATE,
ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS offer_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS no_show_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_assigned_to_fkey'
  ) THEN
    ALTER TABLE applications
    ADD CONSTRAINT applications_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_assigned_to ON applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_business_unit ON applications(business_unit);

CREATE TABLE IF NOT EXISTS rejection_reasons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label_th TEXT NOT NULL,
  label_en TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'rejected',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO rejection_reasons (code, label_th, label_en, category, sort_order)
VALUES
  ('qualification_mismatch', 'คุณสมบัติไม่ตรง', 'Qualification mismatch', 'rejected', 10),
  ('failed_interview', 'ไม่ผ่านสัมภาษณ์', 'Failed interview', 'rejected', 20),
  ('salary_over_budget', 'เรียกเงินเดือนสูงเกินงบ', 'Salary expectation over budget', 'rejected', 30),
  ('candidate_withdrew', 'ผู้สมัครยกเลิกเอง', 'Candidate withdrew', 'withdrawn', 40),
  ('no_show', 'ไม่มาตามนัดสัมภาษณ์', 'No show', 'no_show', 50),
  ('cannot_contact', 'ติดต่อไม่ได้', 'Cannot contact', 'rejected', 60),
  ('offer_declined', 'ปฏิเสธข้อเสนอ', 'Offer declined', 'withdrawn', 70),
  ('position_closed', 'ตำแหน่งปิดรับแล้ว', 'Position closed', 'rejected', 80),
  ('other', 'อื่นๆ', 'Other', 'rejected', 999)
ON CONFLICT (code) DO UPDATE SET
  label_th = EXCLUDED.label_th,
  label_en = EXCLUDED.label_en,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;

CREATE TABLE IF NOT EXISTS application_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  performed_by TEXT NOT NULL,
  performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_application_logs_application_id ON application_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON application_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_application_logs_action ON application_logs(action);

CREATE OR REPLACE FUNCTION get_active_hr_user(p_user_id UUID)
RETURNS TABLE(id UUID, full_name TEXT, role TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT u.id, u.full_name, u.role
  FROM users u
  WHERE u.id = p_user_id
    AND u.status = 'Active'
    AND u.role IN ('admin', 'mod')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION add_application_log_entry(
  p_application_id UUID,
  p_action TEXT,
  p_old_value TEXT,
  p_new_value TEXT,
  p_note TEXT,
  p_performed_by_user_id UUID,
  p_performed_by TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO application_logs (
    application_id,
    action,
    old_value,
    new_value,
    note,
    performed_by_user_id,
    performed_by,
    metadata
  )
  VALUES (
    p_application_id,
    p_action,
    p_old_value,
    p_new_value,
    p_note,
    p_performed_by_user_id,
    COALESCE(NULLIF(p_performed_by, ''), 'System'),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION claim_application(
  p_app_id UUID,
  p_user_id UUID
)
RETURNS applications
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_app applications%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM get_active_hr_user(p_user_id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only active HR users can claim applications.';
  END IF;

  UPDATE applications
  SET assigned_to = v_user.id,
      assigned_at = timezone('utc'::text, now()),
      assigned_by = v_user.full_name,
      status = CASE WHEN status = 'Pending' THEN 'Reviewing' ELSE status END,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_app_id
    AND assigned_to IS NULL
    AND status NOT IN ('Hired', 'Rejected', 'Withdrawn', 'NoShow')
  RETURNING * INTO v_app;

  IF v_app.id IS NULL THEN
    RAISE EXCEPTION 'Application is already assigned, closed, or not found.';
  END IF;

  PERFORM add_application_log_entry(
    p_app_id,
    'claimed',
    NULL,
    v_user.full_name,
    NULL,
    v_user.id,
    v_user.full_name,
    jsonb_build_object('status_after', v_app.status)
  );

  RETURN v_app;
END;
$$;

CREATE OR REPLACE FUNCTION unassign_application(
  p_app_id UUID,
  p_performed_by_user_id UUID
)
RETURNS applications
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_old_assignee TEXT;
  v_app applications%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM get_active_hr_user(p_performed_by_user_id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only active HR users can unassign applications.';
  END IF;

  SELECT COALESCE(u.full_name, 'Unknown')
  INTO v_old_assignee
  FROM applications a
  LEFT JOIN users u ON u.id = a.assigned_to
  WHERE a.id = p_app_id;

  UPDATE applications
  SET assigned_to = NULL,
      assigned_at = NULL,
      assigned_by = NULL,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_app_id
    AND assigned_to IS NOT NULL
    AND (assigned_to = v_user.id OR v_user.role = 'admin')
    AND status NOT IN ('Hired', 'Rejected', 'Withdrawn', 'NoShow')
  RETURNING * INTO v_app;

  IF v_app.id IS NULL THEN
    RAISE EXCEPTION 'Application cannot be unassigned by this user or is already closed.';
  END IF;

  PERFORM add_application_log_entry(
    p_app_id,
    'unassigned',
    v_old_assignee,
    NULL,
    NULL,
    v_user.id,
    v_user.full_name,
    '{}'::jsonb
  );

  RETURN v_app;
END;
$$;

CREATE OR REPLACE FUNCTION transfer_application(
  p_app_id UUID,
  p_new_user_id UUID,
  p_performed_by_user_id UUID
)
RETURNS applications
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_actor RECORD;
  v_target RECORD;
  v_old_assignee TEXT;
  v_app applications%ROWTYPE;
BEGIN
  SELECT * INTO v_actor FROM get_active_hr_user(p_performed_by_user_id);
  IF NOT FOUND OR v_actor.role <> 'admin' THEN
    RAISE EXCEPTION 'Only active admins can transfer applications.';
  END IF;

  SELECT * INTO v_target FROM get_active_hr_user(p_new_user_id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target assignee must be an active HR user.';
  END IF;

  SELECT COALESCE(u.full_name, 'Unassigned')
  INTO v_old_assignee
  FROM applications a
  LEFT JOIN users u ON u.id = a.assigned_to
  WHERE a.id = p_app_id;

  UPDATE applications
  SET assigned_to = v_target.id,
      assigned_at = timezone('utc'::text, now()),
      assigned_by = v_actor.full_name,
      status = CASE WHEN status = 'Pending' THEN 'Reviewing' ELSE status END,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_app_id
    AND status NOT IN ('Hired', 'Rejected', 'Withdrawn', 'NoShow')
  RETURNING * INTO v_app;

  IF v_app.id IS NULL THEN
    RAISE EXCEPTION 'Application cannot be transferred or is already closed.';
  END IF;

  PERFORM add_application_log_entry(
    p_app_id,
    'transferred',
    v_old_assignee,
    v_target.full_name,
    NULL,
    v_actor.id,
    v_actor.full_name,
    '{}'::jsonb
  );

  RETURN v_app;
END;
$$;

CREATE OR REPLACE FUNCTION update_application_workflow_status(
  p_app_id UUID,
  p_status TEXT,
  p_performed_by_user_id UUID,
  p_note TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_interview_date DATE DEFAULT NULL
)
RETURNS applications
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_old_status TEXT;
  v_app applications%ROWTYPE;
  v_valid_statuses TEXT[] := ARRAY[
    'Pending',
    'Reviewing',
    'Interview',
    'InterviewScheduled',
    'Interviewed',
    'Offer',
    'Hired',
    'Rejected',
    'Withdrawn',
    'NoShow'
  ];
BEGIN
  IF NOT (p_status = ANY(v_valid_statuses)) THEN
    RAISE EXCEPTION 'Invalid application status: %', p_status;
  END IF;

  SELECT * INTO v_user FROM get_active_hr_user(p_performed_by_user_id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only active HR users can update application status.';
  END IF;

  IF p_status IN ('Rejected', 'Withdrawn', 'NoShow') AND COALESCE(NULLIF(p_rejection_reason, ''), NULL) IS NULL THEN
    RAISE EXCEPTION 'A close reason is required for rejected, withdrawn, or no-show applications.';
  END IF;

  SELECT status INTO v_old_status
  FROM applications
  WHERE id = p_app_id;

  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Application not found.';
  END IF;

  UPDATE applications
  SET status = p_status,
      interview_scheduled_at = CASE WHEN p_status IN ('Interview', 'InterviewScheduled') THEN timezone('utc'::text, now()) ELSE interview_scheduled_at END,
      interview_date = CASE WHEN p_status IN ('Interview', 'InterviewScheduled') THEN p_interview_date ELSE interview_date END,
      interview_completed_at = CASE WHEN p_status = 'Interviewed' THEN timezone('utc'::text, now()) ELSE interview_completed_at END,
      interviewed_at = CASE WHEN p_status IN ('Interview', 'InterviewScheduled', 'Interviewed') THEN timezone('utc'::text, now()) ELSE interviewed_at END,
      offer_at = CASE WHEN p_status = 'Offer' THEN timezone('utc'::text, now()) ELSE offer_at END,
      hired_at = CASE WHEN p_status = 'Hired' THEN timezone('utc'::text, now()) ELSE hired_at END,
      rejected_at = CASE WHEN p_status = 'Rejected' THEN timezone('utc'::text, now()) ELSE rejected_at END,
      withdrawn_at = CASE WHEN p_status = 'Withdrawn' THEN timezone('utc'::text, now()) ELSE withdrawn_at END,
      no_show_at = CASE WHEN p_status = 'NoShow' THEN timezone('utc'::text, now()) ELSE no_show_at END,
      closed_at = CASE WHEN p_status IN ('Hired', 'Rejected', 'Withdrawn', 'NoShow') THEN timezone('utc'::text, now()) ELSE closed_at END,
      rejection_reason = CASE WHEN p_status IN ('Rejected', 'Withdrawn', 'NoShow') THEN p_rejection_reason ELSE rejection_reason END,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_app_id
  RETURNING * INTO v_app;

  IF v_old_status IS DISTINCT FROM p_status THEN
    PERFORM add_application_log_entry(
      p_app_id,
      'status_change',
      v_old_status,
      p_status,
      p_note,
      v_user.id,
      v_user.full_name,
      jsonb_build_object(
        'rejection_reason', p_rejection_reason,
        'interview_date', p_interview_date
      )
    );
  END IF;

  RETURN v_app;
END;
$$;

CREATE OR REPLACE VIEW report_executive_summary AS
SELECT
  COALESCE(NULLIF(business_unit, ''), 'Unspecified') AS business_unit,
  COUNT(*)::INTEGER AS total_applications,
  (COUNT(*) FILTER (WHERE status = 'Pending'))::INTEGER AS pending_count,
  (COUNT(*) FILTER (WHERE status = 'Reviewing'))::INTEGER AS reviewing_count,
  (COUNT(*) FILTER (WHERE status IN ('Interview', 'InterviewScheduled')))::INTEGER AS interview_scheduled_count,
  (COUNT(*) FILTER (WHERE status = 'Interviewed'))::INTEGER AS interviewed_count,
  (COUNT(*) FILTER (WHERE status = 'Offer'))::INTEGER AS offer_count,
  (COUNT(*) FILTER (WHERE status = 'Hired'))::INTEGER AS hired_count,
  (COUNT(*) FILTER (WHERE status = 'Rejected'))::INTEGER AS rejected_count,
  (COUNT(*) FILTER (WHERE status = 'Withdrawn'))::INTEGER AS withdrawn_count,
  (COUNT(*) FILTER (WHERE status = 'NoShow'))::INTEGER AS no_show_count,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'Hired'))::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    2
  ) AS hire_rate
FROM applications
GROUP BY COALESCE(NULLIF(business_unit, ''), 'Unspecified')
ORDER BY total_applications DESC;

CREATE OR REPLACE VIEW report_recruiter_kpi AS
SELECT
  COALESCE(u.full_name, 'ไม่ได้ระบุผู้รับผิดชอบ') AS assigned_to,
  a.assigned_to AS assigned_to_id,
  COUNT(*)::INTEGER AS assigned_count,
  (COUNT(*) FILTER (WHERE a.status NOT IN ('Hired', 'Rejected', 'Withdrawn', 'NoShow')))::INTEGER AS active_count,
  (COUNT(*) FILTER (WHERE a.status IN ('Interview', 'InterviewScheduled', 'Interviewed')))::INTEGER AS interviewed_count,
  (COUNT(*) FILTER (WHERE a.status = 'Hired'))::INTEGER AS hired_count,
  (COUNT(*) FILTER (WHERE a.status IN ('Rejected', 'Withdrawn', 'NoShow')))::INTEGER AS closed_unsuccessful_count,
  ROUND((AVG(EXTRACT(EPOCH FROM (a.closed_at - a.created_at)) / 86400) FILTER (WHERE a.closed_at IS NOT NULL))::NUMERIC, 2) AS avg_days_to_close,
  ROUND((AVG(EXTRACT(EPOCH FROM (a.hired_at - a.created_at)) / 86400) FILTER (WHERE a.hired_at IS NOT NULL))::NUMERIC, 2) AS avg_days_to_hire,
  (COUNT(*) FILTER (
    WHERE a.status NOT IN ('Hired', 'Rejected', 'Withdrawn', 'NoShow')
      AND a.created_at < timezone('utc'::text, now()) - interval '7 days'
  ))::INTEGER AS overdue_active_count
FROM applications a
LEFT JOIN users u ON u.id = a.assigned_to
GROUP BY COALESCE(u.full_name, 'ไม่ได้ระบุผู้รับผิดชอบ'), a.assigned_to
ORDER BY assigned_count DESC;

CREATE OR REPLACE VIEW report_rejection_reasons AS
SELECT
  COALESCE(NULLIF(rejection_reason, ''), 'ไม่ระบุ') AS rejection_reason,
  COUNT(*)::INTEGER AS count
FROM applications
WHERE status IN ('Rejected', 'Withdrawn', 'NoShow')
GROUP BY COALESCE(NULLIF(rejection_reason, ''), 'ไม่ระบุ')
ORDER BY count DESC;

ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejection_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow active reason read" ON rejection_reasons;
CREATE POLICY "Allow active reason read"
ON rejection_reasons FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

DROP POLICY IF EXISTS "Allow application log read" ON application_logs;
CREATE POLICY "Allow application log read"
ON application_logs FOR SELECT
TO anon, authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Allow public submission logs" ON application_logs;
CREATE POLICY "Allow public submission logs"
ON application_logs FOR INSERT
TO anon, authenticated
WITH CHECK (action = 'submitted');

GRANT EXECUTE ON FUNCTION claim_application(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION unassign_application(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION transfer_application(UUID, UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_application_workflow_status(UUID, TEXT, UUID, TEXT, TEXT, DATE) TO anon, authenticated;
GRANT SELECT ON rejection_reasons TO anon, authenticated;
GRANT SELECT ON application_logs TO anon, authenticated;
GRANT SELECT ON report_executive_summary TO anon, authenticated;
GRANT SELECT ON report_recruiter_kpi TO anon, authenticated;
GRANT SELECT ON report_rejection_reasons TO anon, authenticated;
