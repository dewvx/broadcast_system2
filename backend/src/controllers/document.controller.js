const documentService = require('../services/document.service');

async function getAll(req, res, next) {
  try {
    const docs = await documentService.getAllDocuments();
    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const doc = await documentService.getDocumentById(req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบไฟล์ (field name: document)' });
    }

    const doc = await documentService.createDocument({
      docName: req.body.docName,
      file: req.file,
      currentUser: req.user,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await documentService.deleteDocument(req.params.id);
    res.json({ success: true, message: 'ลบเอกสารสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, remove };