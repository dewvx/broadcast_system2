const activityModel = require('../models/activity.model');

function throwError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

async function getAllActivities() {
  return activityModel.findAll();
}

async function getActivityById(actId) {
  const activity = await activityModel.findById(actId);
  if (!activity) throwError('ไม่พบกิจกรรมนี้', 404);
  return activity;
}

async function createActivity(data, currentUser) {
  const { actTitle, actDate, actLocation } = data;

  if (!actTitle || !actDate || !actLocation) {
    throwError('กรุณากรอกชื่อกิจกรรม วันที่ และสถานที่ให้ครบ', 400);
  }

  const actId = await activityModel.create({ ...data, createdBy: currentUser.userId });
  return activityModel.findById(actId);
}

async function updateActivity(actId, data) {
  const activity = await activityModel.findById(actId);
  if (!activity) throwError('ไม่พบกิจกรรมนี้', 404);

  const { actTitle, actDate, actLocation } = data;
  if (!actTitle || !actDate || !actLocation) {
    throwError('กรุณากรอกชื่อกิจกรรม วันที่ และสถานที่ให้ครบ', 400);
  }

  await activityModel.update(actId, data);
  return activityModel.findById(actId);
}

async function deleteActivity(actId) {
  const activity = await activityModel.findById(actId);
  if (!activity) throwError('ไม่พบกิจกรรมนี้', 404);

  await activityModel.remove(actId);
}

module.exports = { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity };