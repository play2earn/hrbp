# แผน Corporate Domain และ Cloudflare-First Migration สำหรับ HRBP

> **สถานะเอกสาร:** Proposed — รออนุมัติเป็นรายระยะ
> **อัปเดตล่าสุด:** 18 สิงหาคม 2026
> **เป้าหมาย:** เพิ่ม security boundary, ลด bandwidth/egress, รองรับ scale และลดความเสี่ยงจากการย้ายระบบครั้งใหญ่

---

## 1. Executive Recommendation

### ข้อเสนอที่แนะนำที่สุด

ให้เดินหน้าแบบ **Cloudflare-First โดยยังไม่ย้ายฐานข้อมูลหลักไป D1 ทันที**:

1. แก้ security boundary และ secrets ก่อนเปิด corporate domain
2. ย้าย React/Vite และ API จาก Vercel ไป Cloudflare Workers
3. ให้ Browser เรียก API ของเราเท่านั้น และให้ Worker เชื่อม Supabase Postgres ผ่าน Hyperdrive
4. ใช้ private AWS S3 เป็นที่เก็บเอกสารหลัก และคง R2 เฉพาะ draft/fallback พร้อม signed/scoped access
5. เปิด Cloudflare Access, WAF, Rate Limiting และ Turnstile ตามประเภทผู้ใช้
6. ทดลอง D1 กับ master/reference data ก่อน แล้วใช้ metrics ตัดสินใจว่าจะย้าย core database หรือไม่

แนวทางนี้ให้ประโยชน์ด้าน bandwidth และ security ส่วนใหญ่ของ Cloudflare-native architecture โดยยังคง PostgreSQL functions, JSONB, views และ workflow เดิมไว้ในช่วงแรก

### สิ่งที่ยังไม่แนะนำให้อนุมัติในตอนนี้

- ไม่ย้าย `applications`, `users`, workflow, blacklist และ audit logs ไป D1 พร้อมกันทั้งหมด
- ไม่ใช้ Cloudflare proxy ซ้อนหน้า Vercel เป็นสถาปัตยกรรมปลายทางระยะยาว
- ไม่เปิด public R2 URL สำหรับเอกสารผู้สมัคร
- ไม่ถือว่า WAF ทดแทน authentication หรือ object-level authorization ได้
- ไม่คำนวณความคุ้มค่าจากตัวเลข cache hit หรือ bandwidth ที่ยังไม่ได้วัดจริง

---

## 2. Target Architecture ที่แนะนำ

```text
ผู้สมัคร / HR / Admin
          │
          ▼
Cloudflare DNS + TLS + DDoS + WAF + Rate Limiting
          │
          ├── careers.company.com
          │     ├── Workers Static Assets: React/Vite
          │     ├── Turnstile สำหรับ public submission/upload
          │     └── Worker API
          │
          └── hrbp.company.com
                ├── Cloudflare Access / Corporate Identity
                └── Worker API
                         │
                         ├── Supabase Postgres ผ่าน Hyperdrive
                         ├── Private AWS S3 (primary attachments)
                         ├── Cloudflare R2 (temporary draft/fallback)
                         ├── IDMS / Worklog API
                         └── Queues / Workflows / Scheduled Tasks
```

### Trust boundaries

| Zone | ผู้ใช้ | การป้องกันหลัก |
|---|---|---|
| `careers.company.com` | ผู้สมัครภายนอก | Turnstile, rate limit, validation, scoped upload token |
| `hrbp.company.com` | HR/Admin ภายใน | Cloudflare Access, signed session, role/permission checks |
| Worker API | ทั้งสองกลุ่ม | Authentication, authorization, schema validation, audit |
| Supabase Postgres | Worker เท่านั้น | Dedicated least-privilege DB role, ไม่มี browser access |
| Private S3 / R2 fallback | Worker/short-lived signed URL เท่านั้น | Object ownership, expiry, content validation |

---

## 3. Priority Roadmap

คะแนน Impact ใช้ระดับ 1–5 โดย 5 คือให้ผลดีต่อ security, reliability หรือ cost สูงสุด

| Priority | งาน | Impact | Effort | คำแนะนำ |
|---|---|---:|---:|---|
| **P0.1** | ปิดช่องโหว่ secrets/session/API authorization | 5 | M–H | ต้องทำก่อนเปิด corporate production |
| **P0.2** | ทำ private file access และ scoped upload | 5 | M | ต้องทำก่อนย้าย traffic จริง |
| **P1.1** | สร้าง Worker API/BFF และหยุด direct Supabase จาก Browser | 5 | H | งานแกนหลักที่แนะนำที่สุด |
| **P1.2** | ย้าย Vite SPA ไป Workers Static Assets | 5 | M | ได้ CDN/bandwidth และลด double proxy |
| **P1.3** | เปิด Access/WAF/Turnstile/rate limit | 4 | M | ทำพร้อม staging cutover |
| **P1.4** | เชื่อม Supabase Postgres ผ่าน Hyperdrive | 4 | M | รักษา PostgreSQL เดิมและลด migration risk |
| **P2** | Queues/Workflows/observability/DR | 4 | M | เพิ่ม reliability หลัง traffic เริ่มนิ่ง |
| **P3** | D1 pilot สำหรับ master/read-only data | 2–3 | M | ใช้เก็บ metrics ก่อนตัดสินใจ |
| **P4** | Full D1 migration | Conditional | H–Very High | ทำเฉพาะเมื่อผ่าน Go/No-Go criteria |

---

## 4. P0 — Security Foundation (ต้องทำก่อน)

### P0.1 Secrets, authentication และ authorization

- [ ] Rotate ค่า admin/shared secret ที่เคยถูกฝังใน frontend หรือ source code
- [ ] ห้ามส่ง admin secret หรือ service-role credential ไปกับ Vite bundle
- [ ] เปลี่ยน `localStorage.currentUser` จาก security boundary เป็น signed server session
- [ ] ใช้ cookie แบบ `HttpOnly`, `Secure`, `SameSite` หรือ JWT ที่ Worker ตรวจสอบ signature และ expiry ได้
- [ ] ตรวจ role และ object ownership ใน Worker ทุก endpoint
- [ ] แยก permission ของ applicant, recruiter, moderator และ admin
- [ ] สร้าง dedicated database role สำหรับ Hyperdrive ตามหลัก least privilege
- [ ] ปิด direct browser access ที่ไม่จำเป็นต่อ Supabase tables/RPC
- [ ] ตั้ง `Cache-Control: no-store` สำหรับ login, session และข้อมูล HR ที่มีความอ่อนไหว

### P0.2 API hardening

- [ ] เปลี่ยน IDMS login จาก browser `GET` query string เป็น `POST` ไปยัง Worker
- [ ] ห้าม log password, password hash, token และ sensitive query parameters
- [ ] จำกัด CORS ให้เฉพาะ production/staging origins ที่อนุญาต
- [ ] เพิ่ม request schema validation และ response sanitization
- [ ] ใส่ authentication/authorization ให้ file, trash, migration, cleanup และ admin endpoints
- [ ] ปิด arbitrary URL fetch หรือใช้ strict hostname allowlist เพื่อป้องกัน SSRF
- [ ] เพิ่ม idempotency key สำหรับ submit/finalize operations ที่ retry ได้

### P0.3 Private file architecture

- [ ] ตั้ง R2 bucket เป็น private
- [ ] ไม่บันทึก permanent public URL ของเอกสารผู้สมัคร
- [ ] Upload ผ่าน short-lived signed URL หรือ Worker streaming พร้อม scoped object key
- [ ] Download ผ่าน Worker authorization หรือ signed URL อายุสั้น
- [ ] ตรวจ MIME type, file signature, size และ object key
- [ ] แยก `drafts/`, `applicants/` และ `trash/` พร้อม lifecycle policy
- [ ] บันทึก file access audit โดยไม่เก็บ sensitive URL/token ลง log

### P0 Exit Criteria

- ไม่มี known admin/service secret อยู่ใน frontend bundle
- Sensitive API ทุกตัวมี authentication และ authorization test
- ไม่สามารถอ่านเอกสารด้วยการเดา object key หรือเรียก file endpoint โดยไม่ login
- Applicant upload ถูกจำกัดด้วย token, size, type และ rate limit
- Login credential ไม่ปรากฏใน browser URL, CDN log หรือ application log

> **Decision Gate A:** อนุมัติ P0 ก่อนเปิด corporate production domain หากไม่ผ่าน Exit Criteria ให้คงระบบเดิมและไม่ cut over traffic

### P0 Implementation Checklist — สถานะ ณ 18 สิงหาคม 2026

สัญลักษณ์: `[x]` ทำใน code แล้ว, `[ ]` ยังไม่ทำหรือยังต้องทำใน infrastructure, `🔗` ต้อง deploy/ทดสอบพร้อมกัน

#### 1) ต้อง deploy พร้อมกันก่อน (ความเสี่ยงสูงสุด)

- [ ] 🔗 ตั้ง server secrets ใน production/staging: `HRBP_SESSION_SECRET` อย่างน้อย 32 ตัวอักษร, `IDMS_AGENT_CODE`, `CRON_SECRET`, `APP_ORIGIN`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 🔗 Rotate admin/shared secret และ AgentCode เดิมที่เคยอยู่ใน source หรือ browser; ตรวจย้อนหลังใน Git history, CI logs และ deployment variables
- [ ] 🔗 Deploy frontend และ API ชุดนี้พร้อมกัน เพราะ frontend เก่าไม่รองรับ signed cookie/API boundary ใหม่
- [ ] 🔗 ทดสอบ smoke test ครบ: login/logout/session expiry, HR/admin role, public applicant draft, share link, resubmit PIN/upload, file view/download, trash และ S3 migration
- [ ] 🔗 ตรวจว่า production ใช้ HTTPS และ cookie มี `Secure`, `HttpOnly`, `SameSite=Lax`

หาก deploy แยกกัน ผู้ใช้อาจ login ไม่ได้, upload/finalize ไม่ผ่าน หรือ shared file เปิดไม่ได้; หากไม่ rotate secret เดิม ผู้ที่เคยเห็นค่ายังใช้ค่าเก่าโจมตีระบบได้

#### 2) ทำใน code แล้ว แต่ยังรอ deploy/acceptance test

- [x] เปลี่ยน IDMS credential จาก browser GET query เป็น POST ไป server และย้าย AgentCode ไป environment
- [x] เปลี่ยน auth boundary จาก `localStorage.currentUser` เป็น signed `HttpOnly` server session และตรวจ user ว่ายัง Active ทุกครั้ง
- [x] ลบ hardcoded `x-admin-key` ออกจาก browser client และย้าย blacklist/share-token operations สำคัญเข้า authenticated API
- [x] บังคับ role สำหรับ trash, S3 explorer/migration, R2 cleanup และ file administration
- [x] แยก scoped session สำหรับ applicant draft และ resubmit; ตรวจ application/field ก่อน upload
- [x] ป้องกัน file proxy/migration จาก arbitrary URL ด้วย exact storage-host allowlist และตรวจสิทธิ์ staff/share token
- [x] จำกัด file type/size/object key และ stream S3 download เพื่อลด memory spike
- [x] เพิ่ม security unit tests, typecheck/build scripts และ `.env.example` ที่แยก public/server-only variables

ผลที่ได้คือ browser ไม่สามารถอ้าง role/user เองเพื่อผ่าน auth, credential ไม่อยู่ใน URL/CDN log และ sensitive file/admin endpoints fail closed เมื่อไม่มี session

#### 3) ยังไม่เสร็จ — ทำต่อเป็นลำดับถัดไป

- [ ] **P0-A: Private storage จริง** — code สำหรับ private R2 draft proxy และ R2→S3 verified finalize เตรียมแล้วหลัง feature flags; ยังต้องตั้ง S3 Block Public Access/lifecycle, ทดสอบ staging และจึงค่อยปิด public R2 domain
- [ ] **P0-B: Supabase RLS/GRANT audit** — เตรียม read-only audit และ review-only revoke SQL แล้วใน `supabase/review/`; ยังห้าม apply จนทดสอบ staging และ direct protected browser calls เป็นศูนย์
- [ ] **P0-C: ย้าย protected Supabase calls ที่เหลือเข้า BFF** — audit ล่าสุดยังพบ 45 จุด; auth, token, blacklist และ storage ที่เสี่ยงที่สุดถูกย้ายแล้ว แต่ applications/users/logs/report calls ยังต้องทยอยย้าย
- [ ] **P0-D: Abuse controls** — Turnstile + rate limit ที่ login, PIN verify, applicant submit/upload และ tracking
- [ ] **P0-E: Upload validation เชิงลึก** — ตรวจ magic bytes/file signature, malware scan/quarantine และ audit file access
- [ ] **P0-F: AWS credential hardening** — เปลี่ยน long-lived access key เป็น workload identity/OIDC หรือ short-lived credentials พร้อม least-privilege bucket policy
- [ ] **P0-G: Idempotency/transaction** — ป้องกัน submit/finalize/resubmit retry แล้วเกิดข้อมูลหรือไฟล์ซ้ำ

ลำดับแนะนำ: deploy/rotate ชุดแรก → private S3/R2 → RLS + BFF → Turnstile/rate limit → malware scan/OIDC/idempotency โดย P0-A ถึง P0-C ต้องเสร็จก่อนประกาศว่า P0 ผ่านทั้งหมด

เอกสาร reviewer, acceptance และ rollback อยู่ที่ `docs/review/00_REVIEW_INDEX.md`; feature flags ทั้งสองค่า default เป็น legacy จึงไม่ cut over storage โดยอัตโนมัติ

---

## 5. P1 — Cloudflare Edge/API Migration (High Impact)

### P1.1 สร้าง Worker API/BFF

เป้าหมายคือให้ Browser ติดต่อเฉพาะ API ภายใต้ corporate domain:

```text
Browser → Worker API → Hyperdrive/Supabase Postgres
                     → R2
                     → IDMS/Worklog
```

งานหลัก:

- [ ] แยก frontend API client ออกจาก Supabase SDK calls
- [ ] ย้าย query/filter/pagination และ RPC orchestration มา Worker API
- [ ] ออกแบบ routes แยก public, authenticated และ admin
- [ ] ใช้ prepared/parameterized queries ทุกจุด
- [ ] คง PostgreSQL JSONB, functions และ report views ในระยะแรก
- [ ] ทดสอบ authorization ฝั่ง server โดยไม่เชื่อข้อมูล user/role ที่ Browser ส่งมา

### P1.2 ย้าย frontend ไป Workers Static Assets

- [ ] Deploy React/Vite ผ่าน Workers Static Assets
- [ ] กำหนด SPA fallback สำหรับ client-side routing
- [ ] ให้ Worker ทำงานก่อนเฉพาะ `/api/*`
- [ ] Cache hashed assets เช่น `/assets/*` ด้วย TTL ยาว
- [ ] ไม่ cache HTML shell แบบยาว เพื่อให้ deployment ใหม่ถูกโหลดทันที
- [ ] เพิ่ม CSP, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` และ `Permissions-Policy`

### P1.3 Cloudflare security controls

#### Public applicant domain

- [ ] Turnstile ที่ submit, upload และ action ที่ถูก abuse ได้
- [ ] ตรวจ Turnstile token ฝั่ง Worker ทุกครั้ง
- [ ] Rate limit login, PIN verification, tracking, submit และ upload แยกตาม endpoint
- [ ] เปิด Free/Managed WAF ruleset ตาม plan และทดสอบ false positives

#### Internal HRBP domain

- [ ] วาง `hrbp.company.com` หลัง Cloudflare Access
- [ ] ผูก Access กับ Corporate IdP หากพร้อม
- [ ] Worker ตรวจ Access JWT หรือ application session เพิ่มเติมตาม route
- [ ] แยก admin-only routes และสร้าง audit event เมื่อเข้าถึงข้อมูลผู้สมัคร

### P1.4 Hyperdrive และ database access

- [ ] สร้าง Supabase database user สำหรับ Hyperdrive โดยไม่ใช้ owner/postgres role
- [ ] อนุญาตเฉพาะ schema/table/function ที่ Worker ต้องใช้
- [ ] เปิด TLS verification สำหรับ database connection
- [ ] ทบทวน query caching ของ Hyperdrive โดยเฉพาะข้อมูลเฉพาะบุคคลและ read-after-write
- [ ] ใช้ Smart Placement เมื่อ Worker มีหลาย round trips ไปยัง Postgres
- [ ] วัด p50/p95/p99 latency, connection errors และ slow queries

### P1 Rollout Strategy

1. สร้าง `staging-hrbp.company.com`
2. Deploy Workers Static Assets + Worker API โดยยังไม่เปลี่ยน production DNS
3. รัน integration/E2E tests ครบ public และ internal flows
4. เปิด canary ให้ทีม HR กลุ่มเล็ก
5. เปรียบเทียบ error rate, latency, database results และ file access กับระบบ Vercel
6. Cut over production custom domain ไป Worker เมื่อผ่าน KPI
7. คง Vercel deployment เป็น rollback ชั่วคราว แต่ป้องกัน generated deployment URLs

### P1 Success Metrics

- Direct Supabase calls จาก Browser เหลือ 0 สำหรับ protected data
- Static asset cache hit อยู่ในระดับเป้าหมายหลัง warm-up
- API p95 latency ไม่แย่กว่าระบบเดิมเกินเกณฑ์ที่ตกลง
- 5xx error rate ต่ำกว่าเกณฑ์ production
- ไม่มี unauthorized file/data access ใน security tests
- Vercel bandwidth และ function invocations ลดลงตาม traffic ที่ cut over
- ค่าใช้จ่าย Cloudflare/Supabase/R2 ถูกบันทึกจาก usage จริง ไม่ใช้ค่าประมาณเพียงอย่างเดียว

> **Decision Gate B:** หลัง staging/canary ให้ตัดสินใจว่าจะ cut over production หรือ rollback โดยยังไม่เกี่ยวข้องกับการอนุมัติ D1

---

## 6. P2 — Reliability, Async Jobs และ Operations

- [ ] ใช้ Queue สำหรับงานที่ retry ได้ เช่น notification, metadata processing และ background sync
- [ ] ใช้ Workflow เมื่อกระบวนการมีหลายขั้นและต้อง resume/retry เช่น finalize application attachments
- [ ] ใช้ Scheduled Worker หรือ R2 lifecycle สำหรับ draft/orphan cleanup
- [ ] แยก synchronous request ออกจากงานหนักเพื่อลด API latency
- [ ] เพิ่ม structured logs พร้อม request ID โดย redact PII/secrets
- [ ] ตั้ง alert สำหรับ 5xx, auth failure spike, queue backlog และ database errors
- [ ] ทำ runbook สำหรับ rollback, secret rotation, R2 restore และ database incident
- [ ] ทดสอบ backup/restore และกำหนด RPO/RTO ร่วมกับฝ่ายธุรกิจ

---

## 7. P3 — D1 Pilot (Low-Risk Evaluation)

### เหตุผลที่ยังไม่ย้าย Core ทันที

โค้ดปัจจุบันพึ่งพา PostgreSQL หลายส่วน ได้แก่:

- Supabase tables/views ที่ application อ้างอิงประมาณ 24 รายการ
- PostgreSQL RPC ที่ application เรียกอย่างน้อย 6 รายการ
- JSONB path/filter หลายจุดใน `services/api.ts`
- PL/pgSQL functions, report views, triggers และ RLS policies

D1 ใช้ SQLite semantics จึงต้อง rewrite PostgreSQL RLS, PL/pgSQL, UUID/JSONB handling และ server-side authorization ไม่ใช่การเปลี่ยน connection string

ข้อจำกัดที่ต้องยอมรับ:

- Workers Paid รองรับสูงสุด 10 GB ต่อ D1 database และเพิ่มเพดานนี้ไม่ได้
- แต่ละ D1 database ประมวลผล query แบบ single-threaded
- Read Replication ช่วย read scale แต่ write ยังกลับ primary
- ต้องใช้ Sessions API เมื่อต้องการ sequential consistency/read-after-write
- `apac` เป็น location hint ไม่ใช่การรับประกันว่า data อยู่ประเทศไทย

### ขอบเขต Pilot ที่แนะนำ

เริ่มจากข้อมูล read-heavy และความเสี่ยงต่ำ:

- `provinces`, `districts`, `subdistricts`
- `departments`, `positions`, `business_units`, `channels`
- public/reference read model ที่ rebuild ได้

ยังไม่รวม:

- `applications`
- `users` และ authorization source of truth
- `blacklist`
- workflow transactions
- system/application audit logs
- candidate documents

### D1 Pilot Metrics

- ขนาด database และ growth rate
- rows read/written ต่อ request
- p95 query latency และ overloaded errors
- index utilization และ full table scans
- migration/restore time
- consistency behavior หลัง write
- ค่าใช้จ่ายจริงเทียบ Postgres

> **Decision Gate C:** เมื่อ pilot ทำงานครบหนึ่งรอบการใช้งานจริง ให้เลือก Keep Hybrid, Expand D1 หรือ Stop D1 โดยไม่กระทบ core production database

---

## 8. P4 — Full D1 Go/No-Go Criteria

อนุมัติ full migration เฉพาะเมื่อทุกข้อผ่าน:

- [ ] คาดการณ์ขนาดข้อมูล 3–5 ปีแล้วยังมี headroom จากเพดาน 10 GB หรือมีแผน shard/per-tenant database
- [ ] Write concurrency และ query duration อยู่ในระดับที่ D1 single-threaded primary รองรับ
- [ ] PostgreSQL functions/RLS/views ถูกแทนที่ด้วย Worker API และผ่าน authorization tests
- [ ] รายงานและ search queries ถูกออกแบบ/index ใหม่สำหรับ SQLite
- [ ] D1 pilot ไม่มี overloaded/consistency incident ที่ยอมรับไม่ได้
- [ ] ทดสอบ export, Time Travel restore, reconciliation และ rollback สำเร็จ
- [ ] ฝ่ายกฎหมาย/Compliance ยอมรับ data location และ data processing model
- [ ] มี migration strategy ที่ไม่ใช้ unsafe cross-database dual write
- [ ] หากต้อง sync ชั่วคราว ใช้ transactional outbox/Queue พร้อม reconciliation
- [ ] Business owner อนุมัติ maintenance window, RPO และ RTO

### แนวทางตัดสินใจ

| สถานการณ์ | คำแนะนำ |
|---|---|
| HRBP ภายในบริษัทเดียว, write ปานกลาง, reporting/transaction ซับซ้อน | เก็บ Postgres ผ่าน Hyperdrive |
| Read-heavy, schema เรียบง่าย, ข้อมูลมีขอบเขตชัด | พิจารณา D1 |
| SaaS หลายบริษัทและแบ่ง DB ต่อ tenant ได้ | D1 มีความน่าสนใจสูง |
| ต้องการฐานข้อมูลเกิน 10 GB ต่อ tenant หรือ write-heavy | ใช้ Postgres ต่อ |
| ต้องการ bandwidth/security แต่ยังไม่พร้อม rewrite DB | Workers + R2 + Hyperdrive |

---

## 9. DNS และ Corporate Domain Strategy

### ช่วงเปลี่ยนผ่านที่ยังอยู่บน Vercel

- เพิ่ม custom domain ใน Vercel ก่อน
- ใช้ CNAME target ตามค่าที่ Vercel Dashboard แสดงจริง ห้าม hard-code `cname.vercel-dns.com`
- แนะนำ DNS-only เพื่อให้ Vercel CDN/Firewall เห็น traffic เต็มรูปแบบ
- หากนโยบายองค์กรบังคับใช้ Cloudflare proxy ให้ใช้ `Full (strict)` และทดสอบ cache, Bot Protection และ deployment protection โดยยอมรับข้อจำกัดของ double proxy

### สถาปัตยกรรมปลายทางบน Workers

- ผูก `careers.company.com` และ `hrbp.company.com` เป็น Worker custom domains
- ใช้ Cloudflare เป็น DNS, TLS, WAF และ application edge โดยตรง
- ไม่ต้องวาง Cloudflare proxy ซ้อนหน้า Vercel หลัง cutover สำเร็จ
- ตั้ง Minimum TLS 1.2 หรือสูงกว่า และใช้ `Full (strict)` สำหรับ origin อื่นที่ยังเหลือ
- เปิด HSTS หลังยืนยันว่าทุก subdomain ที่จะครอบคลุมรองรับ HTTPS แล้วเท่านั้น

---

## 10. Measurement Baseline ก่อนเริ่ม

ต้องเก็บ baseline อย่างน้อยรายการต่อไปนี้ก่อนนำตัวเลขไปคำนวณ ROI:

- Vercel Fast Data Transfer และ Function Invocations รายวัน/รายเดือน
- Supabase database size, rows per table, API requests และ egress
- Query latency, slow queries และ peak write concurrency
- R2/S3 storage, Class A/B operations, average file size และ download volume
- จำนวน applicant submissions, uploads, HR sessions และ report queries
- Error rate, authentication failures และ unauthorized attempts
- ค่าใช้จ่ายจริงของ Vercel, Supabase, AWS/R2 และ Cloudflare plan

ห้ามสรุปว่า cache ลด bandwidth 80–90% หรือประหยัด 5–10 เท่า จนกว่าจะมีข้อมูลจริงหลัง staging/canary

---

## 11. Recommended Approval Scope รอบแรก

### แนะนำให้อนุมัติ

- P0 security foundation และ private file design
- P1 architecture spike/prototype สำหรับ Workers Static Assets + Worker API + Hyperdrive
- Staging domain และ measurement baseline
- D1 schema/compatibility assessment เฉพาะ pilot โดยยังไม่ migrate production data

### ยังไม่ต้องอนุมัติ

- Production DNS cutover
- ปิด Vercel production
- Full D1 migration
- ลบ Supabase/Postgres schema หรือ data
- ย้าย audit/compliance source of truth

ผลจาก P0 และ P1 prototype จะเป็นข้อมูลสำหรับการตัดสินใจรอบถัดไป โดยทุกขั้นยังสามารถหยุดหรือ rollback ได้

---

## 12. Official References

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Hyperdrive with Supabase](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Turnstile Server-Side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Access for Self-Hosted Applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Cloudflare D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare D1 Read Replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)
- [Cloudflare D1 Data Location](https://developers.cloudflare.com/d1/configuration/data-location/)
- [Vercel: Cloudflare in front of Vercel](https://vercel.com/kb/guide/cloudflare-with-vercel)

---

*เอกสารนี้เป็นแผนตัดสินใจและลำดับการลงทุน ไม่ใช่การอนุมัติ production cutover หรือ full database migration โดยอัตโนมัติ*
