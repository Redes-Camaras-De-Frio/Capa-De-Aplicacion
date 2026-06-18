const { pool } = require('../config/database');

async function obtenerLecturas(sensorId, limite = 50) {
  const query = sensorId
    ? `SELECT l.*, s.tipo AS sensor_tipo, s.unidad
       FROM lecturas l
       JOIN sensores s ON s.id = l.sensor_id
       WHERE l.sensor_id = $1
       ORDER BY l.registrado_en DESC
       LIMIT $2`
    : `SELECT l.*, s.tipo AS sensor_tipo, s.unidad
       FROM lecturas l
       JOIN sensores s ON s.id = l.sensor_id
       ORDER BY l.registrado_en DESC
       LIMIT $1`;
  const params = sensorId ? [sensorId, limite] : [limite];
  const result = await pool.query(query, params);
  return result.rows;
}

async function obtenerUltimasLecturasPorCamara() {
  const result = await pool.query(`
    SELECT DISTINCT ON (c.id)
      c.id AS camara_id,
      c.nombre AS camara_nombre,
      s.id AS sensor_id,
      s.tipo AS sensor_tipo,
      l.valor,
      s.unidad,
      l.registrado_en
    FROM camaras c
    JOIN sensores s ON s.camara_id = c.id AND s.tipo = 'temperatura'
    JOIN lecturas l ON l.sensor_id = s.id
    ORDER BY c.id, l.registrado_en DESC
  `);
  return result.rows;
}

module.exports = { obtenerLecturas, obtenerUltimasLecturasPorCamara };
