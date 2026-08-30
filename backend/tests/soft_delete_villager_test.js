const pool = require('../src/config/db');
const villagerModel = require('../src/models/villager.model');
const villagerService = require('../src/services/villager.service');
const broadcastModel = require('../src/models/broadcast.model');
const reportModel = require('../src/models/report.model');

async function runTests() {
  console.log('=== STARTING SOFT DELETE VILLAGER TESTS ===\n');

  const testLineId1 = 'U_TEST_SOFT_DEL_1_' + Date.now();
  const testLineId2 = 'U_TEST_SOFT_DEL_2_' + Date.now();
  const testZone = 'หมู่ 999_TEST';

  let villagerId1, villagerId2, testNewsId;

  try {
    // 0. Setup test data
    console.log('[Setup] Creating test news and villagers...');
    const [newsRes] = await pool.query(
      `INSERT INTO tb_news (news_title, news_content, category_id, news_status, created_by, is_deleted)
       VALUES ('Test News for Soft Delete', 'Content', 1, 'Approved', 1, 0)`
    );
    testNewsId = newsRes.insertId;

    villagerId1 = await villagerModel.create({
      lineUserId: testLineId1,
      displayName: 'Test Villager 1',
      firstName: 'สมชาย',
      lastName: 'ทดสอบหนึ่ง',
      houseNumber: '111/1',
      zoneName: testZone,
      pdpaConsentAt: new Date(),
    });

    villagerId2 = await villagerModel.create({
      lineUserId: testLineId2,
      displayName: 'Test Villager 2',
      firstName: 'สมหญิง',
      lastName: 'ทดสอบสอง',
      houseNumber: '111/2',
      zoneName: testZone,
      pdpaConsentAt: new Date(),
    });

    // Add view log for villager 1
    await pool.query(
      `INSERT INTO tb_view_log (news_id, villager_id, view_timestamp) VALUES (?, ?, NOW())`,
      [testNewsId, villagerId1]
    );

    const initialTotalViews = await reportModel.sumTotalViews();
    console.log(`[Setup] Villager 1 (ID: ${villagerId1}) created with 1 view_log. Villager 2 (ID: ${villagerId2}) created.`);
    console.log(`[Setup] Initial Total Views: ${initialTotalViews}\n`);

    // TEST 1: ลบลูกบ้านที่เคยดูข่าวไปแล้ว (มี record ใน tb_view_log)
    console.log('--- TEST 1: Soft delete villager who has view_log records ---');
    await villagerService.deleteVillagerByAdmin(villagerId1);
    console.log('✓ Successfully called deleteVillagerByAdmin without FK constraint error!');

    const [deletedRow] = await pool.query(
      `SELECT is_deleted, is_active FROM tb_villager WHERE villager_id = ?`,
      [villagerId1]
    );
    console.log(`✓ DB verification: is_deleted = ${deletedRow[0].is_deleted}, is_active = ${deletedRow[0].is_active}`);
    if (deletedRow[0].is_deleted !== 1) throw new Error('is_deleted is not 1!');

    // TEST 2: ลูกบ้านที่ถูกลบ ต้องหายไปจาก findAll()
    console.log('\n--- TEST 2: Soft deleted villager must not appear in findAll() ---');
    const allVillagers = await villagerModel.findAll();
    const found1 = allVillagers.find((v) => v.villager_id === villagerId1);
    const found2 = allVillagers.find((v) => v.villager_id === villagerId2);
    console.log(`✓ Villager 1 found in findAll(): ${Boolean(found1)} (Expected: false)`);
    console.log(`✓ Villager 2 found in findAll(): ${Boolean(found2)} (Expected: true)`);
    if (found1) throw new Error('Villager 1 should NOT be returned by findAll()');
    if (!found2) throw new Error('Villager 2 should be returned by findAll()');

    // TEST 3: เช็คว่า findByLineUserId สำหรับลูกบ้านที่ถูกลบคืนค่า null (เหมือนยังไม่เคยลงทะเบียน)
    console.log('\n--- TEST 3: Deleted LINE account should return isNewUser = true on check ---');
    const checkResult1 = await villagerModel.findByLineUserId(testLineId1);
    console.log(`✓ findByLineUserId for deleted villager: ${JSON.stringify(checkResult1)} (Expected: null)`);
    if (checkResult1 !== null) throw new Error('findByLineUserId should return null for deleted user');

    // Re-register test (making sure UNIQUE constraint doesn't crash and restores record)
    console.log('  Testing re-registration of soft-deleted LINE user...');
    const reRegisteredId = await villagerModel.create({
      lineUserId: testLineId1,
      displayName: 'Test Villager 1 (Re-registered)',
      firstName: 'สมชาย',
      lastName: 'ลงใหม่',
      houseNumber: '111/1 ใหม่',
      zoneName: testZone,
      pdpaConsentAt: new Date(),
    });
    console.log(`✓ Re-registered villager ID: ${reRegisteredId} (Preserved same ID: ${reRegisteredId === villagerId1})`);
    const checkRestored = await villagerModel.findByLineUserId(testLineId1);
    console.log(`✓ Restored villager data: is_deleted = 0, name = ${checkRestored.first_name} ${checkRestored.last_name}`);
    if (!checkRestored || checkRestored.last_name !== 'ลงใหม่') throw new Error('Failed to restore and update villager');

    // Re-delete villager 1 to continue tests 4 and 5
    await villagerService.deleteVillagerByAdmin(villagerId1);

    // TEST 4: เช็คว่า tb_view_log เดิมยังอยู่ครบ ไม่หาย (Dashboard totalViews ไม่ลดลง)
    console.log('\n--- TEST 4: tb_view_log must remain intact & sumTotalViews preserved ---');
    const [viewLogs] = await pool.query(
      `SELECT * FROM tb_view_log WHERE villager_id = ?`,
      [villagerId1]
    );
    console.log(`✓ View log count for deleted villager: ${viewLogs.length} (Expected: 1)`);
    if (viewLogs.length !== 1) throw new Error('View logs for deleted villager was lost!');

    const currentTotalViews = await reportModel.sumTotalViews();
    console.log(`✓ sumTotalViews after soft delete: ${currentTotalViews} (Matches initial: ${currentTotalViews === initialTotalViews})`);
    if (currentTotalViews !== initialTotalViews) throw new Error('Total views changed unexpectedly');

    // TEST 5: ทดสอบ broadcast ไปยัง zone ที่มีทั้งคนถูกลบและคนปกติปนกัน
    console.log('\n--- TEST 5: Broadcast filter must exclude soft-deleted villagers ---');
    const targetLineIds = await broadcastModel.getVillagerLineIds(testZone);
    console.log(`✓ Broadcast target lineIds in zone '${testZone}':`, targetLineIds);
    const hasDeleted = targetLineIds.includes(testLineId1);
    const hasActive = targetLineIds.includes(testLineId2);
    console.log(`✓ Contains soft-deleted user (Villager 1): ${hasDeleted} (Expected: false)`);
    console.log(`✓ Contains active user (Villager 2): ${hasActive} (Expected: true)`);
    if (hasDeleted) throw new Error('Broadcast targets should NOT include soft-deleted user');
    if (!hasActive) throw new Error('Broadcast targets should include active user');

    console.log('\n=== ALL 5 TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    // Cleanup test data
    console.log('\n[Cleanup] Cleaning up test records...');
    if (testNewsId) {
      await pool.query(`DELETE FROM tb_view_log WHERE news_id = ?`, [testNewsId]);
      await pool.query(`DELETE FROM tb_news WHERE news_id = ?`, [testNewsId]);
    }
    if (villagerId1) await pool.query(`DELETE FROM tb_villager WHERE villager_id = ?`, [villagerId1]);
    if (villagerId2) await pool.query(`DELETE FROM tb_villager WHERE villager_id = ?`, [villagerId2]);
    console.log('[Cleanup] Done.');
  }

  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
