const dashboardService = require('../services/dashboardService');

async function resumen(req, res) {
  try {
    const resumen = await dashboardService.obtenerResumen(req.usuario);
    res.json({ datos: resumen });
  } catch (err) {
    console.error('[dashboardController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
  }
}

module.exports = { resumen };
