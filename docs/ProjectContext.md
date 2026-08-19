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

---

## 📁 Key File Map (ไฟล์สำคัญของระบบ)

- **Documentation**:
  - `CLAUDE.md`: เอกสารหลักของโปรเจกต์
  - `docs/DATABASE.md`: Schema, Tables, Column references
  - `docs/FEATURES.md`: Checklist ฟีเจอร์ทั้งหมด
  - `docs/SETUP_LOG.md`: ประวัติการตั้งค่าและพัฒนา Phase 1-7
  - `docs/ProjectContext.md`: สรุปบริบทและงานที่ทำทั้งหมดสำหรับ Handover
- **Backend**:
  - `backend/src/routes/`: `villager.routes.js`, `news.routes.js`, `broadcast.routes.js`, `activity.routes.js`, `category.routes.js`, `user.routes.js`
  - `backend/src/services/`: `broadcast.service.js`, `liffAuth.service.js`, `news.service.js`, `newsPublic.service.js`, `user.service.js`
  - `backend/src/models/`: `news.model.js`, `broadcast.model.js`, `activity.model.js`, `villager.model.js`, `user.model.js`
- **Frontend**:
  - `frontend/src/components/layout/LiffLayout.jsx`: Bottom Nav 5 เมนู + Registration Guard + ล้าง `liff.state`
  - `frontend/src/pages/liff/`: `HomePage.jsx`, `NewsListPage.jsx`, `NewsDetailPage.jsx`, `ActivityListPage.jsx`, `ActivityDetailPage.jsx`, `ProfilePage.jsx`, `RegisterPage.jsx`
  - `frontend/src/pages/admin/`: `NewsManagementPage.jsx`, `NewsFormPage.jsx`, `ActivityPage.jsx`, `DashboardPage.jsx`, `UserPage.jsx`

---

## 📌 ขั้นตอนและคำสั่งสำหรับเริ่มรันพัฒนาต่อ
1. **DB Alter Table Command** (รันใน MySQL/phpMyAdmin):
   ```sql
   ALTER TABLE tb_activity ADD COLUMN act_content TEXT NULL AFTER act_title;
   ```
2. **Run Backend & Frontend**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
3. **ngrok Tunnel**: `ngrok http 3000` (อย่าลืมอัปเดต `PUBLIC_APP_URL` ใน `backend/.env` เมื่อเปิด ngrok ใหม่)