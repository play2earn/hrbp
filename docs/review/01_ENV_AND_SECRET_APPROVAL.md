# Environment and Secret Approval

## เอาค่าแต่ละตัวมาจากไหน

> ใส่ค่าจริงใน local `.env` และใน Deployment Settings เท่านั้น ห้ามใส่ค่าจริงใน `.env.example`, เอกสาร, Git, chat หรือ screenshot

### Supabase

| ตัวแปร | เอาค่าจากไหน | วิธีเลือกค่า | การเก็บรักษา |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project → **Connect** หรือ **Integrations → Data API** | Project URL รูปแบบ `https://<project-ref>.supabase.co` | Browser-safe |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → **Settings → API Keys** | ใช้ **Publishable key** (`sb_publishable_...`) สำหรับ frontend; legacy `anon` ใช้ได้ชั่วคราว | Browser-safe แต่ยังต้องมี RLS |
| `SUPABASE_SECRET_KEY` | Supabase Dashboard → **Settings → API Keys → Secret keys** | แนะนำสร้าง secret key แยกสำหรับ HRBP backend (`sb_secret_...`) | **Server secret**; bypass RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | หน้า **Legacy API Keys** ใน Supabase | ใช้แทน `SUPABASE_SECRET_KEY` เฉพาะระบบเดิม; ไม่ต้องใส่ทั้งสองค่า | **Server secret**; วางแผนเลิกใช้ legacy key |
| `SUPABASE_URL` | ค่าเดียวกับ `VITE_SUPABASE_URL` | Optional เพราะ server มี fallback ไป `VITE_SUPABASE_URL`; ใส่ได้เพื่อแยก config ชัดเจน | Server config |

ชื่อ `VITE_SUPABASE_ANON_KEY` ใน code ยังรองรับ Publishable key รุ่นใหม่ แม้ชื่อตัวแปรจะมีคำว่า `ANON` ก็ตาม ห้ามนำ Secret/service-role key มาใส่ตัวแปรที่ขึ้นต้น `VITE_`

### ค่าที่เราต้องสร้างหรือกำหนดเอง

| ตัวแปร | เอาค่าจากไหน | วิธีเลือกค่า | การเก็บรักษา |
|---|---|---|---|
| `HRBP_SESSION_SECRET` | สร้างใหม่เองใน password/secrets manager | สุ่มอย่างน้อย 32 ตัวอักษร เช่น `openssl rand -base64 48` และใช้คนละค่าระหว่าง staging/production | **Server secret** |
| `CRON_SECRET` | สร้างใหม่เอง | สุ่มแบบเดียวกับ session secret แต่ต้องเป็นคนละค่า ใช้ส่ง `Authorization: Bearer ...` ให้ cleanup job | **Server secret** |
| `APP_ORIGIN` | Domain ที่ผู้ใช้เปิด HRBP จริง | เช่น `https://hrbp.company.com`; ใส่เฉพาะ origin ห้ามมี path, query หรือ `/` ท้ายค่า | Server config |
| `IDMS_AGENT_CODE` | ขอจากเจ้าของระบบ IDMS/Worklog หรือผู้ดูแล integration ของบริษัท | ต้องเป็น AgentCode สำหรับ environment นี้; หากค่าเดิมเคยอยู่ใน browser/source ให้ขอออกใหม่ | **Server secret** |

### AWS S3

| ตัวแปร | เอาค่าจากไหน | วิธีเลือกค่า | การเก็บรักษา |
|---|---|---|---|
| `AWS_S3_BUCKET` | AWS Console → **S3 → General purpose buckets** | ชื่อ private bucket ที่จะเก็บ HRBP; staging/production ควรแยก bucket หรืออย่างน้อยแยก account/prefix | Server config |
| `AWS_REGION` | ดู Region ของ bucket ใน S3 Console | ใช้ region code เช่น `ap-southeast-1` ไม่ใช่ชื่อเมืองที่แสดงใน UI | Server config |
| `AWS_ACCESS_KEY_ID` | AWS Console → **IAM → Users → HRBP workload user → Security credentials → Create access key** | ใช้เฉพาะกรณี runtime ปัจจุบันยัง assume IAM role/OIDC ไม่ได้ | **Server secret** |
| `AWS_SECRET_ACCESS_KEY` | แสดงครั้งเดียวตอนสร้าง access key คู่ด้านบน | บันทึกเข้ secrets manager ทันที; ถ้าหายให้สร้างคู่ใหม่ ไม่สามารถเปิดดูค่าเดิมได้ | **Server secret** |
| `AWS_S3_QUOTA_GB` | Business/IT กำหนดเอง | เป็นเพดานที่ Dashboard ใช้แสดงผล ไม่ใช่ quota ที่ AWS ออกให้; ปัจจุบัน default `1000` | Server config |

ก่อนนำ bucket มาใช้ ให้เปิด S3 Block Public Access ทั้ง 4 ตัว, encryption และใช้ policy จาก `ops/aws/hrbp-s3-iam-policy.template.json` โดยแทน `REPLACE_WITH_BUCKET` ด้วยชื่อ bucket จริง ห้ามสร้าง access key จาก root user

### Cloudflare R2

| ตัวแปร | เอาค่าจากไหน | วิธีเลือกค่า | การเก็บรักษา |
|---|---|---|---|
| `R2_ACCOUNT_ID` | Cloudflare Dashboard → Account home → menu ข้างชื่อ account → **Copy account ID** หรือ R2 Overview → Account Details | ใช้ Account ID ไม่ใช่ Zone ID | Server config |
| `R2_BUCKET_NAME` | Cloudflare Dashboard → **Storage & databases → R2 → Overview** | ชื่อ bucket draft/fallback ที่มีอยู่ | Server config |
| `R2_ACCESS_KEY_ID` | R2 Overview → **Manage API Tokens** → Create token | เลือก Object Read & Write และ scope เฉพาะ bucket นี้ | **Server secret** |
| `R2_SECRET_ACCESS_KEY` | แสดงครั้งเดียวหลังสร้าง R2 API token | คัดลอกและเก็บทันที; หากหายให้ rotate token | **Server secret** |
| `R2_PUBLIC_DOMAIN` | R2 bucket → **Settings → Public Development URL หรือ Custom Domains** | ต้องใช้เฉพาะช่วง `legacy-public`; เมื่อ private proxy/S3 cutover ผ่านและปิด public access แล้วจึงเอาค่านี้ออก | Public URL ชั่วคราว ไม่ใช่ secret |

### Feature flags ของแอป

| ตัวแปร | ใครกำหนด | ค่าที่ใช้ตอนนี้ | ค่าเมื่อ staging ผ่าน |
|---|---|---|---|
| `VITE_STORAGE_PROVIDER` | ทีม HRBP | `r2+fallback` | คงเดิมจนจบ migration |
| `ATTACHMENT_STORAGE_MODE` | ทีม HRBP/Storage owner | `r2-legacy` | `s3-primary` |
| `R2_DRAFT_ACCESS_MODE` | ทีม HRBP/Security | `legacy-public` | `private-proxy` |

สอง flag หลังต้องเปลี่ยนตามลำดับใน `03_STORAGE_CUTOVER.md` ห้ามเปิด production พร้อมกันโดยไม่ผ่าน staging

## ใส่ค่าไว้ที่ไหน

- Local: คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจริง โดย `.env.local` ต้องไม่ถูก commit; ไม่ต้องใส่ค่าจริงใน `.env.example`
- Vercel ปัจจุบัน: Project → **Settings → Environment Variables** แยก Preview/Staging/Production และเปิด Sensitive ให้ server secrets จากนั้น redeploy
- Cloudflare Workers ในอนาคต: config ที่ไม่ลับใช้ Worker variables/bindings; secret ใช้ Workers Secrets/Secrets Store ห้ามใส่ plaintext ใน `wrangler.jsonc`

Official references: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Cloudflare R2 credentials](https://developers.cloudflare.com/r2/api/tokens/), [Cloudflare Account ID](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/), [R2 public access](https://developers.cloudflare.com/r2/buckets/public-buckets/), [AWS access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html), [S3 Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html), [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)

## Server-only variables

- `SUPABASE_SERVICE_ROLE_KEY` หรือ `SUPABASE_SECRET_KEY`
- `HRBP_SESSION_SECRET` อย่างน้อย 32 ตัวอักษร
- `APP_ORIGIN` เป็น origin เดียว ไม่มี path
- `IDMS_AGENT_CODE`
- `CRON_SECRET` อย่างน้อย 32 ตัวอักษร
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

ตัวแปรเหล่านี้ห้ามขึ้นต้น `VITE_` เพราะ Vite จะรวมลง browser bundle

สำหรับ Preview deployment ให้ใช้ชื่อตัวแปรเดิมแต่กำหนดคนละค่าตาม Environment ไม่ต้องสร้างชื่อ `_PRE`/`_PRD` เพิ่ม และ Vercel จะสร้าง URL ประจำ branch ให้อัตโนมัติ

## Browser-safe variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STORAGE_PROVIDER`

## Feature flags — ค่าเป้าหมายสำหรับ AWS S3 primary

```dotenv
ATTACHMENT_STORAGE_MODE=s3-primary
R2_DRAFT_ACCESS_MODE=private-proxy
```

ค่า legacy rollback ก่อนปิด public R2:

```dotenv
ATTACHMENT_STORAGE_MODE=r2-legacy
R2_DRAFT_ACCESS_MODE=private-proxy
```

## Approval checklist

- [x] ทุกบรรทัดใน `.env.local` เป็น `KEY=value`, comment ที่ขึ้นต้น `#` หรือบรรทัดว่างเท่านั้น
- [x] Secret ใหม่ถูกสร้างสำหรับ session และ cron
- [x] Preview และ Production ใช้ `HRBP_SESSION_SECRET`/`CRON_SECRET` คนละค่า
- [x] `APP_ORIGIN` ตรงกับ `https://hrbp-three.vercel.app`
- [x] IDMS ยืนยันให้ใช้ AgentCode เดิมชั่วคราวได้; ต้องอยู่ใน environment variable เท่านั้น ห้ามฝังใน source/frontend
- [ ] AWS/R2 IAM จำกัดเฉพาะ bucket/prefix ที่ระบบใช้
- [ ] ผู้อนุมัติยืนยันเวลาที่จะ revoke key เก่า
- [x] `npm run env:check:production` ผ่านโดยไม่พิมพ์ค่า secret

## Rotation order

1. สร้าง credential ใหม่โดยยังไม่ revoke ของเดิม หาก provider รองรับ overlap
2. ใส่ credential ใหม่ใน staging และรัน preflight/smoke test
3. ใส่ production environment และ deploy frontend/API revision เดียวกัน
4. ทดสอบ production smoke flow
5. Revoke credential เดิม

หาก provider ไม่รองรับ overlap ให้ทำขั้น 2–5 ใน maintenance window เดียวกัน
