# Features Checklist

อัปเดตสถานะ `[ ]` -> `[x]` เมื่อทำเสร็จ เพื่อให้ AI/ทีมรู้ progress ปัจจุบัน

## 3.1 ระบบยืนยันตัวตน (Login - Logout)
- [x] Login สำหรับ Admin + Leader (JWT, bcrypt)
- [x] เช็ค session ปัจจุบัน (/me)
- [x] จัดการบัญชีผู้ใช้งาน (Admin เท่านั้น) (หน้า UserPage `/admin/users`)
- [x] แก้ไข username/password/ชื่อจริง ของตนเองผ่าน GUI (ไม่ต้องรัน cURL)
- [x] ผูกบัญชี LINE Official Account กับผู้ใช้งานระบบ Admin/Leader (`tb_user.line_user_id`)
- [x] ระบบกู้คืน/รีเซ็ตรหัสผ่านผ่าน LINE OA OTP 6 หลัก (`/admin/forgot-password`)
- [x] LINE LIFF auto-register/verify (ลูกบ้าน, ดึง LINE User ID อัตโนมัติ)

## 3.2 ระบบจัดการข่าวสารและประกาศหมู่บ้าน
- [x] เพิ่มข่าว (Admin, Leader เสนอ/ร่าง) — มี UI แล้ว (NewsFormPage)
- [x] แก้ไขข่าว — มี UI แล้ว (หน้าเดียวกับสร้าง)
- [x] ลบข่าว — Backend พร้อม (เช็คว่า UI มีปุ่มลบด้วยมั้ย)
- [x] แนบไฟล์/รูปภาพประกอบข่าว — Backend พร้อม (เช็คว่า NewsFormPage มีช่องอัปโหลดรูปมั้ย)
- [x] สถานะข่าว: ร่าง / รออนุมัติ / อนุมัติ / เผยแพร่แล้ว
- [x] แสดงรายการข่าวสารย้อนหลังฝั่งลูกบ้าน (LIFF `/liff/news`)

## 3.3 ระบบอนุมัติข่าวก่อนเผยแพร่
- [x] ตรวจสอบข่าวก่อนส่ง (GET /api/news/:id)
- [x] อนุมัติข่าว (Admin)
- [x] ยกเลิกการเผยแพร่ข่าว (Admin) — ใช้ reject endpoint

## 3.4 ระบบจัดหมวดหมู่ข่าวสาร
- [x] เพิ่ม/แก้ไข/ลบ หมวดหมู่ (Admin)
- [x] กำหนดหมวดหมู่ให้ข่าวแต่ละรายการ


## 3.5 ระบบปฏิทินกิจกรรมของชุมชน
- [x] เพิ่ม/แก้ไขกิจกรรม (Admin, Leader) + เพิ่มรายละเอียด act_content
- [x] แสดงกิจกรรมผ่าน LINE OA ให้ลูกบ้านดู (LIFF `/liff/activities`)
- [x] ดูรายละเอียดกิจกรรมเต็มฝั่งลูกบ้าน (LIFF `/liff/activities/:id`)


## 3.6 ระบบดาวน์โหลดแบบฟอร์มราชการ
- [x] อัปโหลด/ลบไฟล์ฟอร์ม (Admin, Leader อัปโหลด / Admin ลบ)
- [x] ดาวน์โหลดฟอร์มผ่าน LINE OA (ลูกบ้าน) (LIFF `/liff/documents`)


## 3.7 ระบบส่งข่าวผ่าน LINE Official Account
- [x] เลือกกลุ่มผู้รับข่าว (filter ตาม zone_name)
- [x] ส่งข่าวแบบลิงก์/รูปภาพผ่าน LINE Messaging API (Flex Message พร้อมรูป+ปุ่มลิงก์ official LIFF URI)
- [x] ตั้งเวลาส่งข่าวล่วงหน้า (`node-cron` เช็ค `tb_scheduled_broadcast` ทุกนาที + UI ตั้งเวลา/ยกเลิกใน NewsManagementPage)

## 3.8 ระบบแชทบอทตอบคำถามอัตโนมัติ
- [x] ตอบคำถามพื้นฐานอัตโนมัติ (keyword match กับ tb_chatbot_faq ผ่าน LINE Webhook)
- [x] จัดการคำถาม-คำตอบแชทบอทอัตโนมัติ (Admin Dashboard)
- [x] ส่งลิงก์ข่าว/ฟอร์มที่เกี่ยวข้อง (deep link รูปแบบ `https://liff.line.me/<LIFF_ID>/news/:id` เหมือน broadcast — ห้ามใส่ `/liff` ซ้ำเพราะ LIFF จะเปิดไม่ถึงหน้าข่าว)
- [x] บันทึกประวัติการสอบถาม
- [x] fallback "ไม่พบข้อมูล" (ยังไม่มีแจ้งเตือน Admin ให้ตอบ 1-on-1)

## 3.9 ระบบบันทึกประวัติการส่งข่าว (Broadcast Log)
- [x] บันทึกวันที่/เวลา/ผู้ส่ง/จำนวนผู้รับ
- [x] กรองเฉพาะลูกบ้าน is_active = 1 ตอนส่ง broadcast (ตัดคนที่ unfollow/บล็อก OA ออกอัตโนมัติ)

## 3.10 ระบบรายงานและสถิติการเข้าถึงข้อมูล
- [x] จำนวนข่าวที่เผยแพร่
- [x] สถิติการเข้าถึงข่าว (Tracking Views ผ่าน tb_view_log Real-time)
- [x] รายงานสรุปย้อนหลัง (broadcast history)

## 3.11 ระบบจัดการข้อมูลลูกบ้าน (Villager Management)
- [x] ลูกบ้านลงทะเบียนครั้งแรกผ่าน LINE LIFF (Registration Guard)
- [x] ลูกบ้านแก้ไขข้อมูลตัวเองได้ผ่านหน้า ProfilePage (`POST /api/villager/update-profile` ต้อง verify idToken)
- [x] Admin แก้ไขข้อมูลลูกบ้านแทนได้ผ่านหน้า VillagerPage Modal (`PUT /api/villager/:id`)
- [x] Admin ลบลูกบ้านออกจากระบบได้ (`DELETE /api/villager/:id`) — ลูกบ้านต้องลงทะเบียนใหม่
- [x] แสดงสถานะ Active/Inactive บนตาราง VillagerPage พร้อม Filter
- [x] คอลัมน์ `is_active` ใน `tb_villager` (1 = ปกติ, 0 = เลิกติดตาม/บล็อก)
- [x] Webhook Event `unfollow` → mark `is_active = 0` (ไม่ลบ record เก็บประวัติไว้)
- [x] Webhook Event `follow` → mark `is_active = 1` (เมื่อแอดกลับมา restore สถานะทันที)

## 3.12 ระบบคุ้มครองข้อมูลส่วนบุคคล (PDPA / Compliance)
- [x] แสดงข้อความขอความยินยอมเก็บข้อมูลส่วนบุคคล (ชื่อ-นามสกุล, บ้านเลขที่, หมู่บ้าน) บนหน้าลงทะเบียน LIFF
- [x] Checkbox ยินยอม PDPA ก่อนลงทะเบียน (ปุ่มลงทะเบียน disabled จนกว่าจะติ๊กยินยอม)
- [x] Server-side validation บังคับ `pdpaConsent === true` (Reject HTTP 400 หากไม่ยินยอม)
- [x] บันทึกเวลาที่ยินยอมลงในคอลัมน์ `pdpa_consent_at` (TIMESTAMP) ในฐานข้อมูล `tb_villager`

---

## Infrastructure / Setup (ทำก่อนเริ่มฟีเจอร์ด้านบน)
- [x] ออกแบบโครงสร้างโปรเจกต์ (backend + frontend)
- [x] สร้าง Messaging API Channel + LIFF Channel (LINE Developers Console)
- [x] ตั้งค่า Webhook URL + verify
- [x] ปิด auto-reply/greeting message default ใน LINE OA Manager
- [x] รัน schema.sql สร้างฐานข้อมูลจริง
- [x] เขียน middleware auth (JWT) + role check

## 4.0 UI/UX Refresh — Design System v2.0 (2026-08-26)

> Spec อยู่ที่ `docs/DESIGN_SYSTEM.md` (v2.0) + `docs/UI_DESIGN.md` (v2.0) — typography ขยายสำหรับผู้สูงวัย,
> motion system (fade-up/stagger/page transition/modal scale-in/toast), touch target ≥44px

### Foundation
- [x] Typography tokens ใหม่ใน `tailwind.config.js` (`text-h1…text-meta`, body LIFF 18px) — ลบ text 10–11px ทั้งระบบ
- [x] Motion tokens (`duration-fast/base/slow`, ease-enter/exit) + keyframes (fade-up/fade-in/scale-in/shimmer)
- [x] `index.css`: Thai line-height 1.7, focus-visible ring, prefers-reduced-motion guard, safe-bottom utility
- [x] ติดตั้ง framer-motion (page transition / stagger / modal / bottom-nav indicator)

### Components
- [x] Button/Input/Select/Textarea/Card/Badge/Modal/EmptyState/Skeleton/Pagination ยกโฉมตาม v2.0 (Input/Select 48px, font 16px+)
- [x] เพิ่ม Toast system (`toast.success/error/info` + `<Toaster />` ใน App) พร้อม slide/fade animation
- [x] Motion helpers: `FadeStagger` / `FadeItem` / `PageTransition` (`components/motion/`)
- [x] Modal ใช้ AnimatePresence (backdrop fade + panel scale-in), ปุ่มปิด 36px+

### Layout
- [x] AdminLayout: sidebar 256px + animated active pill (layoutId), **mobile drawer** (hamburger + slide-in) สำหรับ <lg
- [x] EditProfileModal แยกไฟล์ + refactor ใช้ ui Modal/Input/Button + toast
- [x] LiffLayout bottom nav: สูง 64px, label 14px, icon pop + moving indicator pill, safe-area inset
- [x] Page transition ระดับ layout ฝั่ง admin (motion.div keyed by pathname)

### Pages
- [x] LIFF ทั้งหมด: Home, NewsList, NewsDetail, ActivityList, ActivityDetail, DocumentList, Profile, Register (typography ใหญ่ + stagger + hoverable cards)
- [x] Login (split-brand layout desktop + show password), ForgotPassword (OTP tracking-[0.4em], step transition)
- [x] Dashboard: stat cards hover lift + FadeStagger
- [x] Admin pages ที่เหลือ: normalize page title → `text-h1`, table header → `text-body-sm`, error box/helper → `text-body-sm`

