const userService = require('../services/user.service');

async function getAll(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function getRoles(req, res, next) {
  try {
    const roles = await userService.getAllRoles();
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
}

async function getPublicContacts(req, res, next) {
  try {
    const contacts = await userService.getPublicContacts();
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user, message: 'สร้างผู้ใช้งานสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.json({ success: true, data: user, message: 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteUser(req.params.id, req.user);
    res.json({ success: true, message: 'ลบผู้ใช้งานสำเร็จ' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getRoles,
  getPublicContacts,
  create,
  update,
  remove,
};
