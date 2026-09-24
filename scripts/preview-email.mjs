import fs from 'fs';
import path from 'path';

const candidateName = 'สมชาย ใจดี';
const position = 'เจ้าหน้าที่ฝ่ายบุคคล (HR Officer)';
const applicationId = 'APP-2026-0924-001';
const submissionDate = new Date().toLocaleDateString('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>พรีวิวอีเมลยืนยันการรับใบสมัครงาน - Double A Alliance</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #0f172a; color: #94a3b8; text-align: center; padding: 12px; font-size: 13px;">
    🔍 <strong>Email Template Preview</strong> — หน้าตาอีเมลจริงที่จะถูกส่งหาผู้สมัครและสำเนา (BCC) หา HR
  </div>

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

const outputPath = path.resolve('public', 'email-preview.html');
fs.writeFileSync(outputPath, htmlContent, 'utf-8');
console.log('Preview saved to:', outputPath);
