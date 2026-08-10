const newsService = require('../services/news.service');

async function getAll(req, res, next) {
  try {
    const news = await newsService.getAllNews();
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const news = await newsService.getNewsById(req.params.id);
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const news = await newsService.createNews(req.body, req.user);
    res.status(201).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const news = await newsService.updateNews(req.params.id, req.body, req.user);
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await newsService.deleteNews(req.params.id, req.user);
    res.json({ success: true, message: 'ลบข่าวสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const news = await newsService.approveNews(req.params.id, req.user);
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const news = await newsService.rejectNews(req.params.id, req.user);
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบไฟล์รูปภาพ (field name: image)' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const news = await newsService.setNewsImage(req.params.id, imagePath, req.user);

    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, approve, reject, uploadImage };