const { pool } = require('../config/database');

async function obtenerResumen(usuario) {
  const esAdmin = usuario.rol === 'admin';

  const [sedes, camaras, sensoresTotal, alertasActivas, ultimasLecturas] = await Promise.all([
    esAdmin
      ? pool.query('SELECT COUNT(*)::int AS total FROM sedes')
      : pool.query('SELECT COUNT(*)::int AS total FROM sedes WHERE id = ANY($1)', [usuario.sedes]),
    esAdmin
      ? pool.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE NOT activa)::int AS inactivas FROM camaras')
      : pool.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE NOT activa)::int AS inactivas FROM camaras WHERE sede_id = ANY($1)', [usuario.sedes]),
    esAdmin
      ? pool.query('SELECT COUNT(*)::int AS total FROM sensores')
      : pool.query(`SELECT COUNT(*)::int AS total FROM sensores s JOIN camaras c ON c.id = s.camara_id WHERE c.sede_id = ANY($1)`, [usuario.sedes]),
    esAdmin
      ? pool.query('SELECT COUNT(*)::int AS total FROM alertas WHERE NOT resuelta')
      : pool.query(`SELECT COUNT(*)::int AS total FROM alertas a JOIN camaras c ON c.id = a.camara_id WHERE NOT a.resuelta AND c.sede_id = ANY($1)`, [usuario.sedes]),
    esAdmin
      ? pool.query(`
        SELECT DISTINCT ON (c.id)
          c.id AS camara_id,
          c.nombre AS camara_nombre,
          l.valor,
          l.registrado_en
        FROM camaras c
        JOIN sensores s ON s.camara_id = c.id AND s.tipo = 'temperatura'
        JOIN lecturas l ON l.sensor_id = s.id
        ORDER BY c.id, l.registrado_en DESC
      `)
      : pool.query(`
        SELECT DISTINCT ON (c.id)
          c.id AS camara_id,
          c.nombre AS camara_nombre,
          l.valor,
          l.registrado_en
        FROM camaras c
        JOIN sensores s ON s.camara_id = c.id AND s.tipo = 'temperatura'
        JOIN lecturas l ON l.sensor_id = s.id
        WHERE c.sede_id = ANY($1)
        ORDER BY c.id, l.registrado_en DESC
      `, [usuario.sedes]),
  ]);

  return {
    sedes: sedes.rows[0].total,
    camaras: camaras.rows[0].total,
    camarasInactivas: camaras.rows[0].inactivas,
    sensores: sensoresTotal.rows[0].total,
    alertasActivas: alertasActivas.rows[0].total,
    ultimasLecturas: ultimasLecturas.rows,
  };
}

module.exports = { obtenerResumen };
