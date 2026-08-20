# HRBP Production Readiness Review Package

เอกสารชุดนี้เตรียมไว้ให้ Reviewer อนุมัติทีละ gate โดยยังไม่เปลี่ยน production, database policy หรือ public storage อัตโนมัติ

## ลำดับรีวิว

1. `01_ENV_AND_SECRET_APPROVAL.md` — แหล่งที่มาของค่า `.env`, ตำแหน่งจัดเก็บ และ secret rotation
2. `02_STAGING_ACCEPTANCE.md` — test cases ที่ต้องผ่านบน staging
3. `03_STORAGE_CUTOVER.md` — R2 draft → private S3 และจุด rollback
4. `04_SUPABASE_RLS_APPROVAL.md` — direct browser access และ SQL ที่ยังห้าม apply
5. `05_PRODUCTION_CUTOVER.md` — production change window และ rollback

## Automated gates

```bash
npm run env:check
npm run audit:supabase-client
npm run check
npm run smoke:security -- --base-url https://staging.example.com
```

`npm run check` รวม security tests, typecheck, production build และตรวจว่าค่า server secrets ไม่หลุดเข้า frontend bundle

`audit:supabase-client:strict` ตั้งใจให้ยัง fail จนกว่าจะย้าย protected Supabase calls เข้า BFF ครบทั้งหมด

## Current review status

- Security code gate: ผ่านแล้ว (`14/14` security/router tests, Vercel Functions `1/12`, typecheck และ production build); ต้องรันซ้ำก่อน push ทุกครั้ง
- Environment gate: local `.env.local` ผ่าน preflight แล้ว และ Vercel แยก `HRBP_SESSION_SECRET`/`CRON_SECRET` ระหว่าง Preview กับ Production แล้ว
- Production secret rotation: `IDMS_AGENT_CODE` ยังตรงกับค่าที่เคยอยู่ใน source เดิม; อนุญาตให้ใช้ทดสอบ Preview ได้ แต่ต้องออกค่าใหม่ก่อน Production cutover
- Storage cutover: code เตรียมหลัง feature flag; ห้ามเปิดจนกว่า staging acceptance ผ่าน
- Supabase revoke/RLS: review-only; strict audit ยังพบ protected direct browser calls 45 จุด จึงห้าม apply broad revoke
- Cloudflare production cutover: ยังไม่อยู่ใน change set นี้
