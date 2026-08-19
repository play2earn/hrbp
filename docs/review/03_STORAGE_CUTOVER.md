# Storage Cutover: R2 Draft to Private S3

## Target flow

```text
Applicant browser
  → signed draft session
  → private R2 drafts/{draftId}/...
  → submit application
  → server copies verified draft objects to private S3 applicants/{applicationId}/...
  → database stores /api/files?key=...
  → server deletes R2 draft only after S3 verification and DB update
```

## Infrastructure approval

- [ ] S3 Block Public Access เปิดครบ
- [ ] Default encryption เปิด
- [ ] Versioning เปิดตาม retention policy
- [ ] Lifecycle สำหรับ incomplete multipart uploads, trash และ draft ที่ค้างใน `drafts/`
- [ ] IAM policy ใช้ template ใน `ops/aws/hrbp-s3-iam-policy.template.json`
- [ ] Staging และ production bucket/prefix แยกกัน
- [ ] R2 `r2.dev` และ custom public domain ยังไม่ถูกปิดก่อน private-proxy test ผ่าน

## Cutover order

1. Deploy code โดยคง `r2-legacy` + `legacy-public`
2. เปิด `R2_DRAFT_ACCESS_MODE=private-proxy` บน staging
3. ทดสอบ upload/preview/submit/finalize
4. เปิด `ATTACHMENT_STORAGE_MODE=s3-primary` บน staging
5. ตรวจ S3 object size, database proxy URL และ file authorization
6. เปิด flags เดียวกันใน production change window
7. รอ retention window และตรวจ URL เก่าก่อนปิด public R2 access

## Failure recovery

- ถ้า copy หรือ database update ล้มเหลว ระบบพยายามลบ object ปลายทางและคง R2 draft ไว้
- ถ้า database update สำเร็จแต่ลบ R2 draft ไม่ครบ API จะตอบสำเร็จพร้อม `draftCleanupPending=true`; lifecycle ต้องเก็บกวาดภายหลัง
- เจ้าหน้าที่ที่มี signed staff session เปิด private draft ผ่าน `/api/draft-files` ได้เพื่อสอบสวนหรือกู้คืน
- [ ] ตั้ง alert จาก log `attachment finalization is pending` และ `R2 draft object(s) remain`

## Rollback

- ก่อนปิด public R2: เปลี่ยน `ATTACHMENT_STORAGE_MODE=r2-legacy` และ redeploy
- หลังปิด public R2: ห้าม rollback เป็น `legacy-public`; ใช้ private proxy เท่านั้น
- ห้ามลบ S3 objects ระหว่าง rollback เพราะ database อาจชี้ไปยัง S3 แล้ว

## Approval record

- [ ] Storage owner reviewed IAM policy
- [ ] Security reviewed public-access shutdown
- [ ] HR verified sample documents
- [ ] Rollback owner and change window confirmed
