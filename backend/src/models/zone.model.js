const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT z.zone_id, z.zone_name, z.created_at,
            COUNT(v.villager_id) AS villager_count
     FROM tb_zone z
     LEFT JOIN tb_villager v ON z.zone_name = v.zone_name AND v.is_deleted = 0
     GROUP BY z.zone_id, z.zone_name, z.created_at
     ORDER BY z.zone_id ASC`
  );
  return rows;
}

async function findById(zoneId) {
  const [rows] = await pool.query(
    `SELECT zone_id, zone_name, created_at FROM tb_zone WHERE zone_id = ?`,
    [zoneId]
  );
  return rows[0] || null;
}

async function findByName(zoneName) {
  const [rows] = await pool.query(
    `SELECT zone_id, zone_name, created_at FROM tb_zone WHERE zone_name = ?`,
    [zoneName]
  );
  return rows[0] || null;
}

async function create(zoneName) {
  const [result] = await pool.query(
    `INSERT INTO tb_zone (zone_name) VALUES (?)`,
    [zoneName]
  );
  return result.insertId;
}

async function update(zoneId, zoneName) {
  await pool.query(
    `UPDATE tb_zone SET zone_name = ? WHERE zone_id = ?`,
    [zoneName, zoneId]
  );
}

async function remove(zoneId) {
  await pool.query(`DELETE FROM tb_zone WHERE zone_id = ?`, [zoneId]);
}

async function countVillagersUsingZone(zoneName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM tb_villager WHERE zone_name = ? AND is_deleted = 0`,
    [zoneName]
  );
  return rows[0].total;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
  countVillagersUsingZone,
};
