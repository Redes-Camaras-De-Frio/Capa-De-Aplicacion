const { pool } = require('../config/database');

async function obtenerTodasLasSedes() {
  const result = await pool.query(
    'SELECT id, nombre, tipo, direccion, created_at FROM sedes ORDER BY id'
  );
  return result.rows;
}

async function obtenerSedePorId(id) {
  const result = await pool.query(
    'SELECT id, nombre, tipo, direccion, created_at FROM sedes WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function crearSede({ nombre, tipo, direccion }) {
  const result = await pool.query(
    `INSERT INTO sedes (nombre, tipo, direccion)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, tipo, direccion, created_at`,
    [nombre, tipo, direccion || null]
  );
  return result.rows[0];
}

async function actualizarSede(id, { nombre, tipo, direccion }) {
  const result = await pool.query(
    `UPDATE sedes
     SET nombre = COALESCE($1, nombre),
         tipo = COALESCE($2, tipo),
         direccion = COALESCE($3, direccion)
     WHERE id = $4
     RETURNING id, nombre, tipo, direccion, created_at`,
    [nombre, tipo, direccion, id]
  );
  return result.rows[0] || null;
}

async function eliminarSede(id) {
  const result = await pool.query(
    'DELETE FROM sedes WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { obtenerTodasLasSedes, obtenerSedePorId, crearSede, actualizarSede, eliminarSede };
