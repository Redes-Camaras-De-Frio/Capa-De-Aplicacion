const alertaService = require('../services/alertaService');

async function listar(req, res) {
  try {
    const resuelta = req.query.resuelta !== undefined
      ? req.query.resuelta === 'true'
      : undefined;
    const limite = req.query.limite || 50;
    const alertas = await alertaService.obtenerAlertas({ resuelta, limite, usuario: req.usuario });
    res.json({ datos: alertas, total: alertas.length });
  } catch (err) {
    console.error('[alertaController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const alerta = await alertaService.obtenerAlertaPorId(req.params.id, req.usuario);
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json({ datos: alerta });
  } catch (err) {
    console.error('[alertaController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener alerta' });
  }
}

async function resolver(req, res) {
  try {
    const usuarioId = parseInt(req.body.usuario_id, 10);
    if (!usuarioId || usuarioId < 1) return res.status(400).json({ error: 'usuario_id inválido. Debe ser un número entero positivo.' });
    const alerta = await alertaService.resolverAlerta(req.params.id, usuarioId);
    if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada o ya resuelta' });
    res.json({ datos: alerta, mensaje: 'Alerta resuelta exitosamente' });
  } catch (err) {
    console.error('[alertaController] Error:', err.message);
    res.status(500).json({ error: 'Error al resolver alerta' });
  }
}

module.exports = { listar, obtenerPorId, resolver };
