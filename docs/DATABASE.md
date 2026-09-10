# Database Schema

ระบบใช้ MySQL จัดการผ่าน phpMyAdmin ไฟล์ SQL จริงอยู่ที่ `backend/database/schema.sql`

## ตารางทั้งหมด (15 ตาราง)

### tb_role
| Field | Type | Key | Note |
|---|---|---|---|
| role_id | int | PK | Auto Increment |
| role_name | varchar(50) | - | Admin / Leader / Villager |
| role_description | varchar(100) | - | NULL ได้ |

### tb_user
| Field | Type | Key | Note |
|---|---|---|---|
| user_id | int | PK | Auto Increment |
| username | varchar(50) | - | NOT NULL, unique |
| password | varchar(255) | - | bcrypt hash |
| full_name | varchar(100) | - | NOT NULL |
| phone_number | varchar(20) | - | เบอร์โทรสำหรับแสดงในการ์ดติดต่อผู้นำชุมชน (NULL ได้) |
| position_title | varchar(100) | - | ตำแหน่งสำหรับแสดงผล เช่น ผู้ใหญ่บ้าน, ผู้ช่วยฯ, อสม. (NULL ได้) |
| line_user_id | varchar(100) | - | ผูกบัญชี LINE สำหรับรับ OTP กู้คืนรหัสผ่าน (NULL ได้) |
| role_id | int | FK | อ้าง tb_role |

### tb_password_reset
| Field | Type | Key | Note |
|---|---|---|---|
| reset_id | int | PK | Auto Increment |
| user_id | int | FK | อ้าง tb_user (ON DELETE CASCADE) |
| reset_otp | varchar(6) | - | รหัส OTP 6 หลัก |
| reset_token | varchar(64) | - | Secure Token อ้างอิงคำขอ |
| attempts_count | int | - | จำนวนครั้งกรอก OTP ผิด (default 0, ครบ 5 = invalid token) |
| is_used | tinyint(1) | - | 1 = ใช้แล้ว, 0 = ยังไม่ใช้ (default 0) |
| expires_at | datetime | - | เวลาหมดอายุ (10 นาที) |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |

### tb_zone
| Field | Type | Key | Note |
|---|---|---|---|
| zone_id | int | PK | Auto Increment |
| zone_name | varchar(100) | - | NOT NULL, Unique (ชื่อซอย/คุ้มในชุมชน) |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |

### tb_villager
| Field | Type | Key | Note |
|---|---|---|---|
| villager_id | int | PK | Auto Increment |
| line_user_id | varchar(100) | - | Unique, มาจาก LINE LIFF |
| display_name | varchar(255) | - | ชื่อโปรไฟล์ LINE |
| first_name / last_name | varchar(100) | - | กรอกตอนลงทะเบียนครั้งแรก |
| house_number | varchar(50) | - | ใช้ยืนยันตัวตน |
| zone_name | varchar(100) | - | ซอย/คุ้มที่อยู่อาศัย (อ้างอิงชื่อจาก tb_zone, บังคับเลือกตอนลงทะเบียน) |
| pdpa_consent_at | timestamp | - | เวลาที่ยินยอม PDPA (NULL = ลงทะเบียนก่อนมีฟีเจอร์นี้) |
| is_active | tinyint(1) | - | 1 = ติดตาม/ใช้งานปกติ, 0 = เลิกติดตาม/บล็อก (จาก Webhook follow/unfollow) |
| is_deleted | tinyint(1) | - | 0 = ปกติ, 1 = ถูก Admin ลบออกจากระบบ (Soft Delete เพื่อรักษาสถิติ tb_view_log) |
| join_date | timestamp | - | default CURRENT_TIMESTAMP |

### tb_villager_otp
| Field | Type | Key | Note |
|---|---|---|---|
| otp_id | int | PK | Auto Increment |
| line_user_id | varchar(100) | - | บัญชี LINE ที่ขอรับ OTP |
| otp_code | varchar(6) | - | รหัส OTP 6 หลัก |
| attempts_count | int | - | จำนวนครั้งกรอก OTP ผิด (default 0, ครบ 5 = invalid) |
| is_used | tinyint(1) | - | 1 = ใช้แล้ว, 0 = ยังไม่ใช้ (default 0) |
| expires_at | datetime | - | เวลาหมดอายุ (5 นาที) |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |

### tb_category
| Field | Type | Key | Note |
|---|---|---|---|
| category_id | int | PK | Auto Increment |
| category_name | varchar(100) | - | NOT NULL |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |

### tb_news
| Field | Type | Key | Note |
|---|---|---|---|
| news_id | int | PK | Auto Increment |
| news_title | varchar(255) | - | NOT NULL |
| news_content | text | - | NOT NULL |
| category_id | int | FK | อ้าง tb_category |
| news_image | varchar(255) | - | path ไฟล์รูป, NULL ได้ |
| news_status | enum | - | Pending / Approved / Rejected, default Pending |
| created_by | int | FK | อ้าง tb_user (คนสร้างข่าว) |
| approved_by | int | FK | อ้าง tb_user (ผู้ใหญ่บ้านที่อนุมัติ) |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |
| is_deleted | tinyint(1) | - | 0 = ปกติ, 1 = ถูกลบ (Soft Delete) |

### tb_activity
| Field | Type | Key | Note |
|---|---|---|---|
| act_id | int | PK | Auto Increment |
| act_title | varchar(255) | - | NOT NULL |
| act_content | text | - | รายละเอียดเนื้อหากิจกรรม (NULL ได้) |
| act_date | date | - | NOT NULL |
| act_location | varchar(255) | - | NOT NULL |
| created_by | int | FK | อ้าง tb_user |

### tb_document
| Field | Type | Key | Note |
|---|---|---|---|
| doc_id | int | PK | Auto Increment |
| doc_name | varchar(255) | - | NOT NULL |
| doc_file_path | varchar(255) | - | NOT NULL |
| upload_date | timestamp | - | default CURRENT_TIMESTAMP |
| created_by | int | FK | อ้าง tb_user |

### tb_chatbot_faq
| Field | Type | Key | Note |
|---|---|---|---|
| faq_id | int | PK | Auto Increment |
| question_key | varchar(255) | - | keyword ที่ลูกบ้านพิมพ์ |
| answer_text | text | - | ข้อความตอบกลับอัตโนมัติ |
| created_by | int | FK | อ้าง tb_user |

### tb_chatbot_log
| Field | Type | Key | Note |
|---|---|---|---|
| log_id | int | PK | Auto Increment |
| line_user_id | varchar(100) | - | บัญชี LINE ของผู้ส่งข้อความ |
| message_text | text | - | ข้อความคำถามที่ลูกบ้านพิมพ์เข้ามา |
| response_text | text | - | ข้อความตอบกลับที่ระบบส่งออกไป |
| is_matched | tinyint(1) | - | 1 = ตอบตรง FAQ, 0 = ไม่ตรง (Fallback Quick Reply Menu) |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |

### tb_broadcast_log
| Field | Type | Key | Note |
|---|---|---|---|
| log_id | int | PK | Auto Increment |
| news_id | int | FK | อ้าง tb_news |
| sent_by | int | FK | อ้าง tb_user |
| total_received | int | - | จำนวนที่ได้รับ (จาก LINE API response) |
| sent_at | timestamp | - | default CURRENT_TIMESTAMP |

### tb_scheduled_broadcast (ฟีเจอร์ 3.7 ตั้งเวลาส่งข่าว)
| Field | Type | Key | Note |
|---|---|---|---|
| schedule_id | int | PK | Auto Increment |
| news_id | int | FK | อ้าง tb_news |
| sent_by | int | FK | อ้าง tb_user (ผู้สร้างตารางส่ง) |
| zone_name | varchar(100) | - | NULL = ส่งทุกโซน |
| scheduled_at | datetime | - | เวลาที่ต้องส่ง (เวลาท้องถิ่นเซิร์ฟเวอร์) |
| status | enum | - | Pending / Sending / Sent / Failed / Cancelled, default Pending |
| error_message | text | - | เหตุผลถ้า Failed |
| created_at | timestamp | - | default CURRENT_TIMESTAMP |
| updated_at | timestamp | - | ON UPDATE CURRENT_TIMESTAMP (ใช้เช็คงาน Sending ค้างจาก crash) |

### tb_view_log
| Field | Type | Key | Note |
|---|---|---|---|
| view_id | int | PK | Auto Increment |
| news_id | int | FK | อ้าง tb_news |
| villager_id | int | FK | อ้าง tb_villager (ใช้ Soft Delete ที่ tb_villager เพื่อรักษาสถิติยอดอ่าน) |
| view_timestamp | timestamp | - | default CURRENT_TIMESTAMP |

## Relationship สรุป
```
tb_role 1---N tb_user
tb_user 1---N tb_password_reset
tb_user 1---N tb_news (created_by, approved_by)
tb_category 1---N tb_news
tb_user 1---N tb_activity
tb_user 1---N tb_document
tb_user 1---N tb_chatbot_faq
tb_news 1---N tb_broadcast_log
tb_user 1---N tb_broadcast_log
tb_scheduled_broadcast N---1 tb_news, tb_user
tb_news 1---N tb_view_log
tb_villager 1---N tb_view_log
tb_zone 1---N tb_villager (logical relation ผ่าน zone_name)
```
