const { pool } = require('../config/database');

async function obtenerLecturas(sensorId, limite = 50, usuario) {
  const esAdmin = usuario.rol === 'admin';
  const sedeJoin = ' JOIN camaras c ON c.id = s.camara_id';
  const sedeFilter = esAdmin ? '' : ' AND c.sede_id = ANY($N)';

  const query = sensorId
    ? `SELECT l.*, s.tipo AS sensor_tipo, s.unidad
       FROM lecturas l
       JOIN sensores s ON s.id = l.sensor_id${sedeJoin}
       WHERE l.sensor_id = $1${sedeFilter.replace('$N', '$3')}
       ORDER BY l.registrado_en DESC
       LIMIT $2`
    : `SELECT l.*, s.tipo AS sensor_tipo, s.unidad
       FROM lecturas l
       JOIN sensores s ON s.id = l.sensor_id${sedeJoin}
       ${sedeFilter ? 'WHERE ' + sedeFilter.replace('$N', '$2') : ''}
       ORDER BY l.registrado_en DESC
       LIMIT $1`;

  const params = esAdmin
    ? (sensorId ? [sensorId, limite] : [limite])
    : (sensorId ? [sensorId, limite, usuario.sedes] : [limite, usuario.sedes]);

  const result = await pool.query(query, params);
  return result.rows;
}

async function obtenerUltimasLecturasPorCamara(usuario) {
  const esAdmin = usuario.rol === 'admin';
  const query = esAdmin
    ? `
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
    `
    : `
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
      WHERE c.sede_id = ANY($1)
      ORDER BY c.id, l.registrado_en DESC
    `;
  const result = await pool.query(query, esAdmin ? [] : [usuario.sedes]);
  return result.rows;
}

module.exports = { obtenerLecturas, obtenerUltimasLecturasPorCamara };
