import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getAdminSupabase } from '../server/security.js';
import { sendApplicationConfirmationEmail } from '../server/email.js';

interface RequestBody {
  applicationId?: string;
  force?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) as RequestBody;
  const applicationId = String(body?.applicationId || '').trim();
  const isForce = Boolean(body?.force);

  if (!applicationId) {
    res.status(400).json({ error: 'Missing applicationId parameter' });
    return;
  }

  try {
    const supabase = getAdminSupabase();

    // 1. Fetch application record
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (appError) {
      console.error('[send-application-email] Database query error:', appError);
      res.status(500).json({ error: 'Failed to query application record', details: appError.message });
      return;
    }


    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // 2. Idempotency Check: Don't send multiple confirmation emails unless forced
    if (!isForce) {
      const { data: existingLogs } = await supabase
        .from('application_logs')
        .select('id')
        .eq('application_id', applicationId)
        .eq('action', 'email_confirmation_sent')
        .limit(1);

      if (existingLogs && existingLogs.length > 0) {
        res.status(200).json({
          success: true,
          message: 'Confirmation email already sent for this application (idempotent)',
          skipped: true,
        });
        return;
      }
    }


    // 3. Extract candidate details from record or form_data fallback
    const appRecord = application as Record<string, any>;
    const formData = (appRecord.form_data as Record<string, any>) || {};
    const candidateName =
      appRecord.full_name ||
      appRecord.name ||
      formData.fullName ||
      formData.name ||
      `${formData.firstName || ''} ${formData.lastName || ''}`.trim() ||
      'ผู้สมัครงาน';

    const candidateEmail =
      appRecord.email ||
      formData.email ||
      formData.contactEmail;

    const appliedPosition =
      appRecord.position ||
      formData.appliedPosition ||
      formData.position ||
      'ทั่วไป';


    if (!candidateEmail) {
      res.status(400).json({
        error: 'Application does not have a valid candidate email address',
      });
      return;
    }

    // 4. Send email via Resend
    const result = await sendApplicationConfirmationEmail({
      candidateName,
      candidateEmail,
      position: appliedPosition,
      applicationId: application.id,
      submissionDate: application.created_at
        ? new Date(application.created_at).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined,
    });

    // 5. Audit Logging into application_logs
    if (result.success) {
      await supabase.from('application_logs').insert([
        {
          application_id: applicationId,
          action: 'email_confirmation_sent',
          performed_by: 'System (Resend)',
          new_value: `Sent to: ${candidateEmail} (ID: ${result.messageId || 'unknown'})`,
          created_at: new Date().toISOString(),
        },
      ]);

      res.status(200).json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      await supabase.from('application_logs').insert([
        {
          application_id: applicationId,
          action: 'email_confirmation_failed',
          performed_by: 'System (Resend)',
          new_value: `Failed: ${result.error || 'Unknown error'}`,
          created_at: new Date().toISOString(),
        },
      ]);

      res.status(502).json({
        success: false,
        error: result.error || 'Failed to dispatch email via Resend',
      });
    }
  } catch (err: any) {
    console.error('[send-application-email] Unexpected error:', err);
    res.status(500).json({
      error: err?.message || 'Internal server error while processing email notification',
    });
  }
}
