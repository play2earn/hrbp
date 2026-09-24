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

function getHrBccList(): string[] {
  const bccEnv = cleanEnv(process.env.RESEND_HR_BCC) || 'recruit@doublea1991.com, chatchawan_tu@mibholding.com';
  return bccEnv
    .split(',')
    .map(email => email.trim().replace(/^["']|["']$/g, ''))
    .filter(email => email.length > 0 && email.includes('@'));
}

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
 * Send application confirmation email with automatic fallback between Gmail and Resend
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

  const bcc = getHrBccList();
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
          bcc: bcc.length > 0 ? bcc : undefined,
          replyTo: gmailUser,
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
      bcc: bcc.length > 0 ? bcc : undefined,
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
