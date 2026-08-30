# Prompt: Zone Dropdown (ซอย/คุ้ม) + การ์ดผู้ติดต่อผู้นำชุมชนแบบ Dynamic

ก่อนเริ่ม อ่าน `CLAUDE.md`, `docs/FEATURES.md`, `docs/DATABASE.md`, `docs/ROLES.md` ก่อนเสมอ

## หมายเหตุสำคัญเรื่อง scope โปรเจกต์ (บันทึกไว้ ไม่ต้องเขียนโค้ด)
ระบบนี้ออกแบบมาสำหรับใช้งาน **1 หมู่บ้านต่อ 1 ชุดระบบ (1 database)** เท่านั้น ไม่รองรับหลายหมู่บ้านพร้อมกันในระบบเดียว (multi-tenancy) หากหมู่บ้านมีหลายหมู่/โซนย่อย ให้แต่ละหมู่แยก deploy คนละชุด ไม่ต้องออกแบบระบบแบ่งสิทธิ์ตามหมู่ - เพิ่มบรรทัดนี้ไว้ใน `CLAUDE.md` หรือ `docs/FEATURES.md` เพื่อกันการออกแบบเกินความจำเป็นในอนาคต

สิ่งที่เดิมเรียกว่า "โซน" (`zone_name` ใน `tb_villager`) ให้เปลี่ยนความหมายเป็น **"ซอย/คุ้ม" ภายในหมู่บ้านเดียวนั้น** (ไม่ใช่หมายเลขหมู่อีกต่อไป)

---

## ส่วนที่ 1: Zone (ซอย/คุ้ม) เป็น Dropdown จัดการได้

### Database
สร้างตารางใหม่ `tb_zone`:
```sql
CREATE TABLE tb_zone (
  zone_id INT AUTO_INCREMENT PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
- อัปเดต `backend/database/schema.sql` และ `docs/DATABASE.md`
- Seed ตัวอย่างเริ่มต้น (ปรับชื่อได้ตามจริง): `ซอย 1`, `ซอย 2`, `ซอย 3`, `ซอย 4`

**คงคอลัมน์ `tb_villager.zone_name` ไว้เป็น string เหมือนเดิม** (ไม่เปลี่ยนเป็น foreign key ตอนนี้ เพราะกระทบ query เดิมใน `broadcast.model.js` ที่ filter ด้วย `zone_name` อยู่แล้วหลายจุด) แต่ **บังคับ validate ว่าค่าที่ส่งมาต้องมีอยู่จริงใน `tb_zone`** ก่อนบันทึกเสมอ (ทั้งตอนลงทะเบียนและตอน Admin แก้ไข)

### Backend
- สร้าง `zone.model.js`, `zone.service.js`, `zone.controller.js`, `zone.routes.js` (CRUD แบบเดียวกับ `category.*` ที่มีอยู่แล้ว ก็อป pattern มาปรับ)
- Endpoint: `GET /api/zone` **ไม่ต้อง auth** (ต้องเรียกได้จากหน้าลงทะเบียนก่อน login) / `POST`, `PUT`, `DELETE` ต้อง Admin เท่านั้น
- แก้ `villager.service.js` -> `registerVillager()` และ `updateSelfProfile()`: ก่อนบันทึก `zoneName` ให้เช็คกับ `zoneModel.findByName()` ว่ามีอยู่จริงใน `tb_zone` ก่อนเสมอ ถ้าไม่มี throw error 400 "ซอย/คุ้มที่เลือกไม่ถูกต้อง"
- **ลบ logic เดิมที่แปลงตัวเลขเป็น "หมู่ X" ทิ้งทั้งหมด** (พบใน `RegisterPage.jsx`/`ProfilePage.jsx` ฝั่ง frontend เดิม เช่น `if (/^\d+$/.test(zoneName)) zoneName = "หมู่ ${zoneName}"`) เพราะตอนนี้ผู้ใช้เลือกจาก dropdown ตรงๆ ไม่ต้องแปลงอะไรอีก

### Frontend
- **`frontend/src/pages/liff/RegisterPage.jsx`**: เปลี่ยนช่องกรอก "หมู่บ้าน/โซน" จาก `<input type="text">` เป็น `<select>` ดึงตัวเลือกจาก `GET /api/zone` label เปลี่ยนเป็น "ซอย/คุ้ม"
- **`frontend/src/pages/liff/ProfilePage.jsx`**: ช่อง "หมู่บ้าน/โซน" ในฟอร์มแก้ไขข้อมูลตัวเอง เปลี่ยนเป็น dropdown แบบเดียวกัน ลบ helper text เดิม ("กรอกเฉพาะตัวเลขหมู่...") ออก
- สร้างหน้าใหม่ **`frontend/src/pages/admin/ZonePage.jsx`** (Admin จัดการรายชื่อซอย - CRUD ธรรมดา pattern เดียวกับ `CategoryPage.jsx`) เพิ่ม link ใน `AdminLayout.jsx`
- สร้าง `frontend/src/api/zone.api.js`
- Broadcast: หน้าเลือกโซนตอนส่งข่าว (dropdown ใน `NewsManagementPage.jsx`) เปลี่ยน label จาก "โซน" เป็น "ซอย/คุ้ม" (ยัง fetch จาก `getZones()` ของ broadcast API เดิมได้ เพราะดึงจาก `tb_villager` distinct values อยู่แล้ว ไม่ต้องแก้ backend endpoint นั้น)

### ทดสอบ
1. เปิดหน้าลงทะเบียนใหม่ → เห็น dropdown ซอย ไม่ใช่ช่องพิมพ์ตัวเลข
2. ลองยิง API ตรงๆ ส่ง `zoneName` ที่ไม่มีใน `tb_zone` → ต้องได้ 400
3. Admin เพิ่มซอยใหม่ผ่าน `ZonePage.jsx` → กลับไปหน้าลงทะเบียน dropdown ต้องมีตัวเลือกใหม่ทันที
4. ทดสอบ broadcast เจาะจงซอย เช่น "ซอย 4" → ส่งถึงเฉพาะคนที่เลือกซอย 4 ตอนลงทะเบียน

---

## ส่วนที่ 2: การ์ดผู้ติดต่อผู้นำชุมชนแบบ Dynamic

### Database
เพิ่ม column ใน `tb_user`:
```sql
ALTER TABLE tb_user ADD COLUMN phone_number VARCHAR(20) NULL AFTER full_name;
ALTER TABLE tb_user ADD COLUMN position_title VARCHAR(100) NULL AFTER phone_number;
```
- `position_title` เก็บตำแหน่งที่ใช้แสดงผล เช่น "ผู้ใหญ่บ้าน", "ผู้ช่วยผู้ใหญ่บ้าน", "อสม." (ไม่ผูกกับ `role_id` ตายตัว เพราะตำแหน่งจริงอาจหลากหลายกว่า role ในระบบที่มีแค่ Admin/Leader)
- อัปเดต `schema.sql`, `docs/DATABASE.md`

### Backend
- แก้ `user.model.js` ให้ `create()`/`update()` รองรับ `phoneNumber`, `positionTitle`
- สร้าง endpoint ใหม่ **public** (ไม่ต้อง auth เพราะลูกบ้านต้องดูได้จากหน้า Profile โดยไม่ login): `GET /api/user/public/contacts`
  - return เฉพาะ `full_name`, `phone_number`, `position_title` ของ user ที่มี `phone_number IS NOT NULL` เท่านั้น (อย่า return `username`, `password`, หรือข้อมูล sensitive อื่นเด็ดขาด)

### Frontend
- **`frontend/src/pages/liff/ProfilePage.jsx`**: แก้ส่วน "ติดต่อผู้นำชุมชน" ให้ดึงจาก `GET /api/user/public/contacts` แล้ว render เป็นการ์ดแบบเดิม (ใช้ layout Card เดิมที่มีอยู่แล้ว) แทนเลขที่ hardcode ไว้ 2 เบอร์ (ที่ทำการผู้ใหญ่บ้าน, รพ.สต.) — **คงเบอร์ฉุกเฉิน 1669 hardcode ไว้เหมือนเดิม** เพราะเป็นเบอร์ราชการมาตรฐานทั่วประเทศ ไม่เกี่ยวกับข้อมูลในระบบ
- ในหน้าสร้าง/แก้ไขผู้ใช้งาน (ถ้ามี `UserManagementPage.jsx`/ฟอร์มสร้าง user แล้ว) เพิ่มช่องกรอก "เบอร์โทรติดต่อ" และ "ตำแหน่ง" ด้วย (ทั้งสอง optional ก็ได้ ไม่บังคับกรอก)

### ทดสอบ
1. Admin เพิ่มเบอร์โทร+ตำแหน่งให้ user ที่มีอยู่ → เช็คว่า `GET /api/user/public/contacts` ตอบกลับมาถูกต้อง
2. เปิดหน้า `/liff/profile` → เห็นการ์ดผู้ติดต่อที่ดึงจาก DB จริง ไม่ใช่เลข hardcode
3. User ที่ไม่มี `phone_number` (เช่น admin ทดสอบที่สร้างไว้ตอนต้นวัน ไม่เคยกรอกเบอร์) → ต้องไม่โผล่ในรายการ ไม่ error
4. ยืนยันว่า response จาก endpoint นี้ไม่มี `username`/`password_hash`/ข้อมูล sensitive อื่นหลุดออกมา

---

หลังทำเสร็จทั้ง 2 ส่วน อัปเดต `docs/FEATURES.md` และ `docs/ROLES.md` ให้สะท้อนการเปลี่ยนแปลง (โซน → ซอย/คุ้ม)