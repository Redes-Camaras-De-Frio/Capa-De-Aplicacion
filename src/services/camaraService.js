const { pool } = require('../config/database');

async function obtenerTodasLasCamaras(sedeId, usuario) {
  const esAdmin = usuario.rol === 'admin';

  let query, params;
  if (esAdmin) {
    query = sedeId
      ? 'SELECT * FROM camaras WHERE sede_id = $1 ORDER BY id'
      : 'SELECT * FROM camaras ORDER BY id';
    params = sedeId ? [sedeId] : [];
  } else {
    query = sedeId
      ? 'SELECT * FROM camaras WHERE sede_id = $1 AND sede_id = ANY($2) ORDER BY id'
      : 'SELECT * FROM camaras WHERE sede_id = ANY($1) ORDER BY id';
    params = sedeId ? [sedeId, usuario.sedes] : [usuario.sedes];
  }

  const result = await pool.query(query, params);
  return result.rows;
}

async function obtenerCamaraPorId(id, usuario) {
  const esAdmin = usuario.rol === 'admin';
  const query = esAdmin
    ? 'SELECT * FROM camaras WHERE id = $1'
    : 'SELECT * FROM camaras WHERE id = $1 AND sede_id = ANY($2)';
  const params = esAdmin ? [id] : [id, usuario.sedes];
  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

async function crearCamara({ sede_id, nombre, temp_min, temp_max, activa }) {
  const result = await pool.query(
    `INSERT INTO camaras (sede_id, nombre, temp_min, temp_max, activa)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sede_id, nombre, temp_min, temp_max, activa !== undefined ? activa : true]
  );
  return result.rows[0];
}

async function actualizarCamara(id, { nombre, temp_min, temp_max, activa }) {
  const campos = [];
  const params = [];
  let idx = 1;

  if (nombre !== undefined) { campos.push(`nombre = $${idx++}`); params.push(nombre); }
  if (temp_min !== undefined) { campos.push(`temp_min = $${idx++}`); params.push(temp_min); }
  if (temp_max !== undefined) { campos.push(`temp_max = $${idx++}`); params.push(temp_max); }
  if (activa !== undefined) { campos.push(`activa = $${idx++}`); params.push(activa); }

  if (campos.length === 0) return null;

  params.push(id);
  const result = await pool.query(
    `UPDATE camaras SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

async function eliminarCamara(id) {
  const result = await pool.query('DELETE FROM camaras WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = { obtenerTodasLasCamaras, obtenerCamaraPorId, crearCamara, actualizarCamara, eliminarCamara };
