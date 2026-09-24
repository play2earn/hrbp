import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendApplicationEmailParams {
  candidateName: string;
  candidateEmail: string;
  position: string;
  applicationId: string;
  submissionDate?: string;
  trackingUrl?: string;
  phone?: string;
}


export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider?: 'gmail' | 'resend';
  error?: string;
}

function cleanEnv(value?: string): string {
  return (value || '').trim().replace(/^["']|["']$/g, '');
}

function getProvider(): 'gmail' | 'resend' {
  const provider = cleanEnv(process.env.EMAIL_PROVIDER).toLowerCase();
  if (provider === 'gmail') return 'gmail';
  if (provider === 'resend') return 'resend';
  // Auto-detect based on available credentials
  const gmailPass = cleanEnv(process.env.GMAIL_APP_PASSWORD);
  if (gmailPass) return 'gmail';
  return 'resend';
}

function getResendClient(): Resend | null {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY || process.env.RESEND_KEY);
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getGmailTransporter(): Transporter | null {

  const user = cleanEnv(process.env.GMAIL_USER) || 'myprocess.hr@gmail.com';
  const pass = cleanEnv(process.env.GMAIL_APP_PASSWORD);
  if (!pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export function getHrRecipientList(): string[] {
  const bccEnv = cleanEnv(process.env.RESEND_HR_BCC) || 'recruit@doublea1991.com, chatchawan_tu@mibholding.com';
  return bccEnv
    .split(',')
    .map(email => email.trim().replace(/^["']|["']$/g, ''))
    .filter(email => email.length > 0 && email.includes('@'));
}

export const getHrBccList = getHrRecipientList;

/**
 * Generate responsive HTML email for application confirmation
 */
export function buildApplicationEmailHtml(params: {
  candidateName: string;
  position: string;
  applicationId: string;
  submissionDate: string;
  trackingUrl?: string;
}): string {
  const { candidateName, position, applicationId, submissionDate, trackingUrl } = params;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ยืนยันการรับใบสมัครงาน - Double A Alliance</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 28px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                      ระบบรับสมัครงาน Double A Alliance
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 14px;">
                      ยืนยันการรับข้อมูลใบสมัครงานของคุณเรียบร้อยแล้ว
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px; color: #334155;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #0f172a;">
                เรียน คุณ <strong>${candidateName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                ทางฝ่ายทรัพยากรบุคคล (HR) ได้รับข้อมูลใบสมัครงานของคุณสำหรับตำแหน่ง 
                <span style="color: #2563eb; font-weight: 600;">"${position}"</span> เข้าสู่ระบบเรียบร้อยแล้ว
              </p>

              <!-- Application Summary Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 12px;">
                      ข้อมูลอ้างอิงการสมัคร
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #64748b; width: 130px;">รหัสใบสมัคร:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #0f172a; font-family: monospace; font-weight: 600;">${applicationId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #64748b;">ตำแหน่งที่สมัคร:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${position}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #64748b;">วันที่ยื่นใบสมัคร:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #0f172a;">${submissionDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #64748b;">สถานะปัจจุบัน:</td>
                        <td style="padding: 4px 0; font-size: 14px;">
                          <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            รอดำเนินการ (Pending)
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${trackingUrl ? `
              <!-- Tracking CTA Action -->
              <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #166534;">
                  สามารถติดตามผลการสมัครงานได้แบบ Real-time ตลอด 24 ชม.
                </p>
                <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);">
                  🔍 คลิกตรวจสอบสถานะใบสมัคร
                </a>
              </div>
              ` : ''}

              <!-- Next Steps -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; font-weight: 600;">
                ขั้นตอนถัดไป
              </h3>
              <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ทีมงานสรรหาและว่าจ้างจะทำการตรวจสอบประวัติและคุณสมบัติของคุณ หากคุณสมบัติตรงตามที่ระบุในตำแหน่งงาน เจ้าหน้าที่จะติดต่อกลับผ่านทางเบอร์โทรศัพท์หรืออีเมลที่ระบุไว้ในใบสมัครเพื่อนัดหมายการสัมภาษณ์ต่อไป
              </p>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e40af;">
                  💡 <strong>คำแนะนำ:</strong> กรุณาเก็บรหัสใบสมัครนี้ไว้สำหรับใช้อ้างอิงหรือสอบถามสถานะเพิ่มเติมกับเจ้าหน้าที่
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
                ฝ่ายทรัพยากรบุคคล (Recruitment Team)
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบรับสมัครงาน หากมีข้อสงสัยสามารถตอบกลับอีเมลนี้ได้โดยตรง
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate plain text alternative
 */
export function buildApplicationEmailPlainText(params: {
  candidateName: string;
  position: string;
  applicationId: string;
  submissionDate: string;
  trackingUrl?: string;
}): string {
  const trackingLine = params.trackingUrl ? `\nลิงก์ตรวจสอบสถานะ: ${params.trackingUrl}` : '';

  return `ระบบรับสมัครงาน Double A Alliance
ยืนยันการรับใบสมัครงาน

เรียน คุณ ${params.candidateName},

ทางฝ่ายทรัพยากรบุคคล (HR) ได้รับข้อมูลใบสมัครงานของคุณสำหรับตำแหน่ง "${params.position}" เข้าสู่ระบบเรียบร้อยแล้ว

ข้อมูลอ้างอิง:
- รหัสใบสมัคร: ${params.applicationId}
- ตำแหน่งที่สมัคร: ${params.position}
- วันที่ยื่นใบสมัคร: ${params.submissionDate}
- สถานะ: รอดำเนินการ (Pending)${trackingLine}

ขั้นตอนถัดไป:
ทีมงานสรรหาและว่าจ้างจะทำการตรวจสอบคุณสมบัติ และติดต่อกลับหากผ่านเกณฑ์การพิจารณาเบื้องต้น

ฝ่ายทรัพยากรบุคคล (Recruitment Team)`;
}

/**
 * Generate responsive HTML email for internal HR notification
 */
export function buildHrNotificationEmailHtml(params: {
  candidateName: string;
  position: string;
  applicationId: string;
  submissionDate: string;
  candidateEmail: string;
  phone?: string;
  dashboardUrl?: string;
}): string {
  const { candidateName, position, applicationId, submissionDate, candidateEmail, phone, dashboardUrl } = params;
  const link = dashboardUrl || cleanEnv(process.env.APP_ORIGIN) || 'https://hrbp-ten.vercel.app';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แจ้งเตือนผู้สมัครงานใหม่ - Double A Alliance</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #f1f5f9; color: #334155;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; color: #ffffff;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8; margin-bottom: 6px;">
          HRBP Notification • Double A Alliance
        </div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
          📥 มีผู้สมัครงานใหม่ในระบบ
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">
          ใบสมัครใหม่รอการตรวจสอบและดำเนินการจากทีมฝ่ายทรัพยากรบุคคล
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 24px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; width: 35%; border-bottom: 1px solid #e2e8f0;">ชื่อ-นามสกุล ผู้สมัคร</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${candidateName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">ตำแหน่งที่สมัคร</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #2563eb; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${position}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">อีเมลติดต่อ</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
              <a href="mailto:${candidateEmail}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${candidateEmail}</a>
            </td>
          </tr>
          ${phone ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">เบอร์โทรศัพท์</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
              <a href="tel:${phone}" style="color: #0f172a; text-decoration: none;">${phone}</a>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">รหัสใบสมัคร</td>
            <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-family: monospace; border-bottom: 1px solid #e2e8f0;">${applicationId}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">เวลายื่นใบสมัคร</td>
            <td style="padding: 12px 16px; font-size: 13px; color: #475569;">${submissionDate}</td>
          </tr>
        </table>

        <!-- Action Button -->
        <div style="text-align: center; margin: 28px 0 20px;">
          <a href="${link}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            📄 เข้าสู่ระบบ HRBP เพื่อตรวจสอบใบสมัคร
          </a>
        </div>

        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-top: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            💡 <em>สามารถกดปุ่ม <strong>Reply (ตอบกลับ)</strong> ที่อีเมลฉบับนี้เพื่อส่งอีเมลหาผู้สมัคร (${candidateEmail}) ได้ทันที</em>
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        อีเมลแจ้งเตือนอัตโนมัติจากระบบ HRBP • Double A Alliance
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildHrNotificationEmailPlainText(params: {
  candidateName: string;
  position: string;
  applicationId: string;
  submissionDate: string;
  candidateEmail: string;
  phone?: string;
  dashboardUrl?: string;
}): string {
  const link = params.dashboardUrl || cleanEnv(process.env.APP_ORIGIN) || 'https://hrbp-ten.vercel.app';
  return `แจ้งเตือนผู้สมัครงานใหม่ - Double A Alliance

ข้อมูลผู้สมัคร:
- ชื่อ-นามสกุล: ${params.candidateName}
- ตำแหน่งที่สมัคร: ${params.position}
- อีเมลติดต่อ: ${params.candidateEmail}
${params.phone ? `- เบอร์โทรศัพท์: ${params.phone}\n` : ''}- รหัสใบสมัคร: ${params.applicationId}
- วันที่ยื่นใบสมัคร: ${params.submissionDate}

เข้าสู่ระบบ HRBP เพื่อตรวจสอบใบสมัคร:
${link}

(คุณสามารถกดปุ่ม Reply เพื่อตอบกลับหาผู้สมัครได้โดยตรง)`;
}

/**
 * Send internal notification email directly to HR team (TO: HR, Reply-To: Candidate)
 */
export async function sendHrNewApplicationNotificationEmail(params: {
  candidateName: string;
  position: string;
  applicationId: string;
  submissionDate?: string;
  candidateEmail: string;
  phone?: string;
  dashboardUrl?: string;
}): Promise<SendEmailResult> {
  const hrRecipients = getHrRecipientList();
  if (!hrRecipients || hrRecipients.length === 0) {
    return { success: true, messageId: 'skipped-no-hr-recipients' };
  }

  const formattedDate =
    params.submissionDate ||
    new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const subject = `📥 [มีผู้สมัครงานใหม่] คุณ ${params.candidateName} - ตำแหน่ง ${params.position} (Double A Alliance)`;
  const html = buildHrNotificationEmailHtml({ ...params, submissionDate: formattedDate });
  const text = buildHrNotificationEmailPlainText({ ...params, submissionDate: formattedDate });

  const provider = getProvider();

  if (provider === 'gmail') {
    const transporter = getGmailTransporter();
    if (transporter) {
      try {
        const gmailUser = cleanEnv(process.env.GMAIL_USER) || 'myprocess.hr@gmail.com';
        const info = await transporter.sendMail({
          from: `"ฝ่ายทรัพยากรบุคคล Double A Alliance" <${gmailUser}>`,
          to: hrRecipients,
          replyTo: params.candidateEmail,
          subject,
          html,
          text,
        });

        return {
          success: true,
          messageId: info.messageId,
          provider: 'gmail',
        };
      } catch (gmailErr: any) {
        console.error('[Gmail SMTP HR Notification Error]', gmailErr);
        return {
          success: false,
          provider: 'gmail',
          error: gmailErr?.message || 'Failed to dispatch HR notification via Gmail SMTP',
        };
      }
    }
  }

  const resend = getResendClient();
  if (resend) {
    try {
      const fromAddress = cleanEnv(process.env.RESEND_FROM_EMAIL) || 'Double A Alliance <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: hrRecipients,
        replyTo: params.candidateEmail,
        subject,
        html,
        text,
      });

      if (error) {
        return { success: false, provider: 'resend', error: error.message };
      }
      return { success: true, messageId: data?.id, provider: 'resend' };
    } catch (resendErr: any) {
      return { success: false, provider: 'resend', error: resendErr?.message };
    }
  }

  return { success: false, error: 'No email service available for HR notification' };
}

/**
 * Send application confirmation email to candidate with automatic fallback between Gmail and Resend,
 * and automatically dispatches dedicated notification to the HR team.
 */
export async function sendApplicationConfirmationEmail(
  params: SendApplicationEmailParams
): Promise<SendEmailResult> {
  const { candidateName, candidateEmail, position, applicationId } = params;

  if (!candidateEmail || !candidateEmail.includes('@')) {
    return {
      success: false,
      error: `Invalid recipient email: ${candidateEmail}`,
    };
  }

  const formattedDate =
    params.submissionDate ||
    new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const origin = cleanEnv(process.env.APP_ORIGIN) || '';
  const trackingUrl = params.trackingUrl || (origin ? `${origin}/?track=${applicationId}` : undefined);

  const subject = `ยืนยันการรับใบสมัครงานตำแหน่ง ${position} - Double A Alliance`;

  const html = buildApplicationEmailHtml({
    candidateName,
    position,
    applicationId,
    submissionDate: formattedDate,
    trackingUrl,
  });

  const text = buildApplicationEmailPlainText({
    candidateName,
    position,
    applicationId,
    submissionDate: formattedDate,
    trackingUrl,
  });

  const provider = getProvider();

  // 1. Try Gmail SMTP if configured
  if (provider === 'gmail') {
    const transporter = getGmailTransporter();
    if (transporter) {
      try {
        const gmailUser = cleanEnv(process.env.GMAIL_USER) || 'myprocess.hr@gmail.com';
        const info = await transporter.sendMail({
          from: `"ฝ่ายทรัพยากรบุคคล Double A Alliance" <${gmailUser}>`,
          to: candidateEmail,
          replyTo: gmailUser,
          subject,
          html,
          text,
        });

        // Automatically dispatch dedicated notification directly to HR team (TO: HR)
        sendHrNewApplicationNotificationEmail({
          candidateName,
          candidateEmail,
          position,
          applicationId,
          submissionDate: formattedDate,
          phone: params.phone,
        }).catch(hrErr => console.error('[HR Notification Auto-Dispatch Error]', hrErr));

        return {
          success: true,
          messageId: info.messageId,
          provider: 'gmail',
        };
      } catch (gmailErr: any) {
        console.error('[Gmail SMTP Error]', gmailErr);
        return {
          success: false,
          provider: 'gmail',
          error: gmailErr?.message || 'Failed to dispatch email via Gmail SMTP',
        };
      }
    }
  }

  // 2. Fallback or primary Resend
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      error: 'Neither Gmail SMTP credentials nor RESEND_API_KEY are configured',
    };
  }

  const fromAddress = cleanEnv(process.env.RESEND_FROM_EMAIL) || 'Double A Alliance <onboarding@resend.dev>';
  const replyTo = cleanEnv(process.env.GMAIL_USER) || undefined;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [candidateEmail],
      replyTo: replyTo,
      subject,
      html,
      text,
    });

    if (error) {
      return {
        success: false,
        provider: 'resend',
        error: error.message || 'Failed to dispatch email via Resend',
      };
    }

    // Automatically dispatch dedicated notification directly to HR team (TO: HR)
    sendHrNewApplicationNotificationEmail({
      candidateName,
      candidateEmail,
      position,
      applicationId,
      submissionDate: formattedDate,
      phone: params.phone,
    }).catch(hrErr => console.error('[HR Notification Auto-Dispatch Error]', hrErr));

    return {
      success: true,
      messageId: data?.id,
      provider: 'resend',
    };
  } catch (resendErr: any) {
    return {
      success: false,
      provider: 'resend',
      error: resendErr?.message || 'Unexpected exception while sending email via Resend',
    };
  }
}
