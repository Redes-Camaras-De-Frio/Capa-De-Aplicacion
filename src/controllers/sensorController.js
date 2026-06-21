const sensorService = require('../services/sensorService');
const camaraService = require('../services/camaraService');

async function listar(req, res) {
  try {
    const camaraId = req.query.camara_id || null;
    const sensores = await sensorService.obtenerTodosLosSensores(camaraId, req.usuario);
    res.json({ datos: sensores, total: sensores.length });
  } catch (err) {
    console.error('[sensorController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener sensores' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const sensor = await sensorService.obtenerSensorPorId(req.params.id, req.usuario);
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });
    res.json({ datos: sensor });
  } catch (err) {
    console.error('[sensorController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener sensor' });
  }
}

async function crear(req, res) {
  try {
    const { camara_id, tipo, unidad, activo } = req.body;

    if (!camara_id || !tipo || !unidad) {
      return res.status(400).json({ error: 'camara_id, tipo y unidad son requeridos' });
    }

    const tiposValidos = ['temperatura', 'humedad', 'apertura', 'movimiento', 'agua', 'humo'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: `tipo debe ser uno de: ${tiposValidos.join(', ')}` });
    }

    if (req.usuario.rol === 'operador') {
      const camara = await camaraService.obtenerCamaraPorId(camara_id, req.usuario);
      if (!camara) {
        return res.status(403).json({ error: 'No tienes permiso para agregar sensores a esta cámara' });
      }
    }

    const sensor = await sensorService.crearSensor({ camara_id, tipo, unidad, activo });
    res.status(201).json({ datos: sensor });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'La cámara especificada no existe' });
    }
    console.error('[sensorController] Error:', err.message);
    res.status(500).json({ error: 'Error al crear sensor' });
  }
}

async function actualizar(req, res) {
  try {
    const { tipo, unidad, activo } = req.body;

    if (tipo === undefined && unidad === undefined && activo === undefined) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo a actualizar' });
    }

    if (tipo) {
      const tiposValidos = ['temperatura', 'humedad', 'apertura', 'movimiento', 'agua', 'humo'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: `tipo debe ser uno de: ${tiposValidos.join(', ')}` });
      }
    }

    const existente = await sensorService.obtenerSensorPorId(req.params.id, req.usuario);
    if (!existente) {
      return res.status(404).json({ error: 'Sensor no encontrado o no tienes acceso' });
    }

    const sensor = await sensorService.actualizarSensor(req.params.id, { tipo, unidad, activo });
    res.json({ datos: sensor });
  } catch (err) {
    console.error('[sensorController] Error:', err.message);
    res.status(500).json({ error: 'Error al actualizar sensor' });
  }
}

async function eliminar(req, res) {
  try {
    const existente = await sensorService.obtenerSensorPorId(req.params.id, req.usuario);
    if (!existente) {
      return res.status(404).json({ error: 'Sensor no encontrado o no tienes acceso' });
    }

    const sensor = await sensorService.eliminarSensor(req.params.id);
    res.json({ mensaje: 'Sensor desactivado exitosamente (soft delete)', datos: sensor });
  } catch (err) {
    console.error('[sensorController] Error:', err.message);
    res.status(500).json({ error: 'Error al eliminar sensor' });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
