-- ============================================================
-- Village News Broadcast System via LINE OA
-- Database schema (สร้างตาม Data Dictionary ในเอกสารระบบ)
-- ============================================================

CREATE DATABASE IF NOT EXISTS village_news
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE village_news;

-- ตารางที่ 3.1 ข้อมูลสิทธิ์การเข้าใช้งาน
CREATE TABLE tb_role (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL,        -- Admin / Leader / Villager
  role_description VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.2 ข้อมูลผู้ใช้งานระบบ (ผู้ใหญ่บ้าน / ผู้นำชุมชน)
CREATE TABLE tb_user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,        -- hashed password (bcrypt)
  full_name VARCHAR(100) NOT NULL,
  line_user_id VARCHAR(100) NULL,        -- ผูกบัญชี LINE สำหรับรับ OTP กู้คืนรหัสผ่าน
  role_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES tb_role(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางขอรีเซ็ตรหัสผ่านผ่าน LINE OA (OTP)
CREATE TABLE tb_password_reset (
  reset_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reset_otp VARCHAR(6) NOT NULL,
  reset_token VARCHAR(64) NOT NULL,
  attempts_count INT NOT NULL DEFAULT 0, -- จำนวนครั้งกรอก OTP ผิด (ครบ 5 = invalid token)
  is_used TINYINT(1) DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tb_user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.3 ข้อมูลลูกบ้านและผู้ใช้ LINE
CREATE TABLE tb_villager (
  villager_id INT AUTO_INCREMENT PRIMARY KEY,
  line_user_id VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  house_number VARCHAR(50) NOT NULL,
  zone_name VARCHAR(100) NULL,
  pdpa_consent_at TIMESTAMP NULL,
  is_active TINYINT(1) DEFAULT 1,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.10 ข้อมูลหมวดหมู่ข่าวสาร
CREATE TABLE tb_category (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.4 ข้อมูลข่าวสารชุมชน
CREATE TABLE tb_news (
  news_id INT AUTO_INCREMENT PRIMARY KEY,
  news_title VARCHAR(255) NOT NULL,
  news_content TEXT NOT NULL,
  category_id INT NOT NULL,
  news_image VARCHAR(255) NULL,
  news_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_by INT NOT NULL,
  approved_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES tb_category(category_id),
  FOREIGN KEY (created_by) REFERENCES tb_user(user_id),
  FOREIGN KEY (approved_by) REFERENCES tb_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.5 ข้อมูลกิจกรรมชุมชน
CREATE TABLE tb_activity (
  act_id INT AUTO_INCREMENT PRIMARY KEY,
  act_title VARCHAR(255) NOT NULL,
  act_content TEXT NULL,
  act_date DATE NOT NULL,
  act_location VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES tb_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.6 ข้อมูลแบบฟอร์มราชการ
CREATE TABLE tb_document (
  doc_id INT AUTO_INCREMENT PRIMARY KEY,
  doc_name VARCHAR(255) NOT NULL,
  doc_file_path VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES tb_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.7 ข้อมูลคำถามพบบ่อยแชทบอท
CREATE TABLE tb_chatbot_faq (
  faq_id INT AUTO_INCREMENT PRIMARY KEY,
  question_key VARCHAR(255) NOT NULL,
  answer_text TEXT NOT NULL,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES tb_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.8 ประวัติการกระจายข่าวและสถิติ
CREATE TABLE tb_broadcast_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  news_id INT NOT NULL,
  sent_by INT NOT NULL,
  total_received INT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (news_id) REFERENCES tb_news(news_id),
  FOREIGN KEY (sent_by) REFERENCES tb_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางคิวส่งข่าวล่วงหน้า (ฟีเจอร์ 3.7 ตั้งเวลาส่งข่าว)
CREATE TABLE tb_scheduled_broadcast (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,
  news_id INT NOT NULL,
  sent_by INT NOT NULL,                  -- ผู้สร้างตารางส่ง (Admin)
  zone_name VARCHAR(100) NULL,           -- NULL = ส่งทุกโซน
  scheduled_at DATETIME NOT NULL,        -- เวลาที่ต้องส่ง (เวลาท้องถิ่นเซิร์ฟเวอร์)
  status ENUM('Pending', 'Sending', 'Sent', 'Failed', 'Cancelled') DEFAULT 'Pending',
  error_message TEXT NULL,               -- บันทึกสาเหตุถ้าส่งไม่สำเร็จ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (news_id) REFERENCES tb_news(news_id),
  FOREIGN KEY (sent_by) REFERENCES tb_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.9 ตารางเก็บสถิติการเข้าชมข่าวสาร
CREATE TABLE tb_view_log (
  view_id INT AUTO_INCREMENT PRIMARY KEY,
  news_id INT NOT NULL,
  villager_id INT NOT NULL,
  view_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (news_id) REFERENCES tb_news(news_id),
  FOREIGN KEY (villager_id) REFERENCES tb_villager(villager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตารางที่ 3.11 ตารางเก็บประวัติการสอบถามของแชทบอท
CREATE TABLE tb_chatbot_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  line_user_id VARCHAR(100) NOT NULL,
  message_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  is_matched TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
