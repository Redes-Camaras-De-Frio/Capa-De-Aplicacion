const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';

function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  try {
    const decoded = jwt.verify(parts[1], SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acción permitida solo para: ${roles.join(', ')}` });
    }
    next();
  };
}

function verificarAccesoSede(req, res, next) {
  const { sedes, rol } = req.usuario;
  const sedeId = req.query.sede_id ? parseInt(req.query.sede_id, 10) : null;

  if (rol === 'admin') return next();

  if (!sedes || sedes.length === 0) {
    return res.status(403).json({ error: 'No tienes acceso a ninguna sede' });
  }

  if (sedeId && !sedes.includes(sedeId)) {
    return res.status(403).json({ error: 'No tienes acceso a esta sede' });
  }

  next();
}

module.exports = { verificarToken, requiereRol, verificarAccesoSede };
