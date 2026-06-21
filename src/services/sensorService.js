const { pool } = require('../config/database');

async function obtenerTodosLosSensores(camaraId, usuario) {
  const esAdmin = usuario.rol === 'admin';
  const sedeFilter = esAdmin ? '' : ' AND c.sede_id = ANY($N)';

  const query = camaraId
    ? `SELECT s.*, c.nombre AS camara_nombre
       FROM sensores s
       JOIN camaras c ON c.id = s.camara_id
       WHERE s.camara_id = $1${sedeFilter.replace('$N', '$2')}
       ORDER BY s.id`
    : `SELECT s.*, c.nombre AS camara_nombre
       FROM sensores s
       JOIN camaras c ON c.id = s.camara_id
       ${sedeFilter ? 'WHERE ' + sedeFilter.replace('$N', '$1').substring(5) : ''}
       ORDER BY s.id`;

  const params = esAdmin
    ? (camaraId ? [camaraId] : [])
    : (camaraId ? [camaraId, usuario.sedes] : [usuario.sedes]);

  const result = await pool.query(query, params);
  return result.rows;
}

async function obtenerSensorPorId(id, usuario) {
  const esAdmin = usuario.rol === 'admin';
  const query = esAdmin
    ? `SELECT s.*, c.nombre AS camara_nombre
       FROM sensores s
       JOIN camaras c ON c.id = s.camara_id
       WHERE s.id = $1`
    : `SELECT s.*, c.nombre AS camara_nombre
       FROM sensores s
       JOIN camaras c ON c.id = s.camara_id
       WHERE s.id = $1 AND c.sede_id = ANY($2)`;
  const params = esAdmin ? [id] : [id, usuario.sedes];
  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

async function crearSensor({ camara_id, tipo, unidad, activo }) {
  const result = await pool.query(
    `INSERT INTO sensores (camara_id, tipo, unidad, activo)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [camara_id, tipo, unidad, activo !== undefined ? activo : true]
  );
  return result.rows[0];
}

async function actualizarSensor(id, { tipo, unidad, activo }) {
  const campos = [];
  const params = [];
  let idx = 1;

  if (tipo !== undefined) { campos.push(`tipo = $${idx++}`); params.push(tipo); }
  if (unidad !== undefined) { campos.push(`unidad = $${idx++}`); params.push(unidad); }
  if (activo !== undefined) { campos.push(`activo = $${idx++}`); params.push(activo); }

  if (campos.length === 0) return null;

  params.push(id);
  const result = await pool.query(
    `UPDATE sensores SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

async function eliminarSensor(id) {
  const result = await pool.query(
    'UPDATE sensores SET activo = false WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { obtenerTodosLosSensores, obtenerSensorPorId, crearSensor, actualizarSensor, eliminarSensor };
