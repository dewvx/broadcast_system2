require('dotenv').config();
const authService = require('../src/services/auth.service');
const userModel = require('../src/models/user.model');
const pool = require('../src/config/db');

async function main() {
  const [username, password, fullName, roleId] = process.argv.slice(2);

  if (!username || !password || !fullName || !roleId) {
    console.error('ใส่ให้ครบ: node scripts/createAdmin.js <username> <password> <fullName> <roleId>');
    process.exit(1);
  }

  const hashedPassword = await authService.hashPassword(password);
  const userId = await userModel.create({ username, hashedPassword, fullName, roleId: Number(roleId) });
  console.log(`สร้าง user สำเร็จ! user_id = ${userId}`);
  await pool.end();
}

main();