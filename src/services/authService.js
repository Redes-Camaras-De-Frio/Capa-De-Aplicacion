const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

async function registrar({ nombre, email, password, rol }) {
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

  return { usuario: result.rows[0] };
}

async function login(email, password) {
  const result = await pool.query(
    'SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1',
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
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}

module.exports = { login, registrar };
