# Staging Acceptance

## Automated checks

```bash
npm ci
npm run env:check
npm run check:function-count
npm run build:api:vercel-sim
npm run check
npm run smoke:security -- --base-url https://staging.example.com
```

โครงสร้างปัจจุบัน rewrite `/api/<route>` เข้า `api/index.ts` หนึ่ง Serverless Function และเก็บ implementation ใน `handlers/` เพื่อไม่เกินข้อจำกัด Vercel Hobby (`1/12` ณ รอบตรวจล่าสุด)

สำหรับรอบปัจจุบัน ให้แทน `https://staging.example.com` ด้วย Preview URL ที่ Vercel สร้างให้ branch และห้ามใช้ Production URL ในคำสั่ง smoke test

Preview ยังใช้ Supabase/AWS/R2 ชุดเดียวกับ Production จึงให้ใช้ข้อมูลทดสอบที่ระบุชัด ห้ามทดสอบลบ object, migration หรือ storage cutover ในรอบนี้

## Authentication

- [ ] Admin login ผ่าน IDMS และได้ `HttpOnly; Secure; SameSite=Lax` cookie
- [ ] Moderator login ได้เฉพาะสิทธิ์ moderator
- [ ] Logout แล้ว `/api/session` ตอบ 401
- [ ] User ที่เป็น Inactive/Pending ไม่ได้ staff session
- [ ] บุคลากรที่ย้ายออกจาก HR ถูกระงับ ยกเว้น approved non-HR override
- [ ] Registration สร้างได้เฉพาะหลัง IDMS ผ่าน และ role ต้องเป็น `mod`, status ต้องเป็น `Pending`

## Applicant and attachments

- [ ] เปิดฟอร์มใหม่และอัปโหลดรูป/PDF ได้
- [ ] Draft ID ที่เดา/รูปแบบผิดถูกปฏิเสธ
- [ ] Submit แล้ว attachment finalize สำเร็จ
- [ ] เปิดไฟล์โดยไม่มี session/share authorization ไม่ได้
- [ ] Share link เปิดได้เฉพาะไฟล์ของ application นั้น
- [ ] Resubmit PIN lock ทำงานและ upload ได้เฉพาะ field ที่ HR เลือก

## Admin endpoints

- [ ] Moderator เข้า trash, migration และ cleanup แบบ admin ไม่ได้
- [ ] Blacklist read/write ต้องมี staff session
- [ ] Arbitrary URL และ Supabase REST URL ใช้ผ่าน file proxy/migration ไม่ได้
- [ ] Cron cleanup ใช้ได้เฉพาะ `CRON_SECRET` หรือ admin

## Storage feature-flag matrix

| Attachments | Draft access | Expected |
|---|---|---|
| `r2-legacy` | `legacy-public` | behavior เดิมสำหรับ baseline |
| `r2-legacy` | `private-proxy` | draft preview ผ่าน API, permanent ยัง R2 |
| `s3-primary` | `private-proxy` | เป้าหมาย: draft และ final private AWS S3; R2 เป็น fallback/legacy only |

ห้ามทดสอบ `s3-primary` กับ production bucket โดยตรง ให้ใช้ staging bucket แยก
