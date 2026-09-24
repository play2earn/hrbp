import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const user = (process.env.GMAIL_USER || '').trim().replace(/^["']|["']$/g, '');
const pass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/^["']|["']$/g, '');

console.log('--- Gmail SMTP Test Preflight ---');
console.log('Gmail User:', user);
console.log('App Password configured:', pass ? `Yes (${pass.length} chars)` : 'NO');

if (!user || !pass) {
  console.error('ERROR: GMAIL_USER or GMAIL_APP_PASSWORD missing!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
});

async function main() {
  try {
    console.log('Verifying SMTP connection to Google Mail Servers...');
    await transporter.verify();
    console.log('✅ SMTP connection authenticated successfully!');

    console.log(`Sending live test email to ${user}...`);
    const info = await transporter.sendMail({
      from: `"ฝ่ายทรัพยากรบุคคล Double A Alliance" <${user}>`,
      to: user,
      subject: '🧪 [ทดสอบระบบ] ยืนยันการรับใบสมัครงานตำแหน่ง เจ้าหน้าที่บุคคล - Double A Alliance',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">ระบบรับสมัครงาน Double A Alliance</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #bfdbfe;">ยืนยันการรับข้อมูลใบสมัครงานของคุณเรียบร้อยแล้ว</p>
          </div>
          <p style="font-size: 15px; color: #1e293b;">เรียน คุณ <strong>สมชาย ใจดี</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            ทางฝ่ายทรัพยากรบุคคล (HR) ได้รับข้อมูลใบสมัครงานสำหรับตำแหน่ง 
            <strong style="color: #2563eb;">"เจ้าหน้าที่บุคคล (HR Officer)"</strong> เรียบร้อยแล้ว
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>รหัสใบสมัคร:</strong> <span style="font-family: monospace;">APP-2026-TEST-001</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>วันที่ยื่นใบสมัคร:</strong> 24 กันยายน 2569</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>สถานะ:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold;">รอดำเนินการ (Pending)</span></p>
          </div>
          <p style="font-size: 13px; color: #64748b;">
            💡 <em>อีเมลฉบับนี้ส่งตรงจาก Server ผ่าน Gmail SMTP ของ ${user} สำหรับทดสอบระบบ</em>
          </p>
        </div>
      `,
    });

    console.log('✅ Live email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('👉 Please check your Gmail Inbox:', user);
  } catch (err) {
    console.error('❌ Failed to send email via Gmail SMTP:', err);
    process.exit(1);
  }
}

main();
