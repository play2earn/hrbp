# Storage Cutover: AWS S3 Primary with R2 Fallback

## Target flow

```text
Applicant browser
  → signed draft session
  → private AWS S3 drafts/{draftId}/...
  → submit application
  → server verifies and moves draft objects to private S3 applicants/{applicationId}/...
  → database stores /api/files?key=...
  → server deletes S3 draft only after verification and DB update
```

R2 remains configured only as fallback/legacy storage for existing draft objects and old public references during transition. New applicant uploads, edit/crop uploads, resubmit uploads and requested-document uploads must write to AWS S3 when `ATTACHMENT_STORAGE_MODE=s3-primary`.

## Infrastructure approval

- [ ] S3 Block Public Access เปิดครบ
- [ ] Default encryption เปิด
- [ ] Versioning เปิดตาม retention policy
- [ ] Lifecycle สำหรับ incomplete multipart uploads, trash และ draft ที่ค้างใน `drafts/`
- [ ] IAM policy ใช้ template ใน `ops/aws/hrbp-s3-iam-policy.template.json`
- [ ] Staging และ production bucket/prefix แยกกัน
- [ ] R2 `r2.dev` และ custom public domain ยังไม่ถูกปิดก่อนยืนยันว่า old references/fallback ไม่จำเป็นแล้ว

## Cutover order

1. Deploy code โดยคง `r2-legacy` + `legacy-public` เพื่อ baseline
2. เปิด `ATTACHMENT_STORAGE_MODE=s3-primary` และ `R2_DRAFT_ACCESS_MODE=private-proxy` บน staging/preview
3. ทดสอบ applicant upload/preview/submit/finalize ว่า draft และ final objects อยู่ใน S3
4. ทดสอบ edit photo/crop, resubmit upload และ request-more-documents ว่า URL ใหม่เป็น `/api/files?key=...`
5. ตรวจ S3 object size, database proxy URL และ file authorization
6. เปิด flags เดียวกันใน production change window
7. รอ retention window และตรวจ URL เก่าก่อนปิด public R2 access

## Failure recovery

- ถ้า copy หรือ database update ล้มเหลว ระบบพยายามลบ object ปลายทางและคง source draft ไว้
- ถ้า database update สำเร็จแต่ลบ draft ไม่ครบ API จะตอบสำเร็จพร้อม `draftCleanupPending=true`; lifecycle ต้องเก็บกวาดภายหลัง
- เจ้าหน้าที่ที่มี signed staff session เปิด private draft ผ่าน `/api/draft-files` ได้เพื่อสอบสวนหรือกู้คืน
- [ ] ตั้ง alert จาก log `attachment finalization is pending` และ `draft object(s) remain`

## Rollback

- ก่อนปิด public R2: เปลี่ยน `ATTACHMENT_STORAGE_MODE=r2-legacy` และ redeploy
- หลังปิด public R2: ห้าม rollback เป็น `legacy-public`; ใช้ private proxy เท่านั้น
- ห้ามลบ S3 objects ระหว่าง rollback เพราะ database อาจชี้ไปยัง S3 แล้ว

## Approval record

- [ ] Storage owner reviewed IAM policy
- [ ] Security reviewed public-access shutdown
- [ ] HR verified sample documents
- [ ] Rollback owner and change window confirmed
