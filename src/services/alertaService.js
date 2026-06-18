const { pool } = require('../config/database');

async function obtenerAlertas({ resuelta, limite = 50 }) {
  let query = `
    SELECT a.*, c.nombre AS camara_nombre, s.tipo AS sensor_tipo
    FROM alertas a
    JOIN camaras c ON c.id = a.camara_id
    LEFT JOIN sensores s ON s.id = a.sensor_id
  `;
  const params = [];
  const conditions = [];

  if (resuelta !== undefined) {
    conditions.push(`a.resuelta = $${params.length + 1}`);
    params.push(resuelta);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.creado_en DESC LIMIT $' + (params.length + 1);
  params.push(limite);

  const result = await pool.query(query, params);
  return result.rows;
}

async function obtenerAlertaPorId(id) {
  const result = await pool.query(
    `SELECT a.*, c.nombre AS camara_nombre, s.tipo AS sensor_tipo
     FROM alertas a
     JOIN camaras c ON c.id = a.camara_id
     LEFT JOIN sensores s ON s.id = a.sensor_id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function resolverAlerta(id, usuarioId) {
  const result = await pool.query(
    `UPDATE alertas
     SET resuelta = TRUE, resuelto_en = NOW(), resuelto_por = $1
     WHERE id = $2 AND resuelta = FALSE
     RETURNING *`,
    [usuarioId, id]
  );
  return result.rows[0] || null;
}

module.exports = { obtenerAlertas, obtenerAlertaPorId, resolverAlerta };
