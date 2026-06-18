const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

async function registrar({ nombre, email, password, rol, sedes }) {
  const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  if (existe.rows[0]) {
    return { error: 'El email ya está registrado' };
  }

  const password_hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, email, rol, activo, created_at`,
    [nombre, email, password_hash, rol]
  );

  const usuario = result.rows[0];

  if (sedes && Array.isArray(sedes) && sedes.length > 0) {
    const values = sedes.map((_, i) => `($1, $${i + 2})`).join(', ');
    await pool.query(
      `INSERT INTO usuario_sede (usuario_id, sede_id) VALUES ${values}`,
      [usuario.id, ...sedes]
    );
  }

  return { usuario: { ...usuario, sedes: sedes || [] } };
}

async function login(email, password) {
  const result = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.password_hash, u.rol, u.activo,
            CASE WHEN u.rol = 'admin' THEN NULL
                 ELSE array_agg(us.sede_id) FILTER (WHERE us.sede_id IS NOT NULL)
            END AS sedes
     FROM usuarios u
     LEFT JOIN usuario_sede us ON us.usuario_id = u.id
     WHERE u.email = $1
     GROUP BY u.id`,
    [email]
  );

  const usuario = result.rows[0];
  if (!usuario) {
    return { error: 'Credenciales inválidas' };
  }

  if (!usuario.activo) {
    return { error: 'Cuenta desactivada' };
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    return { error: 'Credenciales inválidas' };
  }

  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    sedes: usuario.sedes,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sedes: usuario.sedes,
    },
  };
}

module.exports = { login, registrar };
