# Prompt: จัดทำ Use Case / Activity / Sequence / Data Dictionary / Class Diagram ให้ตรงกับระบบจริง

ใช้ prompt นี้กับ Gemini (หรือ AI ตัวอื่น) เพื่อสร้างเนื้อหาเอกสารวิชาการ 5 ส่วน ให้ตรงกับระบบที่พัฒนาเสร็จจริงแล้ว (ไม่ใช่ตามที่ออกแบบไว้ตอนแรกที่อาจไม่ตรงกันแล้ว)

---

## บริบทสำคัญ (ห้าม AI เดาข้อมูลเอง ต้องอิงจากที่ให้มานี้เท่านั้น)

โปรเจกต์นี้เคยมีปัญหา AI รายงานข้อมูลผิดพลาดจากการเดา (เช่น เคยมีรายงานว่าระบบส่ง OTP ผ่าน SMS ทั้งที่จริงส่งผ่าน LINE Push Message) **ดังนั้นในงานนี้ ห้ามสมมติ/เดาโครงสร้างข้อมูลหรือ business logic ใดๆ ที่ไม่ได้ระบุไว้ชัดเจนด้านล่าง หากไม่แน่ใจจุดไหน ให้ถามกลับมาก่อนแทนที่จะเดาแล้วเขียนลงเอกสาร**

### Schema ฐานข้อมูลจริง (ใช้เป็น ground truth เดียวสำหรับ Data Dictionary และ Class Diagram)

```sql
-- tb_role: role_id (PK), role_name, role_description
-- tb_user: user_id (PK), username, password (hashed), full_name, phone_number, position_title, line_user_id, role_id (FK -> tb_role)
-- tb_password_reset: reset_id (PK), user_id (FK -> tb_user, CASCADE), reset_otp, reset_token, attempts_count, is_used, expires_at, created_at
-- tb_zone: zone_id (PK), zone_name (UNIQUE), created_at
-- tb_villager: villager_id (PK), line_user_id (UNIQUE), display_name, first_name, last_name, house_number, zone_name, pdpa_consent_at, is_active, is_deleted, join_date
-- tb_villager_otp: otp_id (PK), line_user_id, otp_code, attempts_count, is_used, expires_at, created_at
-- tb_category: category_id (PK), category_name, created_at
-- tb_activity: act_id (PK), act_title, act_content, act_date, act_location, created_by (FK -> tb_user)
-- tb_news: news_id (PK), news_title, news_content, category_id (FK -> tb_category), act_id (FK -> tb_activity, nullable, SET NULL), news_image, news_status (ENUM: Pending/Approved/Rejected), created_by (FK -> tb_user), approved_by (FK -> tb_user, nullable), created_at, is_deleted
-- tb_document: doc_id (PK), doc_name, doc_file_path, upload_date, created_by (FK -> tb_user)
-- tb_chatbot_faq: faq_id (PK), question_key, answer_text, created_by (FK -> tb_user)
-- tb_broadcast_log: log_id (PK), news_id (FK -> tb_news), sent_by (FK -> tb_user), total_received, sent_at
-- tb_scheduled_broadcast: schedule_id (PK), news_id (FK -> tb_news), sent_by (FK -> tb_user), zone_name (nullable = ทุกซอย), scheduled_at, status (ENUM: Pending/Sending/Sent/Failed/Cancelled), error_message, created_at, updated_at
-- tb_view_log: view_id (PK), news_id (FK -> tb_news), villager_id (FK -> tb_villager), view_timestamp
-- tb_chatbot_log: log_id (PK), line_user_id, message_text, response_text, is_matched, admin_reply, replied_by (FK -> tb_user, nullable), replied_at, created_at
```

### Actor / ผู้ใช้งานในระบบ (สำหรับ Use Case Diagram)

1. **ผู้ใหญ่บ้าน (Admin)** — สิทธิ์สูงสุด: อนุมัติ/ปฏิเสธข่าว, ลบข้อมูลทุกประเภท, จัดการผู้ใช้งาน, ตั้งเวลาส่งข่าว, จัดการซอย/คุ้ม, จัดการ FAQ แชทบอท, ตอบกลับลูกบ้าน 1-on-1
2. **ผู้นำชุมชน (Leader)** — สร้าง/แก้ไขข่าว (ต้องรออนุมัติ), สร้างกิจกรรม/เอกสาร, ส่งแจ้งเตือนกิจกรรม, ดูรายงานสถิติ (read-only), แก้ไขบัญชีตัวเอง
3. **ลูกบ้าน (Villager)** — ลงทะเบียนผ่าน LIFF พร้อม OTP, ดูข่าว/กิจกรรม/เอกสาร, แก้ไขข้อมูลตัวเอง, คุยกับแชทบอท
4. **LINE Platform** — external actor: ส่ง webhook event (message, follow, unfollow) เข้าระบบ, รับคำสั่งส่ง Flex Message/OTP ออกจากระบบ

### Use Case หลักที่ต้องมีในแผนภาพ (แยกตาม Actor)

**Admin:**
- เข้าสู่ระบบ / กู้คืนรหัสผ่านผ่าน LINE OTP
- จัดการข่าวสาร (CRUD) / อนุมัติ-ปฏิเสธข่าว / อัปโหลดรูปข่าว / เชื่อมโยงกิจกรรมกับข่าว
- ส่งข่าวผ่าน LINE (ทันที) / ตั้งเวลาส่งข่าวล่วงหน้า / ยกเลิกคิวส่งข่าว
- จัดการหมวดหมู่ข่าว / จัดการซอย-คุ้ม / จัดการกิจกรรม / จัดการเอกสารราชการ
- จัดการข้อมูลลูกบ้าน (ดู/แก้ไข/ลบ) / จัดการบัญชีผู้ใช้งาน
- จัดการ FAQ แชทบอท / ดูประวัติการสนทนา / ตอบกลับลูกบ้าน 1-on-1
- ดูแดชบอร์ดและรายงานสถิติ

**Leader:** (เหมือน Admin บางส่วน แต่ไม่มีสิทธิ์อนุมัติ/ลบ/ตั้งเวลา/จัดการผู้ใช้)
- เข้าสู่ระบบ / สร้าง-แก้ไขข่าว (เฉพาะของตัวเองที่ยังไม่อนุมัติ) / สร้างกิจกรรม-เอกสาร / ส่งแจ้งเตือนกิจกรรม / ดูรายงาน (read-only) / แก้ไขบัญชีตัวเอง

**Villager (ผ่าน LIFF):**
- ลงทะเบียน (กรอกข้อมูล → ยินยอม PDPA → ขอ OTP → ยืนยัน OTP)
- ดูข่าวสาร (รายการ/รายละเอียด) / ดูกิจกรรม (ปฏิทิน/รายละเอียด) / ดูเอกสารราชการ
- แก้ไขข้อมูลส่วนตัว / ดูการ์ดผู้ติดต่อผู้นำชุมชน
- พิมพ์คุยกับแชทบอท

**LINE Platform (external):**
- ส่ง Webhook Event (message, follow, unfollow) / รับคำสั่งส่ง Push Message (OTP) และ Flex Message (Broadcast)

---

## งานที่ต้องการให้ AI ทำ — 5 ส่วน

สำหรับทุกส่วน ให้ผลลัพธ์ 2 อย่างคู่กันเสมอ:
1. **โค้ด PlantUML** ของแผนภาพ (ใช้ render ผ่าน https://www.plantuml.com/plantuml หรือ VS Code extension ได้ทันที)
2. **ย่อหน้าอธิบายภาษาไทยทางการ** สำหรับใส่ในเล่มเอกสาร บรรยายว่าแผนภาพนี้แสดงอะไร ทำงานอย่างไร (สไตล์เดียวกับที่ใช้ในเล่มคู่มือการใช้งาน คือกระชับ เป็นทางการ ไม่มี emoji)

### ส่วนที่ 1: Data Dictionary
ทำตารางแยกทีละตาราง (14 ตารางตาม schema ด้านบน) แต่ละตารางมีคอลัมน์: ชื่อฟิลด์ / ประเภทข้อมูล / คำอธิบาย / หมายเหตุ (PK/FK/Nullable/Default) เขียนคำอธิบายให้เข้าใจง่ายเป็นภาษาไทย ไม่ใช่แค่แปลชื่อ column ตรงๆ

### ส่วนที่ 2: Use Case Diagram
ใช้ actor และ use case ตามที่ระบุไว้ด้านบน วาดเป็น PlantUML use case diagram แยก package/boundary ตามฝั่ง (ฝั่งเว็บ Admin/Leader และฝั่ง LIFF ลูกบ้าน) ใช้ `<<include>>` สำหรับ use case ที่ต้อง "เข้าสู่ระบบ" ก่อนเสมอ และ `<<extend>>` สำหรับ use case เสริม (เช่น "อัปโหลดรูปข่าว" extend จาก "สร้างข่าว")

### ส่วนที่ 3: Activity Diagram (ทำ 3 diagram แยกกัน)
1. **Activity: สร้าง-อนุมัติ-ส่งข่าว** ตั้งแต่ Leader สร้างข่าว → Admin ตรวจสอบ → อนุมัติหรือปฏิเสธ → (ถ้าอนุมัติ) เลือกส่งทันทีหรือตั้งเวลา → ระบบส่ง Flex Message ผ่าน LINE
2. **Activity: ลงทะเบียนลูกบ้านผ่าน LIFF** ตั้งแต่เปิด LIFF → กรอกข้อมูล → ยินยอม PDPA → กดขอ OTP → ระบบส่ง OTP ผ่าน LINE Push Message → กรอก OTP → ตรวจสอบถูก/ผิด (แสดง branch กรณีผิดครบ 5 ครั้งด้วย) → บันทึกข้อมูลสำเร็จ
3. **Activity: ตั้งเวลาส่งข่าวล่วงหน้าและ Recovery** ตั้งแต่ Admin ตั้งเวลา → บันทึกสถานะ Pending → cron job ทำงานทุก 1 นาทีตรวจสอบคิวที่ถึงเวลา → ส่งข่าว → อัปเดตสถานะ Sent/Failed — พร้อม branch แสดงกรณีเซิร์ฟเวอร์รีสตาร์ท ระบบต้องดึงคิวที่ overdue มาประมวลผลทันทีตอนเริ่มทำงาน

### ส่วนที่ 4: Sequence Diagram (ทำ 4 diagram แยกกัน)
1. **Sequence: Admin เข้าสู่ระบบ** (Admin → Frontend → Backend API → Database → ตอบกลับ JWT)
2. **Sequence: ลูกบ้านลงทะเบียนพร้อมยืนยัน OTP** (Villager → LIFF → Backend → LINE API (verify idToken) → Database → LINE API (ส่ง Push Message OTP) → Villager กรอก OTP → Backend ตรวจสอบ → Database บันทึก)
3. **Sequence: Admin ส่งข่าวผ่าน LINE (Broadcast)** (Admin → Frontend → Backend → Database (ดึงรายชื่อลูกบ้านตามซอย) → LINE Messaging API (Flex Message) → Database (บันทึก broadcast log)
4. **Sequence: แชทบอทตอบคำถามอัตโนมัติ** (Villager พิมพ์ข้อความ → LINE Platform → Webhook → Backend → Database (ค้นหา keyword match) → ตอบกลับผ่าน LINE → Database (บันทึก chatbot log)

### ส่วนที่ 5: Class Diagram
สร้าง Class Diagram จากตารางฐานข้อมูลทั้ง 14 ตาราง โดยแสดง attribute หลักของแต่ละคลาส และเส้นความสัมพันธ์ (association) พร้อม multiplicity (1, 1..*, 0..1 ฯลฯ) ตาม foreign key ที่ระบุไว้ในบริบทด้านบน จัดกลุ่มคลาสที่เกี่ยวข้องกันให้อยู่ใกล้กัน (เช่น กลุ่มผู้ใช้งาน, กลุ่มข่าวสาร, กลุ่มลูกบ้าน, กลุ่ม log/สถิติ)

---

## รูปแบบการตอบ

ตอบทีละส่วนตามลำดับ 1-5 ห้ามรวบตอบทุกอย่างพร้อมกันในข้อความเดียว (จะยาวเกินไปและตรวจสอบยาก) ให้ตอบส่วนที่ 1 ก่อน แล้วรอให้ผู้ใช้ยืนยันว่าถูกต้องก่อนไปส่วนถัดไป

พร้อมแล้วให้เริ่มจากส่วนที่ 1: Data Dictionary ได้เลยครับ