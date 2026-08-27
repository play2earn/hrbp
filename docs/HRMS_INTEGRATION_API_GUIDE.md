# 📘 คู่มือการเชื่อมต่อ API สำหรับระบบ IDMS / HRMS
**HRBP Candidate Data Synchronization & Onboarding Integration API**  
*เวอร์ชันเอกสาร: 1.0.0 | วันที่ปรับปรุงล่าสุด: 27 สิงหาคม 2026*

---

## 📌 1. ภาพรวมระบบ (Overview)

เอกสารฉบับนี้จัดทำขึ้นสำหรับทีมงาน **IT / System Integrator / HRMS Developer** สำหรับการดึงข้อมูลประวัติผู้สมัครงานที่ผ่านการคัดเลือก (Finalized Candidates) และไฟล์เอกสารแนบทั้งหมดจากระบบ **HRBP Recruitment Dashboard** ไปประมวลผลต่อในระบบ **IDMS / HRMS** ภายในองค์กร เพื่อทำการออกรหัสพนักงาน (Employee ID) และดำเนินการกระบวนการ Onboarding พนักงานใหม่อย่างราบรื่น

### 🔄 ลำดับการทำงาน (Integration Workflow)
1. **HR ฝั่งสรรหา** ตรวจสอบข้อมูลผู้สมัครครบถ้วน และกดปุ่ม **"ส่งข้อมูลไป HRMS"** ใน HRBP Dashboard
2. **ระบบ IT (HRMS/IDMS)** ดึงข้อมูลผ่าน **Export API** (ดึงตามคิว `READY_TO_SYNC` หรือดึงเจาะจงรายบุคคล)
3. **ระบบ IT** ดาวน์โหลดไฟล์เอกสารแนบ (ผ่าน Presigned URLs ปลอดภัย) เก็บเข้าคลังเอกสารขององค์กร
4. **ระบบ IT** บันทึกข้อมูลพนักงานเสร็จสิ้น และยิง **Ack Callback API** ส่งรหัสพนักงาน (`hrms_employee_id`) กลับมาเพื่อปิดงาน

---

## 🔐 2. การยืนยันตัวตนและความปลอดภัย (Authentication & Security)

เพื่อความปลอดภัยของข้อมูลส่วนบุคคลตามมาตรฐาน **PDPA** ทุก Request ต้องส่งค่า Secret Key ผ่าน HTTP Header อย่างใดอย่างหนึ่งดังนี้:

### HTTP Headers:
```http
X-API-Key: <HRMS_SYNC_API_KEY>
Content-Type: application/json
```
*หรือใช้ Bearer Token:*
```http
Authorization: Bearer <HRMS_SYNC_API_KEY>
Content-Type: application/json
```

> ⚠️ **หมายเหตุ:** Secret Key จะถูกส่งมอบให้ทีม IT ภายในอย่างปลอดภัย หากไม่ส่ง Header หรือ Key ไม่ถูกต้อง ระบบจะตอบกลับด้วย `401 Unauthorized`

---

## 🌐 3. รายละเอียด API Endpoints

---

### 📥 Endpoint 1: ดึงข้อมูลผู้สมัครและไฟล์แนบ (Export API)

ใช้สำหรับดึงข้อมูลประวัติผู้สมัครและ Presigned URLs ของไฟล์เอกสาร

* **Method:** `GET`
* **Path:** `/api?route=hrms-export`
* **Query Parameters (เลือกใช้อย่างใดอย่างหนึ่ง):**

| Parameter | Type | Required | คำอธิบาย |
| :--- | :--- | :---: | :--- |
| `application_id` | `UUID` | Optional | รหัสใบสมัครเฉพาะเจาะจง (เช่น `33656a06-96dd-41c2-a42f-094c834c19c0`) **[แนะนำ]** |
| `status` | `string` | Optional | ดึงเป็นชุดตามสถานะ เช่น `READY_TO_SYNC` สำหรับ Cron Job |
| `national_id` | `string` | Optional | ค้นหาด้วยรหัสบัตรประชาชน 13 หลัก |
| `limit` | `number` | Optional | จำนวนรายการสูงสุดต่อรอบ (ค่าเริ่มต้น: `50`, สูงสุด: `100`) |

---

#### 💻 ตัวอย่าง Request (cURL):
```bash
curl -X GET "https://<YOUR_DOMAIN>/api?route=hrms-export&status=READY_TO_SYNC" \
  -H "X-API-Key: YOUR_ENTERPRISE_SECRET_KEY" \
  -H "Content-Type: application/json"
```

#### 💻 ตัวอย่าง Request (Python):
```python
import requests

url = "https://<YOUR_DOMAIN>/api?route=hrms-export&status=READY_TO_SYNC"
headers = {
    "X-API-Key": "YOUR_ENTERPRISE_SECRET_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    payload = response.json()
    print(f"พบผู้สมัครรอ Sync: {payload['count']} รายการ")
    for app in payload["data"]:
        print(app["personal_info"]["full_name"], app["applied_position"]["position_th"])
```

---

#### 📦 ตัวอย่าง Response Data Schema:

```json
{
  "success": true,
  "timestamp": "2026-08-27T18:30:00.000Z",
  "count": 1,
  "data": [
    {
      "application_id": "33656a06-96dd-41c2-a42f-094c834c19c0",
      "created_at": "2026-08-17T08:22:20.500Z",
      "status": "Offer",
      
      "hrms_sync": {
        "status": "READY_TO_SYNC",
        "ready_at": "2026-08-27T18:25:00.000Z",
        "ready_by": "Chatchawan Tulaphak",
        "synced_at": null,
        "employee_id": null,
        "notes": null
      },

      "rehire_meta": {
        "is_rehire": false,
        "total_applications_in_system": 1,
        "note": "First-time applicant record."
      },

      "applied_position": {
        "position_th": "เจ้าหน้าที่บัญชี",
        "position_en": "Accounting Officer",
        "department_th": "การบัญชี",
        "department_en": "Accounting",
        "business_unit": "Other",
        "expected_salary": "20000",
        "is_salary_negotiable": true,
        "availability": "พร้อมเริ่มงานทันที",
        "source_channel": "WebJob",
        "campaign_tag": "General A"
      },

      "personal_info": {
        "is_thai_national": true,
        "national_id": "1100100000000",
        "passport_no": "",
        "title_th": "นาย",
        "first_name_th": "ทดสอบ1",
        "last_name_th": "ทดสอบ2",
        "title_en": "Mr.",
        "first_name_en": "Test1",
        "last_name_en": "Test2",
        "full_name": "นาย ทดสอบ1 ทดสอบ2",
        "nickname": "ทดสอบ",
        "nickname_en": "Test",
        "date_of_birth": "2004-06-01",
        "age": "22",
        "weight_kg": "75",
        "height_cm": "180",
        "military_status": "ROTC",
        "marital_status": "Single"
      },

      "contact_info": {
        "phone": "0899999999",
        "email": "test@gmail.com",
        "current_address": {
          "address_line": "123/45 หมู่ 1",
          "subdistrict": "บางสมัคร",
          "district": "บางปะกง",
          "province": "ฉะเชิงเทรา",
          "postcode": "24180"
        },
        "registered_address": {
          "address_line": "123/45 หมู่ 1",
          "subdistrict": "เกาะขนุน",
          "district": "พนมสารคาม",
          "province": "ฉะเชิงเทรา",
          "postcode": "24120"
        }
      },

      "education": [
        {
          "level": "ปริญญาตรี",
          "institute": "มหาวิทยาลัยบูรพา",
          "major": "บัญชีบัณฑิต",
          "gpa": "3.50",
          "startDate": "2020-08-01",
          "endDate": "2024-05-30"
        }
      ],

      "work_experience": [
        {
          "company": "บริษัท ทดสอบ แอคเคาท์ติ้ง จำกัด",
          "position": "Junior Accountant",
          "from": "2024-06-01",
          "to": "2026-05-31",
          "salary": "18000"
        }
      ],

      "attachments": {
        "profile_photo": {
          "url": "https://<DOMAIN>/api?route=files&url=...&download=true",
          "file_name": "photoUrl.jpg",
          "expires_in_seconds": 7200
        },
        "resume": {
          "url": "https://<DOMAIN>/api?route=files&url=...&download=true",
          "file_name": "resumeUrl.pdf",
          "expires_in_seconds": 7200
        },
        "transcript": {
          "url": "https://<DOMAIN>/api?route=files&url=...&download=true",
          "file_name": "transcriptUrl.pdf",
          "expires_in_seconds": 7200
        },
        "certificate": null,
        "id_card": null,
        "house_registration": null,
        "educational_certificate": null,
        "military_certificate": null,
        "toeic_certificate": null,
        "bank_book": null
      }
    }
  ]
}
```

---

### 📤 Endpoint 2: ยืนยันผลการนำเข้าข้อมูล (Acknowledgment Callback API)

เมื่อระบบ IT นำเข้าข้อมูลสู่ IDMS / HRMS และออกรหัสพนักงานสำเร็จ ให้เรียก API นี้เพื่อยืนยันสถานะกลับมายัง HRBP

* **Method:** `POST`
* **Path:** `/api?route=hrms-ack`
* **Request Body (JSON):**

| Field | Type | Required | คำอธิบาย |
| :--- | :--- | :---: | :--- |
| `application_id` | `UUID` | **Required** | รหัสใบสมัครผู้สมัคร (จาก `application_id` ที่ได้จาก Export API) |
| `hrms_employee_id` | `string` | **Required** | รหัสพนักงานใหม่ที่ออกโดยระบบ HRMS/IDMS (เช่น `EMP-69042`) |
| `sync_status` | `string` | Optional | สถานะการ Sync: `SYNCED` (สำเร็จ) หรือ `FAILED` (ไม่สำเร็จ) |
| `notes` | `string` | Optional | บันทึกช่วยจำ หรือ Error Detail หากนำเข้าไม่สำเร็จ |

---

#### 💻 ตัวอย่าง Request (cURL):
```bash
curl -X POST "https://<YOUR_DOMAIN>/api?route=hrms-ack" \
  -H "X-API-Key: YOUR_ENTERPRISE_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "33656a06-96dd-41c2-a42f-094c834c19c0",
    "hrms_employee_id": "EMP-69042",
    "sync_status": "SYNCED",
    "notes": "นำเข้าข้อมูลสู่ระบบ IDMS สำเร็จโดยระบบอัตโนมัติ"
  }'
```

#### 📦 ตัวอย่าง Response:
```json
{
  "success": true,
  "message": "HRMS sync status updated successfully",
  "data": {
    "id": "33656a06-96dd-41c2-a42f-094c834c19c0",
    "full_name": "นาย ทดสอบ1 ทดสอบ2",
    "hrms_sync_status": "SYNCED",
    "hrms_employee_id": "EMP-69042",
    "hrms_synced_at": "2026-08-27T18:35:00.000Z"
  }
}
```

---

## 📂 4. การดาวน์โหลดไฟล์แนบ (File Downloads & Archiving)

- ฟิลด์ใน Object `attachments` แต่ละรายการจะส่งกลับมาเป็น `{ url, file_name, expires_in_seconds }` (หรือ `null` หากผู้สมัครไม่ได้แนบไฟล์นั้น)
- **URL สำหรับดาวน์โหลดเป็นแบบ Presigned Secure Link** ที่มีอายุจำกัด **2 ชั่วโมง (7,200 วินาที)**
- **คำแนะนำ:** ระบบของ IT ควรทำการดาวน์โหลดไฟล์ตาม `url` และบันทึกลงใน Storage / File Server ภายในองค์กรทันทีในขั้นตอนการนำเข้า

---

## 👥 5. การจัดการกรณีพนักงานเก่า (Re-hire Handling)

- ระบบ HRBP มีกลไกตรวจสอบประวัติการสมัครย้อนหลังอัตโนมัติ โดยดูจากรหัสบัตรประชาชน (`national_id`)
- ใน Response จะมี Object `rehire_meta`:
  - `"is_rehire": true` ➔ บุคคลนี้เคยมีประวัติการสมัครในระบบ HRBP มาก่อน
  - `"total_applications_in_system": 2` ➔ จำนวนรอบที่เคยสมัคร
- **การดำเนินการฝั่ง HRMS:** ฝั่ง IT สามารถนำ `national_id` ไปค้นหาประวัติเดิมในฐานข้อมูลองค์กรเพื่อเชื่อมโยงประวัติ และทำการสร้าง `employee_id` ใหม่ตามนโยบาย Re-hire ขององค์กรได้ทันที

---

## 🚦 6. ตารางรหัสข้อผิดพลาด (HTTP Status Codes)

| Status Code | Code / Meaning | คำอธิบาย & วิธีแก้ไข |
| :---: | :--- | :--- |
| **200** | `OK` | ดำเนินการสำเร็จ ข้อมูลถูกต้อง |
| **400** | `Bad Request` | ส่ง Parameter ไม่ครบถ้วน (เช่น ขาด `application_id`) |
| **401** | `Unauthorized` | ไม่ได้ส่ง `X-API-Key` หรือ Secret Key ไม่ถูกต้อง |
| **404** | `Not Found` | ไม่พบใบสมัครที่ระบุในระบบ |
| **405** | `Method Not Allowed` | เรียกผิด Method (Export ต้องใช้ `GET`, Ack ต้องใช้ `POST`) |
| **500** | `Internal Error` | เกิดข้อผิดพลาดฝั่ง Server (ติดต่อทีม HRBP Admin) |

---

*หากมีข้อสงสัยหรือต้องการทดสอบเพิ่มเติม ติดต่อทีมพัฒนาระบบ HRBP Recruitment Dashboard*
