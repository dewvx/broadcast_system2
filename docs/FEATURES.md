# Features Checklist

อัปเดตสถานะ `[ ]` -> `[x]` เมื่อทำเสร็จ เพื่อให้ AI/ทีมรู้ progress ปัจจุบัน

## 3.1 ระบบยืนยันตัวตน (Login - Logout)
- [x] Login สำหรับ Admin + Leader (JWT, bcrypt)
- [x] เช็ค session ปัจจุบัน (/me)
- [x] จัดการบัญชีผู้ใช้งาน (Admin เท่านั้น) (หน้า UserPage `/admin/users`)
- [x] แก้ไข username/password/ชื่อจริง ของตนเองผ่าน GUI (ไม่ต้องรัน cURL)
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
- [ ] ตั้งเวลาส่งข่าวล่วงหน้า

## 3.8 ระบบแชทบอทตอบคำถามอัตโนมัติ
- [x] ตอบคำถามพื้นฐานอัตโนมัติ (keyword match กับ tb_chatbot_faq ผ่าน LINE Webhook)
- [x] จัดการคำถาม-คำตอบแชทบอทอัตโนมัติ (Admin Dashboard)
- [ ] ส่งลิงก์ข่าว/ฟอร์มที่เกี่ยวข้อง
- [ ] บันทึกประวัติการสอบถาม
- [x] fallback "ไม่พบข้อมูล" (ยังไม่มีแจ้งเตือน Admin ให้ตอบ 1-on-1)

## 3.9 ระบบบันทึกประวัติการส่งข่าว (Broadcast Log)
- [x] บันทึกวันที่/เวลา/ผู้ส่ง/จำนวนผู้รับ

## 3.10 ระบบรายงานและสถิติการเข้าถึงข้อมูล
- [x] จำนวนข่าวที่เผยแพร่
- [x] สถิติการเข้าถึงข่าว (Tracking Views ผ่าน tb_view_log Real-time)
- [x] รายงานสรุปย้อนหลัง (broadcast history)
---

## Infrastructure / Setup (ทำก่อนเริ่มฟีเจอร์ด้านบน)
- [x] ออกแบบโครงสร้างโปรเจกต์ (backend + frontend)
- [x] สร้าง Messaging API Channel + LIFF Channel (LINE Developers Console)
- [x] ตั้งค่า Webhook URL + verify
- [x] ปิด auto-reply/greeting message default ใน LINE OA Manager
- [x] รัน schema.sql สร้างฐานข้อมูลจริง
- [x] เขียน middleware auth (JWT) + role check
