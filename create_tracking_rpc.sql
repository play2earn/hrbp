-- Secure Function to check application status
-- This allows anyone (public) to check status ONLY if they have the exact UUID.
-- It avoids exposing the entire table to 'public' SELECT permissions.

CREATE OR REPLACE FUNCTION get_application_status(app_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (likely admin), bypassing RLS for this specific query
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'status', status,
        'position', position,
        'department', department,
        'full_name', full_name,
        'updated_at', created_at -- Using created_at or updated_at if you have it
    )
    INTO result
    FROM applications
    WHERE id = app_id;

    IF result IS NULL THEN
        RETURN jsonb_build_object('error', 'Application not found');
    END IF;

    RETURN result;
END;
$$;
