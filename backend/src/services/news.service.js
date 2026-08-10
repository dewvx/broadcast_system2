const newsModel = require('../models/news.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
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

  if (currentUser.roleName !== 'Admin') {
    if (news.created_by !== currentUser.userId) {
      throwError('คุณแก้ไขได้เฉพาะข่าวที่ตัวเองสร้างเท่านั้น', 403);
    }
    if (news.news_status === 'Approved') {
      throwError('ข่าวนี้อนุมัติแล้ว ไม่สามารถแก้ไขได้', 403);
    }
  }

  await newsModel.update(newsId, data);
  return newsModel.findById(newsId);
}

async function deleteNews(newsId, currentUser) {
  if (currentUser.roleName !== 'Admin') {
    throwError('เฉพาะผู้ใหญ่บ้านเท่านั้นที่ลบข่าวได้', 403);
  }

  const news = await newsModel.findById(newsId);
  if (!news) throwError('ไม่พบข่าวนี้', 404);

  await newsModel.remove(newsId);
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

  if (currentUser.roleName !== 'Admin') {
    if (news.created_by !== currentUser.userId) {
      throwError('คุณอัปโหลดรูปได้เฉพาะข่าวที่ตัวเองสร้างเท่านั้น', 403);
    }
    if (news.news_status === 'Approved') {
      throwError('ข่าวนี้อนุมัติแล้ว ไม่สามารถแก้ไขรูปได้', 403);
    }
  }

  await newsModel.setImage(newsId, imagePath);
  return newsModel.findById(newsId);
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
};