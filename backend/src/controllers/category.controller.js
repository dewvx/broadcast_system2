const categoryService = require('../services/category.service');

async function getAll(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body.categoryName);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body.categoryName);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };