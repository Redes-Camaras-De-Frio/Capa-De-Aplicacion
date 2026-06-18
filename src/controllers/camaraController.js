const camaraService = require('../services/camaraService');

async function listar(req, res) {
  try {
    const sedeId = req.query.sede_id || null;
    const camaras = await camaraService.obtenerTodasLasCamaras(sedeId, req.usuario);
    res.json({ datos: camaras, total: camaras.length });
  } catch (err) {
    console.error('[camaraController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener cámaras' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const camara = await camaraService.obtenerCamaraPorId(req.params.id, req.usuario);
    if (!camara) return res.status(404).json({ error: 'Cámara no encontrada' });
    res.json({ datos: camara });
  } catch (err) {
    console.error('[camaraController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener cámara' });
  }
}

async function crear(req, res) {
  try {
    const { sede_id, nombre, temp_min, temp_max, activa } = req.body;

    if (!sede_id || !nombre || temp_min === undefined || temp_max === undefined) {
      return res.status(400).json({ error: 'sede_id, nombre, temp_min y temp_max son requeridos' });
    }
    if (temp_min >= temp_max) {
      return res.status(400).json({ error: 'temp_min debe ser menor que temp_max' });
    }

    const camara = await camaraService.crearCamara({ sede_id, nombre, temp_min, temp_max, activa });
    res.status(201).json({ datos: camara });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'La sede especificada no existe' });
    }
    console.error('[camaraController] Error:', err.message);
    res.status(500).json({ error: 'Error al crear cámara' });
  }
}

async function actualizar(req, res) {
  try {
    const { nombre, temp_min, temp_max, activa } = req.body;

    if (!nombre && temp_min === undefined && temp_max === undefined && activa === undefined) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo a actualizar' });
    }
    if (temp_min !== undefined && temp_max !== undefined && temp_min >= temp_max) {
      return res.status(400).json({ error: 'temp_min debe ser menor que temp_max' });
    }

    const camara = await camaraService.actualizarCamara(req.params.id, { nombre, temp_min, temp_max, activa });
    if (!camara) return res.status(404).json({ error: 'Cámara no encontrada' });
    res.json({ datos: camara });
  } catch (err) {
    console.error('[camaraController] Error:', err.message);
    res.status(500).json({ error: 'Error al actualizar cámara' });
  }
}

async function eliminar(req, res) {
  try {
    const camara = await camaraService.eliminarCamara(req.params.id);
    if (!camara) return res.status(404).json({ error: 'Cámara no encontrada' });
    res.json({ mensaje: 'Cámara eliminada exitosamente' });
  } catch (err) {
    console.error('[camaraController] Error:', err.message);
    res.status(500).json({ error: 'Error al eliminar cámara' });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
