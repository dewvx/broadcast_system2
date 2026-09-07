const pool = require('../src/config/db');
const chatbotFaqModel = require('../src/models/chatbotFaq.model');

async function runTests() {
  console.log('=== STARTING CHATBOT FAQ BIDIRECTIONAL MATCH TESTS ===\n');

  let testUserId;
  let createdFaqIds = [];

  try {
    // 0. Find an existing user or create one for test setup
    const [users] = await pool.query('SELECT user_id FROM tb_user LIMIT 1');
    if (users.length > 0) {
      testUserId = users[0].user_id;
    } else {
      // Create a temporary user if none exists
      const [insertUser] = await pool.query(
        `INSERT INTO tb_user (username, password, full_name, phone_number, position_title, role_id)
         VALUES ('test_faq_user', 'hashed_pass_here', 'FAQ Test User', '0000000000', 'Tester', 1)`
      );
      testUserId = insertUser.insertId;
      console.log(`[Setup] Created temporary user with ID: ${testUserId}`);
    }

    // Clear any conflicting test FAQs just in case
    await pool.query("DELETE FROM tb_chatbot_faq WHERE question_key IN ('เวลาเปิดทำการ', 'เวลาเปิด', 'เวลาปิดทำการ', 'แจ้งไฟเสีย')");

    // Insert test FAQ data
    // Case A: เวลาเปิดทำการ
    const faqId1 = await chatbotFaqModel.create({
      questionKey: 'เวลาเปิดทำการ',
      answerText: 'เราเปิดทำการจันทร์ถึงศุกร์ เวลา 08:30 - 16:30 น.',
      createdBy: testUserId
    });
    createdFaqIds.push(faqId1);

    // Case B: เวลาเปิด
    const faqId2 = await chatbotFaqModel.create({
      questionKey: 'เวลาเปิด',
      answerText: 'เวลาเปิดทั่วไปคือ 09:00 น.',
      createdBy: testUserId
    });
    createdFaqIds.push(faqId2);

    // Case C: เวลาปิดทำการ
    const faqId3 = await chatbotFaqModel.create({
      questionKey: 'เวลาปิดทำการ',
      answerText: 'เราปิดทำการเวลา 16:30 น.',
      createdBy: testUserId
    });
    createdFaqIds.push(faqId3);

    // Case D: แจ้งไฟเสีย
    const faqId4 = await chatbotFaqModel.create({
      questionKey: 'แจ้งไฟเสีย',
      answerText: 'หากพบไฟสาธารณะเสีย แจ้งได้ที่เบอร์ 02-XXX-XXXX',
      createdBy: testUserId
    });
    createdFaqIds.push(faqId4);

    console.log(`[Setup] Created ${createdFaqIds.length} test FAQ records.\n`);

    // Helper to print and assert matching
    async function testMatch(messageText, expectedAnswerKeyword) {
      const match = await chatbotFaqModel.findMatchByMessage(messageText);
      const matchedKey = match ? match.question_key : null;
      const matchedAnswer = match ? match.answer_text : null;
      
      console.log(`Query: "${messageText}" (Length: ${messageText.length})`);
      console.log(`  -> Matched Keyword: ${matchedKey ? `"${matchedKey}"` : 'NULL'}`);
      console.log(`  -> Matched Answer:  ${matchedAnswer ? `"${matchedAnswer}"` : 'NULL'}`);

      if (expectedAnswerKeyword === null) {
        if (match !== null) {
          throw new Error(`Expected NO MATCH, but matched "${matchedKey}"`);
        }
        console.log('  ✓ Correctly returned NULL (No match)\n');
      } else {
        if (match === null) {
          throw new Error(`Expected match with keyword "${expectedAnswerKeyword}", but got NULL`);
        }
        if (!matchedKey.includes(expectedAnswerKeyword)) {
          throw new Error(`Expected match with keyword containing "${expectedAnswerKeyword}", but got "${matchedKey}"`);
        }
        console.log(`  ✓ Successfully matched expected keyword "${expectedAnswerKeyword}"\n`);
      }
      return match;
    }

    // TEST 1: พิมพ์ "เวลาเปิด" (สั้นกว่า keyword "เวลาเปิดทำการ")
    // -> ต้องตอบ FAQ "เวลาเปิดทำการ" หรือ "เวลาเปิด" (เนื่องจากซ้อนกันและเรียงตามความยาว ตัวที่ยาวกว่า/เจาะจงกว่าต้องชนะ)
    console.log('--- TEST 1: Message shorter than keyword ("เวลาเปิด" vs "เวลาเปิดทำการ") ---');
    await testMatch('เวลาเปิด', 'เวลาเปิดทำการ');

    // TEST 2: พิมพ์คำที่สั้นกว่า 4 ตัวอักษร -> ต้องไม่ match มั่วซั่ว
    // ตัวอย่าง: "ปิด" (ยาว 3 ตัวอักษร) -> ต้องได้ NULL (ไม่ไปจับคู่กับ "เวลาปิดทำการ" เพราะสั้นเกินไป)
    console.log('--- TEST 2: Short messages (< 4 chars) should NOT match ---');
    console.log('Testing "ปิด" (Length: 3)...');
    await testMatch('ปิด', null);

    console.log('Testing "ไฟ" (Length: 2)...');
    await testMatch('ไฟ', null);

    // TEST 3: พิมพ์ข้อความยาวที่มี keyword เต็มอยู่ข้างใน (พฤติกรรมเดิม)
    console.log('--- TEST 3: Long messages containing keyword (Original behavior) ---');
    await testMatch('อยากทราบเวลาเปิดทำการหน่อยครับ', 'เวลาเปิดทำการ');
    await testMatch('ขอเบอร์สำหรับแจ้งไฟเสียหน่อย', 'แจ้งไฟเสีย');

    // TEST 4: ถ้ามี 2 FAQ ที่ keyword ซ้อนกัน พิมพ์ข้อความที่ match ทั้งคู่ได้ -> ต้องตอบจาก keyword ที่ยาวกว่า/เจาะจงกว่าเสมอ
    console.log('--- TEST 4: Overlapping keywords (Should select longer/most specific) ---');
    // พิมพ์ "ขอเวลาเปิดทำการด้วยจ้า" -> "เวลาเปิด" และ "เวลาเปิดทำการ" คู่นี้มีอยู่ใน DB และ match ทั้งคู่
    // "เวลาเปิดทำการ" (ความยาว 13 ตัวอักษร) ยาวกว่า "เวลาเปิด" (ความยาว 8 ตัวอักษร) ต้องได้รับการเลือก
    await testMatch('ขอเวลาเปิดทำการด้วยจ้า', 'เวลาเปิดทำการ');

    console.log('=== ALL CHATBOT FAQ TESTS PASSED SUCCESSFULLY! ===');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    console.log('\n[Cleanup] Cleaning up test records...');
    if (createdFaqIds.length > 0) {
      await pool.query('DELETE FROM tb_chatbot_faq WHERE faq_id IN (?)', [createdFaqIds]);
    }
    // If we created a temporary user, clean it up
    await pool.query("DELETE FROM tb_user WHERE username = 'test_faq_user'");
    console.log('[Cleanup] Done.');
  }

  process.exit(0);
}

runTests();
