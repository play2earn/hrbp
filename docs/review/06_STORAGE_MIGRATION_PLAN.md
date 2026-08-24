# HR Drive Storage Migration Plan: Legacy R2/Supabase → AWS S3

แผนนี้ใช้หลังจาก production เปิด `ATTACHMENT_STORAGE_MODE=s3-primary` แล้ว เป้าหมายคือย้ายไฟล์เก่าที่ค้างอยู่ใน Cloudflare R2 และ Supabase Storage ไป AWS S3 โดยไม่ทำให้ database ชี้ไฟล์ผิด, ไม่ลบ source ก่อน verify และไม่เพิ่มภาระให้ HR ต้องกดย้ายทีละไฟล์เป็นงานหลัก

## Current baseline

สถานะ inventory ล่าสุด:

| พื้นที่ | จำนวน | ขนาดรวม | หมายเหตุ |
|---|---:|---:|---|
| AWS S3 ทั้ง bucket | 356 objects | 194.15 MB | primary storage ใหม่ |
| AWS S3 `applicants/` | 335 objects | 192.32 MB | ไฟล์ production ใหม่เริ่มเข้า S3 แล้ว |
| AWS S3 `drafts/` | 0 objects | 0 MB | ดี — ไม่มี draft ค้างหลัง submit |
| AWS S3 `.trash/` | 8 objects | 0.45 MB | ต้องมี retention/lifecycle |
| Cloudflare R2 ทั้ง bucket | 4,438 objects | 2,224.27 MB | legacy/fallback store |
| Cloudflare R2 `applicants/` | 3,405 objects | 1,535.18 MB | กลุ่มหลักที่ต้อง migrate |
| Cloudflare R2 `drafts/` | 5 objects | 2.02 MB | ต้อง audit ก่อน เพราะเสี่ยง broken ref |
| Cloudflare R2 `photos/` | 56 objects | 6.11 MB | legacy photo/crop refs |
| Supabase Storage | มี bucket/folder legacy | - | `certificate`, `photo`, `photos`, `resume`, `transcript` |
| Supabase Storage `photos` | 11 files | - | กลุ่ม legacy crop/photo |
| DB refs ที่ยังชี้ draft | 18 applications | - | priority สูงสุดของ migration audit |
| DB refs ที่ยังชี้ R2 | 1,021 applications | - | migrate แบบ batch ได้ |

## Target principle

AWS S3 ต้องเป็น source of truth สำหรับไฟล์ผู้สมัครทั้งหมดหลัง migration

```text
New upload / edit / crop / resubmit
  → AWS S3 only
  → DB stores /api/files?key=...

Legacy R2/Supabase reference
  → scan
  → verify source exists
  → copy to S3
  → verify destination
  → update DB reference
  → keep source during retention
  → later cleanup/quarantine
```

R2 และ Supabase Storage ไม่ควรเป็น active write fallback ตามปกติ เพราะจะทำให้เกิดสองแหล่งข้อมูลจริงพร้อมกัน ถ้า S3 ล่มให้ระบบ fail/retry/queue ดีกว่าเงียบ ๆ ไปเขียน R2 ยกเว้นทำ fallback queue และ reconciliation log ครบแล้ว

## Recommended priority

### P0 — ทำก่อนย้ายจริง

- [x] สร้าง read-only migration audit endpoint/script ที่สแกน DB refs ทุกช่องไฟล์ และจัดกลุ่มเป็น:
  - `ready_to_migrate`: DB ชี้ R2/Supabase และ source object ยังมีจริง
  - `broken_reference`: DB ชี้ไฟล์ แต่ source object หายหรือเปิดไม่ได้
  - `already_s3`: DB ชี้ `/api/files?key=...` หรือ S3 แล้ว
- [ ] เพิ่มกลุ่ม `orphan_object`: object อยู่ใน R2/Supabase แต่ DB ไม่อ้างถึง
- [x] เพิ่มหน้า HR Drive “Migration Center” แบบ read-only ก่อน ให้เห็นตัวเลขและรายการตัวอย่าง
- [x] เพิ่ม Broken/Draft Detail Report ราย application เพื่อให้ HR เห็นว่าใบไหน/field ไหนต้องขอเอกสารใหม่หรือ review draft reference
- [ ] ทำ migration manifest ต่อ application/file พร้อม checksum/size/content-type/source/destination
- [ ] ห้ามลบไฟล์ legacy ระหว่าง phase นี้

Implementation note: รอบแรกเพิ่ม `/api/storage-migration-audit`, card “Migration Center” และ Broken/Draft Detail Report ใน HR Drive แล้ว โดยยังไม่ migrate, ไม่ update DB และไม่ cleanup source ใด ๆ ตัวเลขหลักแสดงจำนวน references และมี unique file counts ประกอบเพื่อลดความสับสนจาก field alias ที่ชี้ไฟล์เดียวกัน

ผลลัพธ์: รู้ก่อนว่าไฟล์ไหนย้ายได้ ไฟล์ไหนเสีย และไม่ซ้ำรอยเคส DB ชี้ draft object ที่ถูกลบไปแล้ว

### P1 — Batch migrate แบบปลอดภัย

- [ ] เพิ่ม server endpoint สำหรับ migrate ทีละ application หรือทีละ batch ขนาดเล็ก
- [ ] Copy source → S3 แล้ว verify ด้วย `HeadObject`/size/content-type ก่อน update DB
- [ ] Update DB เฉพาะ field ที่ migration นั้นรับผิดชอบ และเก็บ old URL ไว้ใน migration log
- [ ] ถ้า copy สำเร็จแต่ DB update fail ให้คง S3 object ไว้เป็น `pending_reconcile` ไม่ลบ source
- [ ] ถ้า source หาย ให้ mark `broken_reference` และส่งเป็น task ให้ HR ขอเอกสารใหม่

เริ่ม batch แนะนำ:

1. 18 applications ที่ยังมี draft refs
2. active/recent applications 30–90 วันล่าสุด
3. applications ที่ HR เปิดใช้งานบ่อยหรืออยู่ระหว่าง process
4. historical archive ที่เหลือ

### P2 — HR Drive UX

- [ ] เพิ่ม card สรุป migration:
  - Ready to migrate
  - Broken refs
  - Orphans
  - Migrated today
  - Pending reconcile
- [ ] ปุ่ม “Migrate selected to S3” ใช้เฉพาะ admin/authorized role
- [ ] ปุ่ม “Open legacy source” แสดงเฉพาะ staff ที่มีสิทธิ์ เพื่อช่วยสอบสวน
- [ ] ปุ่ม “Request re-upload” สำหรับ broken refs
- [ ] แยกปุ่ม cleanup/trash ออกจาก migration ชัดเจน และต้อง confirm อีกชั้น

HR manual migrate ควรเป็นเครื่องมือ rescue/exception ไม่ใช่ flow หลักของการย้ายทั้งหมด

### P3 — Cleanup and retention

- [ ] ตั้ง lifecycle ใน S3 สำหรับ:
  - incomplete multipart uploads
  - `drafts/` ที่ค้างเกินระยะเวลาที่กำหนด
  - `.trash/` ตาม retention policy
- [ ] ตั้ง R2 lifecycle สำหรับ legacy drafts/orphans หลัง migration window
- [ ] Cleanup Supabase Storage ด้วย Storage API เท่านั้น ไม่ลบผ่าน SQL
- [ ] ปิด public R2 domain หลัง:
  - DB refs ที่ชี้ R2 public URL เหลือ 0 หรือเปิดผ่าน proxy ได้ครบ
  - HR sign-off แล้ว
  - retention window ผ่านแล้ว

## Acceptance checklist

- [ ] Applicant ใหม่หลัง deploy เก็บไฟล์ที่ S3 100%
- [ ] Edit/crop/request-more-documents/resubmit เขียน S3 100%
- [ ] HR viewer เปิด PDF/JPG/PNG จาก S3 ผ่าน `/api/files` ได้
- [ ] Legacy R2/Supabase file เปิดได้ผ่าน proxy หรือถูก migrate แล้ว
- [x] Migration dry-run แสดงจำนวน ready/broken/needs-review ได้ใน HR Drive
- [x] Migration dry-run แสดง broken/draft applications ที่ควรแก้ก่อน batch migrate
- [ ] Migration dry-run เพิ่ม orphan object report ที่เทียบ object exists แต่ DB ไม่อ้างถึง
- [ ] Batch test 10–20 applications ผ่านโดย:
  - destination S3 exists
  - DB URL เปลี่ยนเป็น `/api/files?key=...`
  - old source ยังอยู่
  - HR เปิดไฟล์จากหน้า applicant ได้
- [ ] Broken refs ไม่ถูก migrate และถูกส่งให้ HR ขอไฟล์ใหม่
- [ ] Delete applicant ลบ S3 refs และ dependent rows ได้เหมือน production test ล่าสุด

## Rollback rule

ก่อน update DB ทุกครั้งต้องเก็บ old reference ไว้ใน migration log เพื่อ rollback เฉพาะ application/field ได้

Rollback ที่ยอมรับได้:

```text
DB field: /api/files?key=applicants/...
→ restore old R2/Supabase URL จาก migration log
→ keep copied S3 object until cleanup review
```

Rollback ที่ไม่ควรทำ:

- ลบ S3 object ทันทีหลัง rollback
- ลบ R2/Supabase source ใน migration batch เดียวกัน
- migrate object ที่ source verify ไม่ผ่าน

## Best-practice notes

- ใช้ S3 Batch Operations หรือ manifest-driven job เมื่อต้องย้ายจำนวนมากมาก ๆ แต่สำหรับรอบแรกของ HRBP ให้เริ่มจาก batch เล็กผ่าน backend ของระบบก่อน เพื่อควบคุม DB update และ UX verification ได้ละเอียด
- S3 lifecycle ต้องมี rule สำหรับ abort incomplete multipart uploads เพราะ object expiration ปกติไม่เก็บกวาด multipart upload ที่ค้างเอง
- Supabase Storage cleanup ต้องใช้ Storage API `remove` ไม่ลบ row storage ผ่าน SQL เพราะจะเกิด orphan ใน bucket
- Cloudflare R2 lifecycle ใช้ได้กับ legacy cleanup หลังผ่าน retention แต่ห้ามตั้งลบเร็วเกินไปก่อน migration audit จบ
