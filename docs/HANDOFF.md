# Project Handoff v3 — ระบบหอกระจายข่าวชุมชนผ่าน LINE OA

อัปเดตล่าสุด: หลังเพิ่มระบบปฏิทินกิจกรรม + ข่าวเชื่อมโยงกิจกรรม + ระบบแอดมินตอบกลับลูกบ้าน 1-on-1 ผ่าน LINE OA (เตรียมนำเสนออาจารย์และทำเล่มรายงาน)

ใช้ไฟล์นี้เป็น prompt แรกตอนเปิดแชทใหม่ (ไม่ว่ากับ Claude, Gemini CLI หรือ AI ตัวอื่น)

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
6. docs/HANDOFF.md (ไฟล์นี้) - สถานะล่าสุดและ context สำคัญ

สถานะ: Backend + Frontend เสร็จสมบูรณ์ครบทุกโมดูล ผ่านการทดสอบและ build ผ่าน 100%
ฟีเจอร์ล่าสุด: ปฏิทินกิจกรรม (Calendar + List view), ข่าวสารเชื่อมโยงกิจกรรม, แอดมินตอบกลับแชทลูกบ้าน 1-on-1 เข้า LINE ส่วนตัวผ่าน Web Dashboard
ต่อไปคือ: ทำเล่มรายงานวิชาการ + ปรับปรุง UML Diagrams และ Data Dictionary ให้ตรงกับระบบจริง

งานต่อไปที่อยากให้ช่วย: [ใส่ตรงนี้]
```

---

## สถานะระบบ ณ ตอนนี้ — ครบสมบูรณ์ทุกโมดูล (Production-Ready)

### Backend (100%)
- **Auth & Users:** JWT, Password Reset ผ่าน LINE OTP, User Management พร้อม FK-safe delete guard
- **News Management:** CRUD + Approval + Soft Delete + Multi-image Upload + Real-time View Tracking (`tb_view_log`) + **เชื่อมโยงกิจกรรมชุมชน (`act_id`)**
- **Categories & Zones:** Category CRUD (ตรวจนับข่าวก่อนลบ), Zone/ซอย CRUD พร้อมนับจำนวนลูกบ้านในแต่ละโซน
- **Community Activities:** CRUD กิจกรรมชุมชน, ระบบดึงเฉพาะกิจกรรมที่ยังไม่หมดอายุ (`act_date >= CURDATE()`) เพื่อแนบกับข่าว
- **Documents:** จัดการแบบฟอร์มและเอกสารราชการ (PDF/Doc) พร้อมนับยอดดาวน์โหลด
- **Villager System:** ลงทะเบียนผ่าน LINE LIFF พร้อม OTP ยืนยันผ่าน LINE Push Message, PDPA Consent, Profile Management, Soft Delete (`is_deleted`), Follow/Unfollow tracking (`is_active`)
- **Broadcast System:** ส่งข่าวสารแบบ LINE Flex Message ทันที หรือตั้งเวลาล่วงหน้าด้วย `node-cron`, เลือกกลุ่มเป้าหมาย (ทุกคน / แยกตามซอยหรือคุ้ม), ไฮไลต์กิจกรรมที่เชื่อมโยงใน Flex Message อัตโนมัติ
- **Chatbot & 1-on-1 Reply:** Keyword matching อัตโนมัติ, บันทึกประวัติการสอบถาม (`tb_chatbot_log`), **ระบบตอบกลับลูกบ้าน 1-on-1 ตรงเข้าห้องแชท LINE OA ผ่าน API (`POST /api/chatbot-faq/logs/:id/reply`)**
- **Reports & Dashboard:** สถิติภาพรวมข่าว, กิจกรรม, เอกสาร, ประวัติการส่ง, สถิติการเข้าอ่านข่าวแบบรายวัน/รายเดือน

### Frontend (100%)
- **Admin Dashboard:**
  - Login / Forgot Password (ยืนยัน OTP ผ่าน LINE)
  - Dashboard สรุปสถิติและกราฟ
  - News Management (ตารางข่าว, สถานะอนุมัติ, ตั้งเวลาส่ง, ตัวกรอง)
  - News Form (สร้าง/แก้ไขข่าว, อัปโหลดรูป, **Dropdown เลือกกิจกรรมที่เกี่ยวข้อง**)
  - Category Management & Zone Management
  - **Activity Page:** ปฏิทินกิจกรรมรายเดือน (Month Calendar Grid 7 วัน) สลับกับ มุมมองรายการ (List View เริ่มต้น), ปุ่มคัดลอก Deep Link LIFF กิจกรรม
  - Document Management
  - Villager Management (ตารางลูกบ้าน, จัดการโซน, กรอง Active/Inactive, ดูประวัติ)
  - Chatbot FAQ Management (จัดการคีย์เวิร์ดคำถาม-คำตอบ)
  - **Chatbot Log Page:** ดูประวัติการถาม-ตอบ, Stat Cards (ทั้งหมด, ตอบอัตโนมัติ, รอการตอบกลับ, ตอบแล้ว), **ปุ่มตอบกลับลูกบ้าน 1-on-1 ผ่าน LINE พร้อม Modal พิมพ์ข้อความ**
  - User Management (จัดการผู้ใช้งานระบบสำหรับ Admin)
- **Villager LIFF (Mobile-First):**
  - Home Page (ข่าวเด่น, ข่าวล่าสุด, แบนเนอร์)
  - News List & Category Filter
  - **News Detail Page:** เนื้อหาข่าว, แกลเลอรีรูปภาพ, **การ์ดกิจกรรมชุมชนที่เกี่ยวข้อง พร้อมปุ่มเปิดดูกิจกรรมในปฏิทิน**
  - Activity Page (ปฏิทินและรายการกิจกรรมชุมชน)
  - Document Page (รายการเอกสารและปุ่มดาวน์โหลด)
  - Profile Page (ดูและแก้ไขข้อมูลส่วนตัว)
  - Registration Guard & Flow (กรอกข้อมูล + ยืนยัน OTP 6 หลักผ่าน LINE)

### Security & Audits (100% Passed)
- bcrypt, JWT payload validation
- LINE ID Token Verification
- Parameterized Queries ทุกจุด (mysql2 promise pool)
- Two-tier RBAC (Route middleware + Controller/Service layer)
- Rate Limiting ครบทุกจุดเสี่ยง (Auth Login, Forgot Password, Villager OTP ทั้งระดับ IP และ LINE ID)
- PDPA Consent บันทึกวันเวลายินยอม

---

## Pattern สำคัญที่ต้องรู้ก่อนแก้โค้ดต่อ (กันพังซ้ำ)

### 1. การตอบกลับ 1-on-1 เข้า LINE จาก Web Dashboard
- แอดมินสามารถตอบกลับคำถามลูกบ้านที่บอทตอบไม่ตรง (Fallback) หรือตอบคำถามเพิ่มเติมได้โดยตรงจากหน้า `/admin/chatbot-logs`
- ทำงานผ่าน `lineClient.pushMessage({ to: log.line_user_id, messages: [...] })`
- ข้อความที่ส่งจะระบุข้อความอ้างอิงถึงคำถามเดิมของลูกบ้านอย่างสุภาพ
- มี Error Guard กรณีลูกบ้านบล็อกหรือยกเลิกติดตาม LINE OA
- บันทึก `admin_reply`, `replied_by` (Admin user ID), และ `replied_at` ลงตาราง `tb_chatbot_log`

### 2. การเชื่อมโยง ข่าวสาร <-> กิจกรรม (News Linked Activity)
- ตาราง `tb_news` มีคอลัมน์ `act_id` ชี้ไปยัง `tb_activity(act_id) ON DELETE SET NULL`
- ในหน้าฟอร์มสร้าง/แก้ไขข่าว Dropdown กิจกรรมจะกรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ (`act_date >= วันนี้`) เพื่อป้องกันการผูกกิจกรรมในอดีต
- เมื่อส่ง Broadcast ข่าวสาร Flex Message จะเพิ่มกล่องแจ้งเตือนกิจกรรมและวันจัดกิจกรรมให้อัตโนมัติ
- ในหน้าอ่านข่าว LIFF (`NewsDetailPage`) มีการ์ดแสดงรายละเอียดกิจกรรมพร้อมปุ่ม Deep Link เปิดดูในปฏิทินกิจกรรมได้ทันที

### 3. หน้าปฏิทินกิจกรรม (Activity Calendar View)
- หน้ากิจกรรมฝั่ง Admin มี 2 มุมมอง: มุมมองรายการ (List View — ค่าเริ่มต้น) และมุมมองตารางปฏิทินรายเดือน (Month Calendar View)
- ปุ่มคัดลอกลิงก์ (Copy Link) จะสร้าง URL ในรูปแบบ LIFF Deep Link สำหรับนำไปวางส่งต่อได้ทันที
- ปุ่มส่งกระจายข่าว (Broadcast) ถูกตัดออกจากหน้ากิจกรรมโดยตรง เพื่อรวมศูนย์การกระจายข่าวสารไว้ที่โมดูลข่าวสาร (`NewsManagementPage` และ `NewsFormPage`) เท่านั้น เพื่อลดความซ้ำซ้อนของ UI

### 4. Foreign Key + Delete — ต้องเช็คทุกครั้งก่อนเพิ่มฟีเจอร์ลบข้อมูล
- ถ้ามีข้อมูลสถิติ/log ผูกอยู่ (เช่นมีคนดู, มีคนตั้งเวลาส่งถึง) → ใช้ Soft Delete (`is_deleted` column)
- ถ้าไม่มีสถิติผูกโดยตรงแต่มี FK จากตารางอื่น (เช่น user เป็นคนสร้างข่าว, หรือ activity ผูกกับ news) → ใช้ `ON DELETE SET NULL` หรือเช็คนับจำนวนก่อนอนุญาตให้ลบ

### 5. Soft Delete ต้องกรอง `is_deleted = 0` ทุก query
ทุกครั้งที่เพิ่ม query ใหม่ที่ดึงจาก `tb_news` หรือ `tb_villager` ต้องเช็คว่ามี `WHERE is_deleted = 0` เสมอ

### 6. Multi-AI Workflow — ไฟล์ pointer มีครบแล้ว
`CLAUDE.md` เป็นแหล่งความจริงเดียว, `GEMINI.md`/`AGENTS.md` เป็น pointer กลับมาที่นี่

### 7. LINE OTP ไม่ใช่ SMS OTP
ทั้งระบบกู้คืนรหัสผ่าน Admin และระบบยืนยันตอนลงทะเบียนลูกบ้าน ส่ง OTP ผ่าน LINE Push Message ทั้งคู่ ไม่มี SMS Gateway ในระบบ

---

## ข้อจำกัดที่รู้ตัวอยู่แล้ว (สำหรับตอบอาจารย์ / กรรมการประเมิน)

1. **การ Deploy ทดสอบ:** ปัจจุบันรัน Local + ngrok สำหรับทดสอบ Webhook และ LIFF (URL เปลี่ยนทุกครั้งที่ restart ngrok ต้องอัปเดต 3 จุด: `PUBLIC_APP_URL`, `LIFF Endpoint`, `Webhook URL`)
2. **Database Backup:** ยังเป็น Manual Dump ผ่าน SQL Script
3. **Single Tenant Architecture:** ระบบถูกออกแบบสำหรับ 1 ชุมชน/หมู่บ้าน ต่อ 1 ระบบ (ไม่ได้เป็น Multi-tenant)
4. **Document File Storage:** เมื่อลบข้อมูลเอกสารในระบบ ไฟล์ PDF/Doc จริงจะยังคงเก็บไว้ในโฟลเดอร์ uploads (เพื่อความปลอดภัยกรณีต้องการกู้คืน)

---

## งานสำหรับทำเล่มรายงานวิชาการ (Thesis / Report Documentation)

ต้องอัปเดตเอกสารวิชาการให้สอดคล้องกับระบบจริงล่าสุด:
1. **Use Case Diagram:**
   - Admin: เพิ่ม use case "ตอบกลับข้อความลูกบ้าน 1-on-1 (Reply Inquiry Log)", "เชื่อมโยงกิจกรรมกับข่าวสาร", "จัดการปฏิทินกิจกรรม"
2. **Activity Diagram / Sequence Diagram:**
   - Sequence Diagram การตอบกลับลูกบ้าน 1-on-1 ผ่าน LINE Push Message
   - Sequence Diagram การกระจายข่าวพร้อมกิจกรรมที่เกี่ยวข้อง
   - Workflow การยืนยันตัวตนลูกบ้านด้วย LINE OTP และ PDPA Consent
3. **Data Dictionary / Database Schema:**
   - อัปเดตตาราง `tb_news`: เพิ่มคอลัมน์ `act_id INT NULL` (FK -> `tb_activity`)
   - อัปเดตตาราง `tb_chatbot_log`: เพิ่มคอลัมน์ `admin_reply TEXT NULL`, `replied_by INT NULL` (FK -> `tb_user`), `replied_at DATETIME NULL`
   - ตารางที่เพิ่มจากเวอร์ชันก่อนหน้า: `tb_zone`, `tb_villager_otp`, `tb_scheduled_broadcast`, `tb_view_log`
4. **Class Diagram:**
   - เพิ่ม Model/Service: `chatbotLog.model`, `zone.model`, `activity.model` และความสัมพันธ์ระหว่าง `News` กับ `Activity`