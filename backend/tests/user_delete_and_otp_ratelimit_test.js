require('dotenv').config();
const http = require('http');
const express = require('express');
const pool = require('../src/config/db');
const userService = require('../src/services/user.service');
const userModel = require('../src/models/user.model');
const errorHandler = require('../src/middlewares/errorHandler');

async function runTests() {
  console.log('=== START USER DELETE & OTP RATE LIMIT TESTS ===');
  let server;

  try {
    // -------------------------------------------------------------
    // Test 1: FK constraint protection when deleting user
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing user deletion FK constraint protection ---');

    // 1.1 Clean any old test users
    await pool.query("DELETE FROM tb_news WHERE news_title LIKE '__TEST_USER_NEWS_%'");
    await pool.query("DELETE FROM tb_user WHERE username LIKE '__test_user_%'");

    // 1.2 Get Admin user and role IDs
    const [adminRoleRows] = await pool.query("SELECT role_id FROM tb_role WHERE role_name = 'Admin' LIMIT 1");
    const [leaderRoleRows] = await pool.query("SELECT role_id FROM tb_role WHERE role_name = 'Leader' LIMIT 1");
    const [catRows] = await pool.query('SELECT category_id FROM tb_category LIMIT 1');

    const adminRoleId = adminRoleRows[0].role_id;
    const leaderRoleId = leaderRoleRows[0].role_id;
    const categoryId = catRows[0].category_id;

    // Fake admin actor
    const adminActor = { userId: 999999, roleName: 'Admin' };

    // 1.3 Create User A (who will own news)
    const userA = await userService.createUser({
      username: `__test_user_a_${Date.now()}`,
      password: 'password123',
      fullName: 'Test Leader A',
      roleId: leaderRoleId,
    });
    console.log(`Created User A (ID: ${userA.user_id}, Username: ${userA.username})`);

    // Create a news authored by User A
    const testNewsTitle = `__TEST_USER_NEWS_${Date.now()}`;
    const [newsResult] = await pool.query(
      `INSERT INTO tb_news (category_id, news_title, news_content, news_status, created_by)
       VALUES (?, ?, 'Test news for user FK check', 'Pending', ?)`,
      [categoryId, testNewsTitle, userA.user_id]
    );
    const newsId = newsResult.insertId;
    console.log(`Created test news (ID: ${newsId}) authored by User A`);

    // 1.4 Try to delete User A -> Expect 400 error with message
    let blockedProperly = false;
    try {
      await userService.deleteUser(userA.user_id, adminActor);
    } catch (err) {
      console.log(`Caught expected error when deleting User A: [${err.statusCode}] ${err.message}`);
      if (
        err.statusCode === 400 &&
        err.message.includes('ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีข่าว/กิจกรรม/เอกสารที่สร้างไว้อยู่ในระบบ')
      ) {
        blockedProperly = true;
      } else {
        throw new Error(`Unexpected error thrown: ${err.message}`);
      }
    }

    if (!blockedProperly) {
      throw new Error('FAIL: User A with authored news should NOT be deleted!');
    }
    console.log('PASS: User A deletion correctly blocked with 400 Bad Request');

    // 1.5 Create User B (no content) and delete User B
    const userB = await userService.createUser({
      username: `__test_user_b_${Date.now()}`,
      password: 'password123',
      fullName: 'Test Leader B (No Content)',
      roleId: leaderRoleId,
    });
    console.log(`Created User B (ID: ${userB.user_id}, Username: ${userB.username})`);

    await userService.deleteUser(userB.user_id, adminActor);
    const checkUserB = await userModel.findById(userB.user_id);
    if (checkUserB) {
      throw new Error('FAIL: User B without content should be deleted successfully!');
    }
    console.log('PASS: User B without content was deleted successfully');

    // Clean up User A and News
    await pool.query('DELETE FROM tb_news WHERE news_id = ?', [newsId]);
    await userService.deleteUser(userA.user_id, adminActor);
    const checkUserA = await userModel.findById(userA.user_id);
    if (checkUserA) {
      throw new Error('FAIL: User A should be deletable after news is cleaned up!');
    }
    console.log('PASS: User A successfully deleted after content removed');

    // -------------------------------------------------------------
    // Test 2: IP-based rate limiting on POST /api/villager/send-otp
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing IP-based rate limit on POST /api/villager/send-otp ---');

    const app = express();
    app.use(express.json());
    app.use('/api/villager', require('../src/routes/villager.routes'));
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    function sendOtpRequest() {
      return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ idToken: 'invalid_dummy_token_for_ratelimit_test' });
        const req = http.request(
          `${baseUrl}/api/villager/send-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve({ statusCode: res.statusCode, body: JSON.parse(data || '{}') });
              } catch (e) {
                resolve({ statusCode: res.statusCode, body: { raw: data } });
              }
            });
          }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    }

    let hitOtp429 = false;
    for (let i = 1; i <= 12; i++) {
      const res = await sendOtpRequest();
      console.log(`Send-OTP attempt #${i} -> Status: ${res.statusCode} | Message: ${res.body.message || res.body.error}`);
      if (res.statusCode === 429) {
        hitOtp429 = true;
        console.log(`Rate limit triggered at attempt #${i} as expected! Message: "${res.body.message}"`);
        break;
      }
    }

    if (!hitOtp429) {
      throw new Error('FAIL: Villager OTP rate limiter did not return 429 after 10 attempts!');
    }
    console.log('PASS: Villager OTP rate limiter working properly (returned 429 Too Many Requests at request 11)');

    console.log('\n=== ALL USER DELETE & OTP RATE LIMIT TESTS PASSED! ===');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  }
}

runTests();
