# 📢 Project Context & Handover Summary: ระบบหอกระจายข่าวชุมชนผ่าน LINE OA

โปรเจกต์นี้คือ **ระบบหอกระจายข่าวและประกาศชุมชนผ่าน LINE Official Account (LINE OA)**
ประกอบด้วย 2 ส่วนหลัก:
1. **Admin Dashboard (สำหรับผู้ใหญ่บ้าน / ผู้นำชุมชน)**: จัดการข่าวสาร, กิจกรรม, เอกสารดาวน์โหลด, สถิติยอดอ่าน, และส่งข่าว Flex Message ผ่าน LINE
2. **Villager Interface (สำหรับลูกบ้านผ่าน LINE LIFF)**: ระบบ Web App บนมือถือ 5 เมนูหลัก ให้ลูกบ้านอ่านข่าว, ดูปฏิทินกิจกรรม, ดาวน์โหลดแบบฟอร์ม และติดต่อผู้นำชุมชน

---

## 🛠️ Tech Stack & Architecture
- **Backend**: Node.js + Express.js (MVC Architecture: routes -> controllers -> services -> models)
- **Database**: MySQL (10 ตารางตาม Data Dictionary)
- **Frontend**: Vite + React + Tailwind CSS (ตาม docs/DESIGN_SYSTEM.md และ docs/UI_DESIGN.md)
- **LINE Integration**: LINE Messaging API (Flex Messages) + LINE LIFF (LINE Login & Registration)

---

## 📋 สรุปฟีเจอร์และงานที่พัฒนาเสร็จเรียบร้อยแล้ว (Completed Work)

### 1. ระบบยืนยันตัวตน & ลงทะเบียนลูกบ้าน (Authentication & Registration Guard)
- **Admin**: ล็อกอินด้วย JWT Token + bcrypt password hash
- **Villager (LIFF)**: ยืนยันตัวตนผ่าน LINE ID Token (`checkOrLogin`)
- **Villager Registration Guard**: 
  - เมื่อผู้ใช้ใหม่ยังไม่เคยลงทะเบียนเปิดเข้ามาในระบบ (ผ่านลิงก์ หรือ Flex Message) ระบบจะ **บังคับรีไดเรกต์ไปหน้าลงทะเบียน (`/liff/register`) ทันที**
  - กำหนดให้กรอก: ชื่อจริง, นามสกุล, บ้านเลขที่, และ **หมู่บ้าน/โซน (ใส่เฉพาะตัวเลขหมู่ เช่น 4 ระบบจะออโต้แปลงเป็น "หมู่ 4")**
  - เมื่อลงทะเบียนเสร็จ ระบบจะวาร์ปพาลูกบ้านไปอ่านข่าวสารเป้าหมายที่กดดูจากการ์ด Flex Message ให้โดยอัตโนมัติ

### 2. ระบบจัดการข่าวสารและการนับสถิติ Real-time (News & Tracking)
- **Admin**: สร้าง, แก้ไข, อัปโหลดรูปปก (16:9), ลบ, และกดอนุมัติ (Approve) ข่าวสาร
- **Villager**: อ่านรายละเอียดข่าวสาร ([NewsDetailPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/liff/NewsDetailPage.jsx)) และเรียกดูรายการข่าวทั้งหมด ([NewsListPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/liff/NewsListPage.jsx))
- **Real-time View Count**: บันทึกสถิติการเปิดอ่านลง `tb_view_log` และคำนวณ `view_count` แสดงผลสถิติการอ่านตรงกันอย่างถูกต้องทั้งฝั่งลูกบ้านและ Admin
- **Dynamic Category Chips**: หน้าข่าวสารมีแถบชิปสไลด์แนวนอนใต้ช่องค้นหา ดึงหมวดหมู่จากตาราง `tb_category` แบบ Dynamic (`ข่าวทั้งหมด`, `🔥 ข่าวยอดนิยม`, `ข่าวประชาสัมพันธ์`, ฯลฯ)

### 3. ระบบส่งข่าวสารเจาะจงโซน (Zone Broadcast via Flex Message)
- สร้าง Flex Message แบบ Bubble การ์ดสวยงาม ปรับใช้ Official LIFF URI: `https://liff.line.me/${LIFF_ID}/news/${news_id}`
- **Zone Filtering**: มี Dropdown เลือกโซนส่งข่าวแบบช่องเดียว ดึงเฉพาะรายชื่อโซนที่มีลูกบ้านลงทะเบียนจริงใน DB (`getZones()`) หรือส่งหาลูกบ้านทั้งหมด

### 4. ระบบกิจกรรมชุมชน (Activities & Activity Detail)
- **Database Schema**: ตาราง `tb_activity` รองรับคอลัมน์ `act_content TEXT NULL` สำหรับบันทึกรายละเอียดกิจกรรมเพิ่มเติม
- **Admin**: สร้าง/แก้ไข/ลบ กิจกรรม พร้อมช่องกรอก `act_content`
- **Villager**: ปฏิทินกิจกรรม ([ActivityListPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/liff/ActivityListPage.jsx)) + หน้ารายละเอียดกิจกรรมเต็ม ([ActivityDetailPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/liff/ActivityDetailPage.jsx)) แสดงวันเวลา สถานที่ ผู้จัดงาน เนื้อหากิจกรรม และปุ่มแชร์

### 5. โครงสร้าง 5 เมนูหลักฝั่งลูกบ้าน (Bottom Navigation Bar)
1. 🏠 **หน้าหลัก (Home)** (`/liff/home`): สรุป Banner ประกาศล่าสุด + กิจกรรมเร็วๆ นี้ + เอกสารดาวน์โหลดด่วน
2. 📰 **ข่าว (News)** (`/liff/news`): รายการข่าวสาร ประกาศด่วน ช่องค้นหา และชิปกรองหมวดหมู่
3. 📅 **กิจกรรม (Activities)** (`/liff/activities`): ปฏิทินกิจกรรมและหน้ารายละเอียดกิจกรรม
4. 🗂️ **เอกสาร (Documents)** (`/liff/documents`): คลังเอกสารราชการและแบบฟอร์มเปิดดาวน์โหลด
5. 👤 **ฉัน (Profile & Contact)** (`/liff/profile`): ข้อมูลบัญชีส่วนตัว + การ์ดเบอร์โทรศัพท์ผู้ใหญ่บ้าน, อสม. และเบอร์กู้ชีพฉุกเฉิน 1669

### 6. ระบบจัดการบัญชีผู้ใช้งานฝั่ง Admin (User Management & Profile GUI)
- **Admin User Management**: มีหน้าจัดการผู้ใช้งานระบบ ([UserPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/admin/UserPage.jsx)) เส้นทาง `/admin/users` สำหรับเพิ่ม แก้ไขสิทธิ์ เปลี่ยนรหัสผ่าน และลบบัญชีผู้ใหญ่บ้าน (Admin) หรือผู้นำชุมชน (Leader) ได้โดยตรงบน GUI (ไม่ต้องรัน cURL)
- **Backend API**: `/api/user` (CRUD User & Roles) สอดคล้องกับ `tb_user` และ `tb_role`

### 7. ระบบจัดการข้อมูลลูกบ้าน & สถานะการติดตาม (Villager Management & LINE Status)
- **Admin Villager Management**: หน้าจัดการลูกบ้าน ([VillagerPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/admin/VillagerPage.jsx)) รองรับการค้นหา, กรองตามโซน/สถานะ Active, แก้ไขข้อมูลลูกบ้านแทน (Modal) และลบลูกบ้านออกจากระบบ (Confirm Dialog)
- **Self-service Edit Profile**: ลูกบ้านสามารถแก้ไขข้อมูลส่วนตัวของตนเองได้โดยตรงผ่านหน้า [ProfilePage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/liff/ProfilePage.jsx)
- **LINE Webhook Active Tracking**: ดัก Event `unfollow` ปรับ `is_active = 0` และ Event `follow` ปรับ `is_active = 1` เพื่อให้ระบบ Broadcast กรองเฉพาะผู้ใช้งานที่ active เท่านั้น

### 8. ระบบความยินยอมคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent)
- **PDPA Policy & Consent Checkbox**: หน้ารงทะเบียนลูกบ้าน ([RegisterPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/liff/RegisterPage.jsx)) มีกล่องข้อความอธิบายวัตถุประสงค์การจัดเก็บข้อมูลส่วนบุคคล และ Checkbox บังคับยินยอมก่อนกดยืนยัน (ปุ่ม submit จะ disabled จนกว่าจะกดยินยอม)
- **Server-side Enforcement**: Backend ตรวจสอบ `pdpaConsent === true` เสมอ และบันทึกเวลาที่ยินยอมลงในคอลัมน์ `pdpa_consent_at` (TIMESTAMP) ในฐานข้อมูล `tb_villager` เพื่อการอ้างอิงย้อนหลัง

### 9. ระบบกู้คืนและรีเซ็ตรหัสผ่านผู้ดูแลระบบผ่าน LINE OA (Admin Password Reset via LINE OTP)
- **LINE Account Binding**: ในหน้าจัดการผู้ใช้งาน ([UserPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/admin/UserPage.jsx)) ผู้ใหญ่บ้านสามารถผูกบัญชี LINE Official Account กับบัญชี Admin/Leader ได้อย่างง่ายดายผ่าน Dropdown เลือกลูกบ้านที่ลงทะเบียนในระบบ (`tb_user.line_user_id`)
- **Forgot Password Flow**: หน้า [ForgotPasswordPage.jsx](file:///d:/broadcast_lineOA/frontend/src/pages/admin/ForgotPasswordPage.jsx) (`/admin/forgot-password`) ให้ Admin ระบุ Username เพื่อขอ **รหัส OTP 6 หลัก (อายุ 10 นาที)** ผ่าน LINE Messaging API Push Message
- **OTP Verification & Password Reset**: ยืนยันรหัส OTP และกำหนดรหัสผ่านใหม่ โดยระบบจะ Hash ด้วย `bcrypt` และส่ง Push Message ยืนยันความปลอดภัยกลับไปยัง LINE OA ทันที

---

## 📁 Key File Map (ไฟล์สำคัญของระบบ)

- **Documentation**:
  - `CLAUDE.md`: เอกสารหลักของโปรเจกต์
  - `docs/DATABASE.md`: Schema, Tables, Column references
  - `docs/FEATURES.md`: Checklist ฟีเจอร์ทั้งหมด
  - `docs/SETUP_LOG.md`: ประวัติการตั้งค่าและพัฒนา Phase 1-7
  - `docs/ProjectContext.md`: สรุปบริบทและงานที่ทำทั้งหมดสำหรับ Handover
- **Backend**:
  - `backend/src/routes/`: `auth.routes.js`, `villager.routes.js`, `news.routes.js`, `broadcast.routes.js`, `activity.routes.js`, `category.routes.js`, `user.routes.js`
  - `backend/src/services/`: `auth.service.js`, `broadcast.service.js`, `liffAuth.service.js`, `news.service.js`, `newsPublic.service.js`, `user.service.js`, `villager.service.js`
  - `backend/src/models/`: `user.model.js`, `passwordReset.model.js`, `news.model.js`, `broadcast.model.js`, `activity.model.js`, `villager.model.js`
- **Frontend**:
  - `frontend/src/components/layout/LiffLayout.jsx`: Bottom Nav 5 เมนู + Registration Guard + ล้าง `liff.state`
  - `frontend/src/pages/liff/`: `HomePage.jsx`, `NewsListPage.jsx`, `NewsDetailPage.jsx`, `ActivityListPage.jsx`, `ActivityDetailPage.jsx`, `ProfilePage.jsx`, `RegisterPage.jsx`
  - `frontend/src/pages/admin/`: `LoginPage.jsx`, `ForgotPasswordPage.jsx`, `NewsManagementPage.jsx`, `NewsFormPage.jsx`, `ActivityPage.jsx`, `DashboardPage.jsx`, `UserPage.jsx`, `VillagerPage.jsx`

---

## 📌 ขั้นตอนและคำสั่งสำหรับเริ่มรันพัฒนาต่อ
1. **DB Alter Table Commands** (รันใน MySQL/phpMyAdmin หากยังไม่มี):
   ```sql
   ALTER TABLE tb_activity ADD COLUMN act_content TEXT NULL AFTER act_title;
   ALTER TABLE tb_villager ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER zone_name;
   ALTER TABLE tb_villager ADD COLUMN pdpa_consent_at TIMESTAMP NULL AFTER zone_name;
   ALTER TABLE tb_user ADD COLUMN line_user_id VARCHAR(100) NULL AFTER full_name;
   CREATE TABLE IF NOT EXISTS tb_password_reset (
     reset_id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     reset_otp VARCHAR(6) NOT NULL,
     reset_token VARCHAR(64) NOT NULL,
     is_used TINYINT(1) DEFAULT 0,
     expires_at DATETIME NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES tb_user(user_id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
   ```
2. **Run Backend & Frontend**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
3. **ngrok Tunnel**: `ngrok http 3000` (อย่าลืมอัปเดต `PUBLIC_APP_URL` ใน `backend/.env` เมื่อเปิด ngrok ใหม่)