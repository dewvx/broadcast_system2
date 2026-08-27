# Prompt: เพิ่มระบบขอความยินยอม PDPA ตอนลงทะเบียนลูกบ้าน

ก่อนเริ่ม อ่าน `CLAUDE.md`, `docs/FEATURES.md`, `docs/DATABASE.md`, `docs/ROLES.md` ก่อนเสมอ ตามที่ระบุไว้ใน convention ของโปรเจกต์

## เป้าหมาย
เพิ่มการขอความยินยอมเก็บข้อมูลส่วนบุคคล (PDPA) ในขั้นตอนลงทะเบียนลูกบ้าน (`RegisterPage.jsx`) ก่อนอนุญาตให้กรอกฟอร์ม/กดลงทะเบียนได้ พร้อมบันทึกเวลาที่ยินยอมไว้ใน database เพื่ออ้างอิงย้อนหลังได้

## 1. Database
เพิ่ม column ใหม่ในตาราง `tb_villager`:
```sql
ALTER TABLE tb_villager ADD COLUMN pdpa_consent_at TIMESTAMP NULL AFTER zone_name;
```
- อัปเดต `backend/database/schema.sql` ให้ตรงกับ column ใหม่นี้ด้วย (คนอื่นที่รัน schema ใหม่ตั้งแต่ต้นจะได้ column ครบ)
- อัปเดต `docs/DATABASE.md` เพิ่ม column นี้ในตาราง `tb_villager`

## 2. Backend

**`villager.model.js`**
- แก้ฟังก์ชัน `create()` ให้รับ `pdpaConsentAt` เพิ่ม แล้ว insert ค่านี้ลง column ใหม่ (ใช้ `new Date()` ฝั่ง service ตอนเรียก ไม่ต้องรับจาก client โดยตรง เพื่อกันปลอมเวลา)

**`villager.service.js`**
- แก้ฟังก์ชัน `registerVillager()`:
  - เพิ่ม parameter `pdpaConsent` (boolean) รับมาจาก request
  - ถ้า `pdpaConsent !== true` → throw error 400 ข้อความ "กรุณายินยอมให้เก็บข้อมูลส่วนบุคคลก่อนลงทะเบียน"
  - ถ้ายินยอม → ส่ง `pdpaConsentAt: new Date()` เข้า `villagerModel.create()`

**`villager.controller.js`**
- แก้ฟังก์ชัน `register()` ให้ดึง `pdpaConsent` จาก `req.body` แล้วส่งต่อให้ service

## 3. Frontend

**`frontend/src/pages/liff/RegisterPage.jsx`**
- เพิ่ม checkbox ยินยอมไว้เหนือปุ่ม submit ของฟอร์ม พร้อมข้อความสั้นๆ อธิบายวัตถุประสงค์ เช่น:
  > "ข้าพเจ้ายินยอมให้ระบบหอกระจายข่าวชุมชนเก็บและใช้ข้อมูล ชื่อ-นามสกุล บ้านเลขที่ และหมู่บ้าน เพื่อวัตถุประสงค์ในการส่งข่าวสารและติดต่อประชาสัมพันธ์ของชุมชนเท่านั้น"
- ปุ่ม "ลงทะเบียน" ต้อง **disabled จนกว่าจะติ๊กยินยอม**
- ส่ง `pdpaConsent: true` ไปพร้อม field อื่นตอนเรียก `registerVillager()`

**`frontend/src/api/villager.api.js`**
- เช็คว่าฟังก์ชัน `registerVillager(idToken, formData)` ส่ง `formData` ทั้งก้อนไปอยู่แล้วหรือไม่ (ถ้าใช้ spread `...formData` อยู่แล้วไม่ต้องแก้ไฟล์นี้เลย เพราะ `pdpaConsent` จะติดไปกับ object โดยอัตโนมัติ)

## เงื่อนไขสำคัญ
- **Backend ต้อง validate `pdpaConsent === true` เสมอ** ไม่เชื่อ frontend ฝ่ายเดียว (เผื่อมีคนยิง API ตรงๆ ข้าม UI)
- ห้ามให้ลงทะเบียนสำเร็จถ้าไม่ได้ยินยอม ไม่ว่าจะจากช่องทางไหน
- คนที่เคยลงทะเบียนไปแล้วก่อนหน้านี้ (ก่อนมีฟีเจอร์นี้) จะมี `pdpa_consent_at IS NULL` ซึ่งถือว่าปกติ ไม่ต้อง backfill retroactive — เก็บไว้เป็นข้อมูลว่า "ยินยอมตั้งแต่เมื่อไหร่" เท่านั้น ไม่ต้องบังคับคนเก่าต้องกลับมายินยอมใหม่

## ทดสอบหลังทำเสร็จ
1. ลองลงทะเบียน villager ใหม่ (LINE account อื่น) โดยไม่ติ๊กยินยอม → ปุ่มต้องกดไม่ได้/ถูก disable
2. ลองยิง `POST /api/villager/register` ตรงๆ ผ่าน curl โดยไม่ส่ง `pdpaConsent` หรือส่งเป็น `false` → ต้องได้ 400 ไม่ใช่ 201
3. ติ๊กยินยอมแล้วลงทะเบียนสำเร็จ → เช็คใน DB ว่า `pdpa_consent_at` มีค่า timestamp จริง ไม่ใช่ NULL

หลังทำเสร็จ อัปเดต `docs/FEATURES.md` เพิ่มรายการนี้ในหมวด PDPA/Compliance (ถ้ายังไม่มีหมวดนี้ ให้สร้างใหม่)