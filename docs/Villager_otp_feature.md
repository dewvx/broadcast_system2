# Prompt: เพิ่มขั้นตอนยืนยัน OTP ผ่าน LINE ก่อนลงทะเบียนลูกบ้านสำเร็จ

ก่อนเริ่ม อ่าน `CLAUDE.md`, `docs/FEATURES.md`, `docs/DATABASE.md` ก่อนเสมอ

## เป้าหมาย
เพิ่มขั้นตอนยืนยัน OTP (ส่งผ่าน LINE push message ไปยังบัญชี LINE ของผู้ลงทะเบียนเอง) ก่อนที่ระบบจะบันทึกข้อมูลลูกบ้านลง `tb_villager` จริง โดยนำ pattern เดียวกับระบบ OTP กู้คืนรหัสผ่าน (`auth.service.js`, `passwordReset.model.js`) มาปรับใช้ซ้ำ ไม่ต้องออกแบบใหม่ทั้งหมด

หมายเหตุสำคัญ (เพื่อความเข้าใจตรงกัน ไม่ต้องเขียนโค้ดส่วนนี้):
OTP นี้ยืนยันแค่ว่า "ผู้กรอกฟอร์มเป็นเจ้าของบัญชี LINE ที่ใช้ login อยู่จริง" ซึ่งระบบมี LINE ID Token Verification ยืนยันสิ่งนี้อยู่แล้ว OTP จึงเป็น defense-in-depth เพิ่มเติม ไม่ใช่การยืนยันว่าข้อมูลชื่อ/บ้านเลขที่ที่กรอกเป็นความจริง

## 1. Database
สร้างตารางใหม่ tb_villager_otp (แยกจาก tb_password_reset เพราะคนละ flow และคนละ subject - อันนี้ผูกกับ line_user_id ไม่ใช่ user_id):
```sql
CREATE TABLE tb_villager_otp (
  otp_id INT AUTO_INCREMENT PRIMARY KEY,
  line_user_id VARCHAR(100) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts_count INT NOT NULL DEFAULT 0,
  is_used TINYINT(1) NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
อัปเดต schema.sql, docs/DATABASE.md

## 2. Backend

สร้าง villagerOtp.model.js (โครงสร้างคล้าย passwordReset.model.js มาก - ใช้เป็นต้นแบบได้เลย):
- create({ lineUserId, otpCode, expiresAt })
- findValidByLineUserId(lineUserId) - หา OTP ล่าสุดที่ is_used = 0 AND expires_at > NOW()
- registerFailedAttempt(otpId) - เพิ่ม attempts_count ถ้าครบ 5 ครั้งให้ mark is_used = 1 ทันที (ใช้ logic เดียวกับ password reset)
- markUsed(otpId)
- invalidatePreviousOtps(lineUserId) - mark OTP เก่าทั้งหมดของ line_user_id นี้เป็น used ก่อนสร้างใหม่ (เหมือน password reset)

แก้ villager.service.js:
- เพิ่มฟังก์ชัน sendRegistrationOtp(idToken):
  1. verify idToken ผ่าน verifyLiffIdToken() (ของเดิม)
  2. เช็คว่ายังไม่เคยลงทะเบียนมาก่อน (ถ้าลงทะเบียนแล้ว throw error "บัญชีนี้ลงทะเบียนไปแล้ว" เหมือนเดิม)
  3. invalidate OTP เก่า, สร้าง OTP ใหม่ด้วย crypto.randomInt(100000, 1000000) (ใช้ pattern เดียวกับ auth.service.js)
  4. ส่งผ่าน lineClient.pushMessage() ไปยัง lineUserId นั้นเอง ข้อความเช่น "รหัสยืนยันการลงทะเบียนของคุณคือ XXXXXX (หมดอายุใน 5 นาที)"
  5. เพิ่ม cooldown กันขอซ้ำถี่เกินไป (60 วินาที เหมือน password reset)
- แก้ registerVillager(): เพิ่ม parameter otpCode - ต้อง verify OTP ผ่าน villagerOtpModel ก่อนถึงจะสร้าง record ใน tb_villager ได้ (เช็ค otp_code ตรงกัน, ยังไม่หมดอายุ, ยังไม่ถูกใช้, attempts_count < 5) ถ้า OTP ผิด ให้ registerFailedAttempt() แล้ว throw error พร้อมบอกจำนวนครั้งที่เหลือ

แก้ villager.controller.js / villager.routes.js:
- เพิ่ม endpoint ใหม่ POST /api/villager/send-otp (body: { idToken })
- แก้ endpoint เดิม POST /api/villager/register ให้รับ otpCode เพิ่มใน body

## 3. Frontend

frontend/src/pages/liff/RegisterPage.jsx ปรับ flow เป็น 2 ขั้นตอน (wizard คล้าย ForgotPasswordPage.jsx ที่เคยทำไว้):
- ขั้นที่ 1: กรอกฟอร์มข้อมูลส่วนตัวตามเดิม (ชื่อ, นามสกุล, บ้านเลขที่, ซอย, ติ๊ก PDPA) → กดปุ่ม "ขอรหัส OTP" แทนปุ่ม "ลงทะเบียน" เดิม → เรียก sendRegistrationOtp()
- ขั้นที่ 2: แสดงข้อความ "เราส่งรหัส OTP ไปที่ LINE ของคุณแล้ว" พร้อมช่องกรอก OTP 6 หลัก → กดยืนยัน → เรียก registerVillager() พร้อม otpCode แนบไปด้วย (เก็บ form data จากขั้นที่ 1 ไว้ใน state ระหว่างรอ ไม่ต้องกรอกซ้ำ)
- มีปุ่ม "ส่ง OTP อีกครั้ง" (คำนึงถึง cooldown 60 วินาทีจาก backend ด้วย)

frontend/src/api/villager.api.js เพิ่ม:
```js
export function sendRegistrationOtp(idToken) {
  return axiosClient.post('/api/villager/send-otp', { idToken });
}
```
แก้ registerVillager() ให้ส่ง otpCode เพิ่มด้วย

## ทดสอบหลังทำเสร็จ
1. กรอกฟอร์มลงทะเบียน กด "ขอรหัส OTP" → ต้องได้ push message เข้า LINE จริง
2. กรอก OTP ผิด 5 ครั้ง → ต้อง lock และแจ้งให้ขอรหัสใหม่ (เหมือน password reset)
3. กรอก OTP ถูกต้อง → ลงทะเบียนสำเร็จ, ข้อมูลบันทึกลง tb_villager ครบ
4. กด "ขอ OTP อีกครั้ง" ก่อนครบ 60 วินาที → ต้องได้ 429 (เหมือน password reset)
5. รอ OTP หมดอายุ (เกิน 5 นาที) แล้วค่อยกรอก → ต้อง reject ว่าหมดอายุ ไม่ใช่ผ่าน

หลังทำเสร็จ อัปเดต docs/FEATURES.md และเพิ่มหมายเหตุใน docs/ROLES.md/security section ว่า OTP นี้คือ defense-in-depth เพิ่มเติมจาก LINE ID Token verification ที่มีอยู่แล้ว ไม่ใช่การยืนยันความถูกต้องของข้อมูลที่กรอก