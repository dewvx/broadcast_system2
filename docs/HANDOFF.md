# Project Handoff v2 — ระบบหอกระจายข่าวชุมชนผ่าน LINE OA

อัปเดตล่าสุด: หลังจบ Final Review Audit + เตรียมนำเสนออาจารย์ที่ปรึกษา

ใช้ไฟล์นี้เป็น prompt แรกตอนเปิดแชทใหม่ (ไม่ว่ากับ Claude หรือ AI ตัวอื่น)

---

## Prompt สำหรับเริ่มต้น (copy วางเป็นข้อความแรก)

```
นี่คือโปรเจกต์ "ระบบหอกระจายข่าวชุมชนผ่าน LINE OA" กำลังพัฒนาต่อ
กรุณาอ่านไฟล์เหล่านี้ตามลำดับก่อนเริ่มงานใดๆ:
1. CLAUDE.md (root) - ภาพรวม tech stack, convention, architecture
2. docs/FEATURES.md - checklist ฟีเจอร์ทั้งหมด
3. docs/DATABASE.md - schema ล่าสุด (มี 15+ ตาราง)
4. docs/ROLES.md - permission matrix
5. docs/LINE_INTEGRATION.md - LINE setup + known issues
6. docs/HANDOFF.md (ไฟล์นี้) - สถานะล่าสุดและ context ที่ AI ตัวก่อนอาจไม่รู้

สถานะ: Backend + Frontend เสร็จสมบูรณ์ครบทุกโมดูล ผ่าน Final Review Audit แล้ว
กำลังจะ/เพิ่งนำเสนออาจารย์ที่ปรึกษา ต่อไปคือแก้เอกสารวิชาการ (UML diagrams) ให้ตรงกับระบบจริง

งานต่อไปที่อยากให้ช่วย: [ใส่ตรงนี้]
```

---

## สถานะระบบ ณ ตอนนี้ — ครบสมบูรณ์ทุกโมดูล

### Backend (100%)
Auth (JWT + Password Reset ผ่าน LINE OTP), News (CRUD + Approval + Soft Delete + Upload + View tracking), Category, Activity, Document, Villager (CRUD + Soft Delete + Zone + Registration OTP ผ่าน LINE), Zone/ซอย (CRUD), Broadcast (Flex Message + เลือกซอย + ตั้งเวลาล่วงหน้าด้วย node-cron), Chatbot (bidirectional keyword matching + chat log), Report/Dashboard, User Management (พร้อม FK-safe delete)

### Frontend (100%)
Admin Dashboard ครบทุกหน้า (Login, Dashboard, News, Category, Activity, Document, Zone, Villager, Chatbot FAQ, User) / LIFF ฝั่งลูกบ้าน 5 เมนู (Home, News, Activities, Documents, Profile) พร้อม Rich Menu

### Security (Audit ผ่านครบ)
bcrypt, JWT, LINE ID Token Verification, Parameterized Query, Role-based Access Control 2 ชั้น, Rate Limiting ครบทุกจุดเสี่ยง (login, forgot-password, reset-password, villager OTP ทั้งระดับ IP และบัญชี), PDPA Consent, Soft Delete แทน Hard Delete ในจุดที่มี FK เสี่ยง (tb_news, tb_villager) + guard เช็คก่อนลบใน tb_user

---

## Pattern สำคัญที่ต้องรู้ก่อนแก้โค้ดต่อ (กันพังซ้ำ)

### 1. Foreign Key + Delete — ต้องเช็คทุกครั้งก่อนเพิ่มฟีเจอร์ลบข้อมูล
เจอปัญหานี้มาแล้ว 3 รอบ (tb_news, tb_villager, tb_user) ก่อนเพิ่มปุ่ม "ลบ" ให้ entity ใหม่ ต้องเช็คก่อนเสมอว่ามีตารางอื่นอ้างอิงกลับมาด้วย foreign key หรือไม่
- ถ้ามีข้อมูลสถิติ/log ผูกอยู่ (เช่นมีคนดู, มีคนตั้งเวลาส่งถึง) → ใช้ Soft Delete (`is_deleted` column)
- ถ้าไม่มีสถิติผูกโดยตรงแต่มี FK จากตารางอื่น (เช่น user เป็นคนสร้างข่าว) → เช็คนับจำนวนก่อนอนุญาตให้ลบ (pattern จาก `category.model.js -> countNewsUsingCategory`)

### 2. Soft Delete ต้องกรอง `is_deleted = 0` ทุก query — จุดที่เคยพลาด
เคยมีบั๊กที่ `report.model.js` ลืมกรอง ทำให้ Dashboard นับข่าวที่ถูกลบไปแล้วรวมด้วย ทุกครั้งที่เพิ่ม query ใหม่ที่ดึงจาก `tb_news`/`tb_villager` ต้องเช็คว่ามี `WHERE is_deleted = 0` หรือยัง

### 3. Multi-AI Workflow — ไฟล์ pointer มีครบแล้ว
`CLAUDE.md` เป็นแหล่งความจริงเดียว, `GEMINI.md`/`AGENTS.md` เป็น pointer กลับมาที่นี่ ถ้าเปลี่ยนไปใช้ AI tool ใหม่ (เช่น OX Alpha) ที่มองหาไฟล์ชื่ออื่น ให้สร้าง pointer file ใหม่ชื่อให้ตรงกับ convention ของ tool นั้น เนื้อหาแค่ชี้กลับมา `CLAUDE.md`

### 4. Prompt files ที่เคยใช้ - เก็บไว้ใน docs/ ทั้งหมด
`PROMPT_PDPA_FEATURE.md`, `PROMPT_CHAT_LOG_FEATURE.md`, `PROMPT_ZONE_AND_CONTACT_FEATURE.md`, `PROMPT_VILLAGER_OTP_FEATURE.md`, `PROMPT_FINAL_REVIEW.md` — เก็บไว้เป็นตัวอย่าง prompt pattern ที่ใช้ได้ผลดี ถ้าต้องเขียน prompt ใหม่สำหรับฟีเจอร์ใหม่ ใช้โครงเดียวกันได้ (บอก context → เป้าหมาย → database changes → backend changes → frontend changes → เงื่อนไขสำคัญ → ทดสอบ)

### 5. LINE OTP ไม่ใช่ SMS OTP (เคย confuse กันมาแล้วรอบนึง)
ทั้งระบบกู้คืนรหัสผ่าน Admin และระบบยืนยันตอนลงทะเบียนลูกบ้าน ส่ง OTP ผ่าน LINE Push Message ทั้งคู่ ไม่มี SMS Gateway ในระบบเลย ถ้า AI ตัวไหนพูดถึง "SMS" ในบริบทนี้ ให้เช็คโค้ดจริงก่อนเชื่อ (เคยมี audit รายงานผิดมาแล้ว)

---

## ข้อจำกัดที่รู้ตัวอยู่แล้ว (ตอบกรรมการ/คนอื่นได้ตรงๆ ถ้าถาม)

- ยังไม่ deploy จริง (ใช้ ngrok ทดสอบ) - URL เปลี่ยนทุกครั้งที่ restart ต้องอัปเดต 3 จุด (PUBLIC_APP_URL, LIFF Endpoint, Webhook URL)
- ไม่มี automated database backup
- `tb_view_log`/`tb_chat_log` โตไม่มีขีดจำกัด ยังไม่มี archive job
- ระบบออกแบบสำหรับ 1 หมู่บ้านต่อ 1 ชุดระบบเท่านั้น ไม่รองรับ multi-tenancy หลายหมู่บ้านในระบบเดียว
- Document (เอกสารราชการ) ลบ record แล้วไฟล์จริงยังค้างใน disk (ตั้งใจไว้แบบนี้ กันเผลอลบไฟล์ผิด)

---

## งานที่กำลังจะทำต่อ

กลับไปแก้เอกสารวิชาการให้ตรงกับระบบจริงที่พัฒนาไปไกลกว่าตอนออกแบบแรกมาก:
- Use Case Diagram
- Activity Diagram
- Sequence Diagram
- Data Dictionary (ต้องอัปเดตตาราง: เพิ่ม `tb_zone`, `tb_villager_otp`, `tb_chat_log`, `tb_scheduled_broadcast`, columns ใหม่ๆ เช่น `is_deleted`, `is_active`, `pdpa_consent_at`, `phone_number`, `position_title`)
- Class Diagram

จุดที่เปลี่ยนไปมากจากดีไซน์ตั้งต้น ควรเน้นตอนอัปเดต diagram: workflow OTP (ทั้ง password reset และ villager registration), Soft Delete pattern, Zone/ซอย แทนหมู่, ระบบ Chatbot + Chat log, Scheduled Broadcast