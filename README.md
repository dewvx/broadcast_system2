# ระบบหอกระจายข่าวในชุมชนด้วย LINE Official Account

Web Application สำหรับบริหารจัดการข่าวสาร ประกาศ กิจกรรมชุมชน และแบบฟอร์มราชการ พร้อมกระจายข่าวไปยังลูกบ้านผ่าน LINE Official Account (Messaging API + LIFF)

> **ขอบเขตการใช้งาน (Single-Village Scope):** ระบบนี้ออกแบบมาสำหรับใช้งาน **1 หมู่บ้านต่อ 1 ชุดระบบ (1 database)** ไม่รองรับหลายหมู่บ้านพร้อมกันในระบบเดียว (multi-tenancy) หากหมู่บ้านมีหลายหมู่/โซนย่อย ให้แยก deploy คนละชุด คำว่า "ซอย/คุ้ม" (`tb_zone`) หมายถึงซอยหรือคุ้มย่อยภายในหมู่บ้านเดียวกันเพื่อจัดกลุ่มลูกบ้านและกระจายข่าวสารเจาะจงพื้นที่

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js (Controller → Service → Model architecture)
- **Database:** MySQL (จัดการ Connection Pool ด้วย `mysql2/promise`)
- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Framer Motion, Lucide Icons, Axios
- **LINE Integration:**
  - **LINE Messaging API:** ส่งข่าวสารแบบ Flex Message (Broadcast / กรองตามซอย/คุ้ม), Chatbot ตอบคำถามอัตโนมัติผ่าน Webhook, Push Message ส่งรหัส OTP
  - **LINE LIFF (LINE Frontend Framework):** สำหรับลูกบ้านเข้าใช้งานผ่านแอป LINE โดยตรง ไม่ต้องดาวน์โหลดแอปเพิ่ม ยืนยันตัวตนด้วย LINE ID Token (ไม่มี password)
- **Authentication:**
  - **Admin / Leader:** JWT (JSON Web Token) + `bcrypt` hash password + รีเซ็ตรหัสผ่านด้วย OTP ผ่าน LINE OA
  - **Villager (ลูกบ้าน):** LINE LIFF auto-verify + ยืนยัน OTP ผ่าน LINE ก่อนลงทะเบียนสำเร็จ

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
broadcast_lineOA/
├── backend/                  # Express RESTful API Server
│   ├── database/             # schema.sql, seed.sql
│   └── src/
│       ├── config/           # db.js, line.js
│       ├── controllers/      # Request/Response handlers
│       ├── middlewares/      # auth, role, liffAuth, upload
│       ├── models/           # MySQL Database queries
│       ├── routes/           # Express API endpoints
│       └── services/         # Core business logic & LINE integration
├── frontend/                 # Vite + React Client
│   └── src/
│       ├── api/              # Axios API client functions
│       ├── components/       # UI design tokens, layout, motion
│       ├── context/          # AuthContext, LiffContext
│       ├── pages/
│       │   ├── admin/        # Dashboard, News, Zones, Villagers, etc.
│       │   └── liff/         # Home, News, Activities, Documents, Profile, Register
│       └── router/           # React Router route definitions
└── docs/                     # เอกสารสถาปัตยกรรมและคู่มือการพัฒนา
    ├── CLAUDE.md             # Context หลักและกฎการพัฒนา
    ├── DATABASE.md           # Schema, Tables, Columns, Foreign Keys
    ├── DESIGN_SYSTEM.md      # UI Tokens, Typography Scale, Colors
    ├── UI_DESIGN.md          # UI/UX Specifications
    ├── FEATURES.md           # Checklist ฟีเจอร์ทั้งหมดของระบบ
    ├── ROLES.md              # Permission Matrix & Security notes
    └── LINE_INTEGRATION.md   # Messaging API, Webhook, Chatbot, LIFF
```

---

## ✅ ฟีเจอร์หลักของระบบ (Features)

### 1. ระบบจัดการข่าวสารและการกระจายข่าว (Broadcast & News)
- [x] เพิ่ม แก้ไข ลบ และแนบรูปภาพข่าวสาร (รองรับสถานะ: ร่าง / รออนุมัติ / อนุมัติ / เผยแพร่)
- [x] ระบบอนุมัติข่าวสารโดยผู้ใหญ่บ้าน (Admin Approval Flow)
- [x] กระจายข่าวสารไปยังลูกบ้านผ่าน LINE OA แบบ Flex Message (พร้อมรูปภาพและปุ่มเปิดอ่าน)
- [x] กรองกลุ่มเป้าหมายผู้รับข่าวสาร: ส่งทุกคน หรือส่งเจาะจงเฉพาะ **ซอย / คุ้ม**
- [x] ตั้งเวลาส่งข่าวล่วงหน้า (Scheduled Broadcast) ทำงานอัตโนมัติด้วย `node-cron`
- [x] จัดหมวดหมู่ข่าวสาร (Category Management)

### 2. ระบบยืนยันตัวตนและความปลอดภัย (Authentication & Security)
- [x] ระบบ Login สำหรับ Admin และ ผู้นำชุมชน (JWT + Role Middleware)
- [x] ผูกบัญชี LINE OA กับผู้ดูแลระบบ (`tb_user.line_user_id`)
- [x] ระบบกู้คืนรหัสผ่านผ่าน OTP 6 หลัก ส่งตรงเข้า LINE OA (จำกัดเวลา 10 นาที, Cooldown 60 วิ, ผิดครบ 5 ครั้งล็อค)
- [x] ระบบลงทะเบียนลูกบ้านผ่าน LINE LIFF ดึง LINE User ID อัตโนมัติ
- [x] **ระบบยืนยัน OTP ก่อนลงทะเบียนลูกบ้าน (Villager OTP):** ส่งรหัส OTP 6 หลักเข้า LINE ของลูกบ้านเพื่อยืนยันตัวตนแบบ Defense-in-depth ก่อนบันทึกข้อมูล
- [x] คุ้มครองข้อมูลส่วนบุคคล (PDPA Compliance): แสดงเงื่อนไขและบังคับยินยอมก่อนลงทะเบียน พร้อมบันทึก Server-side Timestamp

### 3. ระบบข้อมูลชุมชนและลูกบ้าน (Community & Villagers)
- [x] จัดการรายชื่อซอย/คุ้มในหมู่บ้าน (`/admin/zones`) บังคับเลือกระหว่างลงทะเบียน
- [x] จัดการข้อมูลลูกบ้าน ตรวจสอบสถานะ Active (ติดตาม LINE OA) / Inactive (บล็อก/เลิกติดตาม)
- [x] Soft Delete ลูกบ้าน เพื่อคงประวัติการเข้าชมข่าวสารในระบบ
- [x] ระบบการ์ดผู้ติดต่อผู้นำชุมชนแบบ Dynamic พร้อมปุ่มโทรออก และเบอร์กู้ชีพฉุกเฉิน 1669
- [x] ปฏิทินกิจกรรมชุมชน (Community Activities)
- [x] แบบฟอร์มราชการสำหรับดาวน์โหลด (Government Documents)

### 4. ระบบอัตโนมัติและสถิติ (Automation & Analytics)
- [x] แชทบอทตอบคำถามอัตโนมัติ (LINE Webhook Keyword Matching)
- [x] ประวัติการสอบถามแชทบอท (Chatbot Logs)
- [x] บันทึกประวัติการกระจายข่าวสาร (Broadcast Logs)
- [x] สถิติการเข้าชมข่าวสารแบบ Real-time (`tb_view_log`)
- [x] จัดการเหตุการณ์ Follow / Unfollow ผ่าน LINE Webhook แบบ Real-time

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้งและตั้งค่า Backend

```bash
cd backend
npm install

# คัดลอกไฟล์ Environment Variables
copy .env.example .env   # สำหรับ Windows (หรือ cp .env.example .env สำหรับ macOS/Linux)
```

กำหนดค่าในไฟล์ `backend/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=broadcast_lineoa
JWT_SECRET=your_jwt_secret_key

LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LIFF_CHANNEL_ID=your_line_login_channel_id
```

นำเข้าโครงสร้างฐานข้อมูลและข้อมูลเริ่มต้น:
```bash
mysql -u root -p broadcast_lineoa < database/schema.sql
mysql -u root -p broadcast_lineoa < database/seed.sql
```

สร้างบัญชีผู้ดูแลระบบ (Admin เริ่มต้น):
```bash
node scripts/createAdmin.js admin admin1234 "ผู้ใหญ่บ้าน (Admin)" 1
```

เริ่มรัน Backend Server:
```bash
node server.js
```

---

### 2. ติดตั้งและตั้งค่า Frontend

```bash
cd frontend
npm install

# คัดลอกไฟล์ Environment Variables
copy .env.example .env   # สำหรับ Windows (หรือ cp .env.example .env สำหรับ macOS/Linux)
```

กำหนดค่าในไฟล์ `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_LIFF_ID=your_liff_id
```

เริ่มรัน Frontend Dev Server:
```bash
npm run dev
```

---

## 📱 การตั้งค่า LINE Developers Console

1. **Messaging API Channel:**
   - คัดลอก **Channel Secret** และ **Channel Access Token** ใส่ใน `backend/.env`
   - ตั้งค่า **Webhook URL:** `https://<your-domain-or-ngrok>/webhook` และกดปุ่ม Verify
   - ปิด Auto-reply Messages และ Greeting Messages ใน LINE Official Account Manager
2. **LINE Login / LIFF Channel:**
   - สร้าง LIFF App กำหนด Endpoint URL ไปที่หน้าเว็บ LIFF (เช่น `https://<your-domain-or-ngrok>/liff`)
   - คัดลอก **LIFF ID** ใส่ใน `frontend/.env` (`VITE_LIFF_ID`)
   - นำ **Channel ID** ของ LINE Login ใส่ใน `backend/.env` (`LIFF_CHANNEL_ID`)
   - กำหนด Scopes: `profile`, `openid`

---

## 📚 เอกสารประกอบโปรเจกต์

รายละเอียดเชิงลึกสามารถศึกษาเพิ่มเติมได้จากเอกสารในโฟลเดอร์ `docs/`:
- [`CLAUDE.md`](./CLAUDE.md) — เอกสาร Context หลักและข้อตกลงการพัฒนา
- [`docs/DATABASE.md`](./docs/DATABASE.md) — พจนานุกรมข้อมูล Schema และ Foreign Keys
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) — มาตรฐานการออกแบบ UI/UX v2.0
- [`docs/FEATURES.md`](./docs/FEATURES.md) — เช็คลิสต์สถานะการพัฒนาแต่ละฟีเจอร์
- [`docs/ROLES.md`](./docs/ROLES.md) — เมทริกซ์สิทธิ์การใช้งาน (Admin, Leader, Villager)
- [`docs/LINE_INTEGRATION.md`](./docs/LINE_INTEGRATION.md) — คู่มือการเชื่อมต่อ LINE Messaging API & LIFF
