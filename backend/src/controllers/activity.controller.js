const activityService = require('../services/activity.service');

async function getAll(req, res, next) {
  try {
    const activities = await activityService.getAllActivities();
    res.json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const activity = await activityService.getActivityById(req.params.id);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const activity = await activityService.createActivity(req.body, req.user);
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.body);
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await activityService.deleteActivity(req.params.id);
    res.json({ success: true, message: 'ลบกิจกรรมสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };