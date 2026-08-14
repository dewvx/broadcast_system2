const documentModel = require('../models/document.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function getAllDocuments() {
  return documentModel.findAll();
}

async function getDocumentById(docId) {
  const doc = await documentModel.findById(docId);
  if (!doc) throwError('ไม่พบเอกสารนี้', 404);
  return doc;
}

async function createDocument({ docName, file, currentUser }) {
  if (!docName || !docName.trim()) {
    throwError('กรุณาระบุชื่อเอกสาร', 400);
  }
  if (!file) {
    throwError('กรุณาแนบไฟล์เอกสาร', 400);
  }

  const docFilePath = `/uploads/${file.filename}`;
  const docId = await documentModel.create({
    docName: docName.trim(),
    docFilePath,
    createdBy: currentUser.userId,
  });

  return documentModel.findById(docId);
}

async function deleteDocument(docId) {
  const doc = await documentModel.findById(docId);
  if (!doc) throwError('ไม่พบเอกสารนี้', 404);

  await documentModel.remove(docId);
  // หมายเหตุ: ไม่ได้ลบไฟล์จริงออกจาก public/uploads/ ด้วย (แค่ลบ record ใน DB)
  // ทำแบบ "soft" ไว้ก่อน กันเผลอลบไฟล์ผิด - ถ้าจะลบไฟล์จริงด้วย ต้องเพิ่ม fs.unlink() ทีหลัง
}

module.exports = { getAllDocuments, getDocumentById, createDocument, deleteDocument };