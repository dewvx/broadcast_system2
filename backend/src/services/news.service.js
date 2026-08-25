const fs = require('fs');
const path = require('path');
const newsModel = require('../models/news.model');
const viewModel = require('../models/view.model');
const villagerModel = require('../models/villager.model');
const { verifyLiffIdToken } = require('./liffAuth.service');

// ไฟล์รูปเก็บที่ backend/public/uploads/ (ตรงกับ upload.middleware.js)
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * ลบไฟล์รูปออกจาก disk กัน orphan uploads
 * - รับเฉพาะ path รูปแบบ /uploads/<filename> แล้วดึงชื่อไฟล์ด้วย basename (กัน path traversal)
 * - fire-and-forget: ถ้าลบไม่ได้ (เช่นไฟล์หายไปก่อนแล้ว) แค่ warn ไม่ throw ทำให้ request หลักพัง
 */
function deleteUploadedImage(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;

  const filePath = path.join(UPLOADS_DIR, path.basename(imagePath));
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn(`ลบไฟล์รูปไม่สำเร็จ: ${filePath}`, err.message);
    }
  });
}

async function getAllNews() {
  return newsModel.findAll();
}

async function getNewsById(newsId) {
  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);
  return news;
}

async function createNews(data, currentUser) {
  const { newsTitle, newsContent, categoryId } = data;

  if (!newsTitle || !newsContent || !categoryId) {
    throwError('กรุณากรอกหัวข้อ เนื้อหา และหมวดหมู่ให้ครบ', 400);
  }

  const newsId = await newsModel.create({
    ...data,
    createdBy: currentUser.userId,
  });

  return newsModel.findById(newsId);
}

async function updateNews(newsId, data, currentUser) {
  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  // Admin แก้ได้ทุกข่าวเสมอ
  if (currentUser.roleName !== 'Admin') {
    // Leader แก้ได้เฉพาะข่าวตัวเอง
    if (news.created_by !== currentUser.userId) {
      throwError('คุณแก้ไขได้เฉพาะข่าวที่ตัวเองสร้างเท่านั้น', 403);
    }
    // และต้องยังไม่ถูกอนุมัติ
    if (news.news_status === 'Approved') {
      throwError('ข่าวนี้อนุมัติแล้ว ไม่สามารถแก้ไขได้', 403);
    }
  }

  await newsModel.update(newsId, data);
  return newsModel.findById(newsId);
}

async function deleteNews(newsId, currentUser) {
  // ลบได้เฉพาะ Admin เท่านั้น (เช็คซ้ำในนี้ แม้ route จะมี role.middleware กันไว้ชั้นนอกแล้ว)
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่ลบข่าวได้', 403);
  }

  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  await newsModel.remove(newsId);

  // ลบไฟล์รูปออกจาก disk ด้วย (กัน orphan uploads)
  deleteUploadedImage(news.news_image);
}

async function approveNews(newsId, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่อนุมัติข่าวได้', 403);
  }

  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  await newsModel.updateStatus(newsId, 'Approved', currentUser.userId);
  return newsModel.findById(newsId);
}

async function rejectNews(newsId, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่ปฏิเสธข่าวได้', 403);
  }

  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  await newsModel.updateStatus(newsId, 'Rejected', currentUser.userId);
  return newsModel.findById(newsId);
}

async function setNewsImage(newsId, imagePath, currentUser) {
  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  // ใช้เงื่อนไขสิทธิ์เดียวกับ updateNews: Admin แก้ได้ทุกข่าว, Leader แก้ได้เฉพาะข่าวตัวเองที่ยังไม่อนุมัติ
  if (currentUser.roleName !== 'Admin') {
    if (news.created_by !== currentUser.userId) {
      throwError('คุณอัปโหลดรูปได้เฉพาะข่าวที่ตัวเองสร้างเท่านั้น', 403);
    }
    if (news.news_status === 'Approved') {
      throwError('ข่าวนี้อนุมัติแล้ว ไม่สามารถแก้ไขรูปได้', 403);
    }
  }

  // ถ้ามีรูปเดิมอยู่แล้ว ลบไฟล์เดิมออกจาก disk ก่อน (กัน orphan uploads)
  if (news.news_image && news.news_image !== imagePath) {
    deleteUploadedImage(news.news_image);
  }

  await newsModel.setImage(newsId, imagePath);
  return newsModel.findById(newsId);
}

async function getPublicNewsDetail(newsId, idToken) {
  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  // ลูกบ้านดูได้เฉพาะข่าวที่อนุมัติแล้ว (กันเข้าไปเห็นข่าวร่าง/ยังไม่ผ่านตรวจ)
  if (news.news_status !== 'Approved') {
    throwError('ไม่พบข่าวนี้', 404);
  }

  // verify token เพื่อรู้ว่าใครดู - ถ้า verify มีปัญหา ก็ยังคงให้ดูข่าวได้ปกติ แค่ไม่บันทึก view log
  try {
    if (idToken && idToken !== 'guest') {
      const { lineUserId } = await verifyLiffIdToken(idToken);
      const villager = await villagerModel.findByLineUserId(lineUserId);

      if (villager) {
        await viewModel.createViewLog(newsId, villager.villager_id);
      }
    }
  } catch (logErr) {
    console.warn('View log recording skipped:', logErr.message || logErr);
  }

  return news;
}

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  approveNews,
  rejectNews,
  setNewsImage,
  getPublicNewsDetail,
};