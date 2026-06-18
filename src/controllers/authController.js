const authService = require('../services/authService');

async function registrar(req, res) {
  try {
    const { nombre, email, password, rol, sedes } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'nombre, email, password y rol son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
    }

    const rolesValidos = ['admin', 'operador', 'tecnico'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: `rol debe ser uno de: ${rolesValidos.join(', ')}` });
    }

    if (sedes && (!Array.isArray(sedes) || sedes.length === 0)) {
      return res.status(400).json({ error: 'sedes debe ser un array no vacío de IDs de sede' });
    }

    const resultado = await authService.registrar({ nombre, email, password, rol, sedes });

    if (resultado.error) {
      return res.status(409).json({ error: resultado.error });
    }

    res.status(201).json({ datos: resultado.usuario });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error('[authController] Error:', err.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    const resultado = await authService.login(email, password);

    if (resultado.error) {
      return res.status(401).json({ error: resultado.error });
    }

    res.json({ datos: resultado });
  } catch (err) {
    console.error('[authController] Error:', err.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

module.exports = { login, registrar };
