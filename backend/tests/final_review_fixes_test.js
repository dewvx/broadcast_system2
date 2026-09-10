require('dotenv').config();
const http = require('http');
const express = require('express');
const pool = require('../src/config/db');
const reportModel = require('../src/models/report.model');
const newsModel = require('../src/models/news.model');
const errorHandler = require('../src/middlewares/errorHandler');

async function runTests() {
  console.log('=== START FINAL REVIEW FIXES TEST ===');
  let server;
  let baseUrl;

  try {
    // 0. Clean any previous test rows safely
    const [oldTestNews] = await pool.query("SELECT news_id FROM tb_news WHERE news_title LIKE '__TEST_NEWS_%'");
    for (const row of oldTestNews) {
      await pool.query('DELETE FROM tb_view_log WHERE news_id = ?', [row.news_id]);
      await pool.query('DELETE FROM tb_news WHERE news_id = ?', [row.news_id]);
    }

    // 1. Testing report.model.js soft-delete filtering
    console.log('\n--- 1. Testing report.model.js soft-delete filtering ---');

    const [cats] = await pool.query('SELECT category_id FROM tb_category LIMIT 1');
    const [users] = await pool.query('SELECT user_id FROM tb_user LIMIT 1');
    const [vils] = await pool.query('SELECT villager_id FROM tb_villager LIMIT 1');
    if (!cats.length || !users.length) {
      throw new Error('Database must have at least one category and one user');
    }
    const catId = cats[0].category_id;
    const userId = users[0].user_id;
    const vilId = vils.length ? vils[0].villager_id : null;

    const testTitle = `__TEST_NEWS_AUDIT_${Date.now()}`;
    const [newsResult] = await pool.query(
      `INSERT INTO tb_news (category_id, news_title, news_content, news_status, is_deleted, created_by)
       VALUES (?, ?, 'Content for audit test', 'Approved', 0, ?)`,
      [catId, testTitle, userId]
    );
    const testNewsId = newsResult.insertId;
    console.log(`Created test news ID: ${testNewsId} with status 'Approved'`);

    for (let i = 0; i < 10; i++) {
      await pool.query('INSERT INTO tb_view_log (news_id, villager_id) VALUES (?, ?)', [testNewsId, vilId]);
    }
    console.log(`Added 10 view logs for news ID: ${testNewsId}`);

    const countBefore = await reportModel.countNewsByStatus();
    console.log('countNewsByStatus before soft-delete:', countBefore);

    const topNewsBefore = await reportModel.getTopViewedNews(5);
    const foundInTopBefore = topNewsBefore.find((n) => n.news_id === testNewsId);
    if (!foundInTopBefore) {
      throw new Error('FAIL: Test news should be in top viewed news before soft delete');
    }
    console.log(`PASS: Test news found in top viewed with ${foundInTopBefore.view_count} views`);

    await newsModel.remove(testNewsId);
    console.log(`Soft-deleted test news ID: ${testNewsId} via newsModel.remove()`);

    const countAfter = await reportModel.countNewsByStatus();
    console.log('countNewsByStatus after soft-delete:', countAfter);
    if (countAfter.Approved !== countBefore.Approved - 1) {
      throw new Error(
        `FAIL: countNewsByStatus still counting soft-deleted news! Before: ${countBefore.Approved}, After: ${countAfter.Approved}`
      );
    }
    console.log('PASS: countNewsByStatus correctly excludes soft-deleted news (Approved count decremented)');

    const topNewsAfter = await reportModel.getTopViewedNews(10);
    const foundInTopAfter = topNewsAfter.find((n) => n.news_id === testNewsId);
    if (foundInTopAfter) {
      throw new Error('FAIL: Soft-deleted news still appears in getTopViewedNews!');
    }
    console.log('PASS: Soft-deleted news completely disappeared from getTopViewedNews');

    await pool.query('DELETE FROM tb_view_log WHERE news_id = ?', [testNewsId]);
    await pool.query('DELETE FROM tb_news WHERE news_id = ?', [testNewsId]);
    console.log('Cleaned up test news and views from DB');

    // 2. Testing login rate limiter on POST /api/auth/login
    console.log('\n--- 2. Testing login rate limiter on POST /api/auth/login ---');
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../src/routes/auth.routes'));
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    function sendLoginRequest() {
      return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ username: 'nonexistent_test_user', password: 'wrongpassword123' });
        const req = http.request(
          `${baseUrl}/api/auth/login`,
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

    let hit429 = false;
    for (let i = 1; i <= 6; i++) {
      const res = await sendLoginRequest();
      console.log(`Login attempt #${i} -> Status: ${res.statusCode} | Message: ${res.body.message}`);
      if (res.statusCode === 429) {
        hit429 = true;
        console.log(`Rate limit triggered at attempt #${i} as expected! Message: "${res.body.message}"`);
        break;
      }
    }

    if (!hit429) {
      throw new Error('FAIL: Rate limiter did not return 429 after limit exceeded!');
    }
    console.log('PASS: Login rate limiter working properly (returned 429 Too Many Requests)');

    console.log('\n=== ALL FINAL REVIEW FIXES TESTS PASSED SUCCESSFULLY! ===');
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
