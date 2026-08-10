const categoryModel = require('../models/category.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function getAllCategories() {
  return categoryModel.findAll();
}

async function getCategoryById(categoryId) {
  const category = await categoryModel.findById(categoryId);
  if (!category) throwError('ไม่พบหมวดหมู่นี้', 404);
  return category;
}

async function createCategory(categoryName) {
  if (!categoryName || !categoryName.trim()) {
    throwError('กรุณากรอกชื่อหมวดหมู่', 400);
  }

  const categoryId = await categoryModel.create(categoryName.trim());
  return categoryModel.findById(categoryId);
}

async function updateCategory(categoryId, categoryName) {
  const category = await categoryModel.findById(categoryId);
  if (!category) throwError('ไม่พบหมวดหมู่นี้', 404);

  if (!categoryName || !categoryName.trim()) {
    throwError('กรุณากรอกชื่อหมวดหมู่', 400);
  }

  await categoryModel.update(categoryId, categoryName.trim());
  return categoryModel.findById(categoryId);
}

async function deleteCategory(categoryId) {
  const category = await categoryModel.findById(categoryId);
  if (!category) throwError('ไม่พบหมวดหมู่นี้', 404);

  const newsCount = await categoryModel.countNewsUsingCategory(categoryId);
  if (newsCount > 0) {
    throwError(`ลบไม่ได้ เพราะมีข่าว ${newsCount} รายการใช้หมวดหมู่นี้อยู่`, 400);
  }

  await categoryModel.remove(categoryId);
}

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };