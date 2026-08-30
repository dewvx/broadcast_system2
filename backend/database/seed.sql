USE village_news;

-- Roles พื้นฐาน
INSERT INTO tb_role (role_name, role_description) VALUES
  ('Admin', 'ผู้ใหญ่บ้าน - สิทธิ์สูงสุด'),
  ('Leader', 'ผู้นำชุมชน (ผู้ช่วยผู้ใหญ่บ้าน / อสม.)'),
  ('Villager', 'ลูกบ้าน - เข้าผ่าน LINE LIFF เท่านั้น');

-- หมวดหมู่ข่าวตัวอย่าง
INSERT INTO tb_category (category_name) VALUES
  ('ข่าวประชาสัมพันธ์'),
  ('ข่าวสุขภาพ'),
  ('กิจกรรมชุมชน'),
  ('เอกสารราชการ');

-- ซอย/คุ้มตัวอย่างเริ่มต้น
INSERT INTO tb_zone (zone_name) VALUES
  ('ซอย 1'),
  ('ซอย 2'),
  ('ซอย 3'),
  ('ซอย 4');

-- หมายเหตุ: user admin ตัวอย่าง ให้ hash password ด้วย bcrypt ก่อน insert จริง
-- ตัวอย่าง (password: "admin1234" -> ต้อง hash ก่อนใช้งานจริง ห้าม insert plain text)
-- INSERT INTO tb_user (username, password, full_name, phone_number, position_title, role_id)
-- VALUES ('admin', '<bcrypt_hash_here>', 'ผู้ใหญ่บ้านทดสอบ', '0812345678', 'ผู้ใหญ่บ้าน', 1);

