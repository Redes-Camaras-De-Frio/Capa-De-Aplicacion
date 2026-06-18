const lecturaService = require('../services/lecturaService');

async function listar(req, res) {
  try {
    const sensorId = req.query.sensor_id || null;
    const limite = req.query.limite || 50;
    const lecturas = await lecturaService.obtenerLecturas(sensorId, limite, req.usuario);
    res.json({ datos: lecturas, total: lecturas.length });
  } catch (err) {
    console.error('[lecturaController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener lecturas' });
  }
}

async function ultimasPorCamara(req, res) {
  try {
    const lecturas = await lecturaService.obtenerUltimasLecturasPorCamara(req.usuario);
    res.json({ datos: lecturas });
  } catch (err) {
    console.error('[lecturaController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener últimas lecturas' });
  }
}

module.exports = { listar, ultimasPorCamara };
