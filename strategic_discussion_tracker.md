# 📋 รายการหัวข้อหารือเชิงกลยุทธ์ (Strategic Discussion Tracker)

ไฟล์นี้ใช้เพื่อบันทึกและติดตามความคืบหน้าของไอเดีย/หัวข้อเชิงกลยุทธ์ต่างๆ ที่ได้หารือร่วมกับทีมพัฒนา เพื่อความสะดวกในการเรียกตรวจสอบในอนาคต

---

## 📌 สรุปหัวข้อหารือในปัจจุบัน (Current Discussions)

### 1. ระบบขออัตรากำลังพลและการจับคู่ผู้สมัครงานอัจฉริยะด้วย AI (End-to-End AI-Powered Manpower Requisition & Talent Matching)
- **รายละเอียด:** พัฒนาระบบแชทคุยร่าง JD สำหรับแผนกที่คนขาด เชื่อมโยงระบบ Semantic Vector Search ค้นหาผู้สมัครเดิมใน Talent Pool อัตโนมัติด้วย AI Agents
- **สถานะปัจจุบัน:** 💡 *หารือเบื้องต้น (เสนอแนะแนวคิดแล้ว)*
- **เอกสารประกอบ:** [manpower_matching_proposal.md](file:///Users/delta/.gemini/antigravity-ide/brain/7411f1ae-64e4-45d0-a003-ff56f3a809b8/manpower_matching_proposal.md)
- **แผนงานระยะถัดไป:** รออนุมัติการวางแผนและจัดโครงสร้างฐานข้อมูลสำหรับการเก็บ Vector Embeddings

### 2. การย้ายแหล่งเก็บไฟล์แนบ/ประวัติผู้สมัครไปที่ AWS S3 (Migration to AWS S3 Storage)
- **รายละเอียด:** ย้ายระบบจัดการไฟล์อัปโหลด เช่น ใบสมัครงาน เรซูเม่ (PDFs) และภาพถ่ายผู้สมัคร จากการเก็บแบบ Local หรือฐานข้อมูลหลักเดิม ไปจัดเก็บยัง AWS S3 Bucket เพื่อความเสถียร ความปลอดภัย และประสิทธิภาพในการดาวน์โหลดระยะยาว
- **สถานะปัจจุบัน:** ⏳ *ค้างหารือ/วางแผน*
- **เอกสารประกอบ:** *(รอเปิดแผนงานการออกแบบโครงสร้าง AWS Credentials & SDK integration)*
- **แผนงานระยะถัดไป:** ศึกษาข้อมูล Bucket Policies, การต่ออายุ Pre-signed URLs สำหรับแชร์โปรไฟล์ และแผนสำรองข้อมูล (Backup Plan)

### 3. ระบบควบคุมการตรวจสอบสิทธิ์ความปลอดภัยฐานข้อมูล (Database RLS Policy Hardening)
- **รายละเอียด:** เนื่องจากแอปพลิเคชันเชื่อมต่อฐานข้อมูลโดยไม่ผ่านระบบ Supabase Auth ปกติ (เชื่อมด้วย Anonymous role) จึงต้องปรับปรุงนโยบาย RLS (Row Level Security) เพื่อควบคุมสิทธิ์การเข้าถึงข้อมูลผ่านส่วนหัว `x-admin-key` ให้ปลอดภัยยิ่งขึ้น
- **สถานะปัจจุบัน:** ⚙️ *รอดำเนินการบำรุงรักษาความปลอดภัย*
- **เอกสารประกอบ:** [update_blacklist_rls_policies.sql](file:///Users/delta/Documents/--%20VibeCode/vibecode-recruit/hrbp/supabase/update_blacklist_rls_policies.sql)
- **แผนงานระยะถัดไป:** ตรวจสอบนโยบายสิทธิ์ตารางทั้งหมดเพื่อป้องกันข้อมูลรั่วไหลจากภายนอก

### 4. ระบบอนุมัติและพิมพ์บันทึกข้อความจ้างงาน (Employment Approval Memo & Master Data)
- **รายละเอียด:** บูรณาการและพัฒนาฟอร์มเอกสารขออนุมัติจ้างงาน `memo.html` ให้ทำการดึงประวัติผู้สมัคร, ข้อมูลเงื่อนไขปฏิทินงาน และเงินรางวัลโบนัสพิเศษ (Memo Calendars & Conditions) จากตาราง Master Data โดยอัตโนมัติ
- **สถานะปัจจุบัน:** 📝 *ผ่านขั้นตอนการปรับปรุงเบื้องต้น*
- **เอกสารประกอบ:** [create_memo_master_data.sql](file:///Users/delta/Documents/--%20VibeCode/vibecode-recruit/hrbp/create_memo_master_data.sql) | [memo.html](file:///Users/delta/Documents/--%20VibeCode/vibecode-recruit/hrbp/public/memo.html)
- **แผนงานระยะถัดไป:** พัฒนาหน้าจอผู้ดูแลระบบสำหรับจัดการเพิ่ม/ลบเงื่อนไข Master Data ในแดชบอร์ด

### 5. ระบบบัญชีดำและบันทึกกิจกรรมการใช้งาน (Blacklist Control & Audit Logs Tab)
- **รายละเอียด:** ตรวจสอบและบันทึกประวัติกิจกรรมของ HR ในการดูรายชื่อผู้สมัคร, การคัดกรอง หรือปรับปรุงรายชื่อผู้ติดบัญชีดำ (Blacklist Table) ผ่านตาราง `blacklist_audit_logs` เพื่อตอบสนองเงื่อนไขการควบคุมความปลอดภัยข้อมูลบุคคล (Compliance)
- **สถานะปัจจุบัน:** 📊 *มีส่วนพัฒนาแล้วบางส่วน*
- **เอกสารประกอบ:** [update_blacklist_and_audit.sql](file:///Users/delta/Documents/--%20VibeCode/vibecode-recruit/hrbp/supabase/update_blacklist_and_audit.sql)
- **แผนงานระยะถัดไป:** เพิ่มหน้าจอประวัติกิจกรรมในบอร์ดผู้บริหาร (System Logs Tab) สำหรับสืบค้นย้อนหลัง

---

## 📝 บันทึกประวัติและข้อคิดเห็นเพิ่มเติม
*(สามารถบันทึกข้อสรุปจากการพูดคุยเพิ่มเติมตรงส่วนนี้ได้)*

