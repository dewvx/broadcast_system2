require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'village_news',
  });

  console.log('Connected to MySQL.');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tb_zone (
      zone_id INT AUTO_INCREMENT PRIMARY KEY,
      zone_name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('tb_zone created / verified.');

  const sampleZones = ['ซอย 1', 'ซอย 2', 'ซอย 3', 'ซอย 4'];
  for (const z of sampleZones) {
    await connection.query('INSERT IGNORE INTO tb_zone (zone_name) VALUES (?)', [z]);
  }
  console.log('Sample zones seeded.');

  const [cols] = await connection.query("SHOW COLUMNS FROM tb_user LIKE 'phone_number'");
  if (cols.length === 0) {
    await connection.query('ALTER TABLE tb_user ADD COLUMN phone_number VARCHAR(20) NULL AFTER full_name');
    console.log('Added phone_number to tb_user.');
  } else {
    console.log('phone_number column already exists.');
  }

  const [posCols] = await connection.query("SHOW COLUMNS FROM tb_user LIKE 'position_title'");
  if (posCols.length === 0) {
    await connection.query('ALTER TABLE tb_user ADD COLUMN position_title VARCHAR(100) NULL AFTER phone_number');
    console.log('Added position_title to tb_user.');
  } else {
    console.log('position_title column already exists.');
  }

  await connection.end();
  console.log('Migration finished successfully.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
