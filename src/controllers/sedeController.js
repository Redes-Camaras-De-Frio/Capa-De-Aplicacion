const sedeService = require('../services/sedeService');

async function listar(req, res) {
  try {
    const sedes = await sedeService.obtenerTodasLasSedes(req.usuario);
    res.json({ datos: sedes, total: sedes.length });
  } catch (err) {
    console.error('[sedeController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener sedes' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const sede = await sedeService.obtenerSedePorId(req.params.id, req.usuario);
    if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
    res.json({ datos: sede });
  } catch (err) {
    console.error('[sedeController] Error:', err.message);
    res.status(500).json({ error: 'Error al obtener sede' });
  }
}

async function crear(req, res) {
  try {
    const { nombre, tipo, direccion } = req.body;
    if (!nombre || !tipo) {
      return res.status(400).json({ error: 'nombre y tipo son requeridos' });
    }
    const valido = ['farmacia', 'distribuidora', 'botica'];
    if (!valido.includes(tipo)) {
      return res.status(400).json({ error: `tipo debe ser uno de: ${valido.join(', ')}` });
    }
    const sede = await sedeService.crearSede({ nombre, tipo, direccion });
    res.status(201).json({ datos: sede });
  } catch (err) {
    console.error('[sedeController] Error:', err.message);
    res.status(500).json({ error: 'Error al crear sede' });
  }
}

async function actualizar(req, res) {
  try {
    const { nombre, tipo, direccion } = req.body;
    if (!nombre && !tipo && direccion === undefined) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo a actualizar' });
    }
    if (tipo) {
      const valido = ['farmacia', 'distribuidora', 'botica'];
      if (!valido.includes(tipo)) {
        return res.status(400).json({ error: `tipo debe ser uno de: ${valido.join(', ')}` });
      }
    }
    const sede = await sedeService.actualizarSede(req.params.id, { nombre, tipo, direccion });
    if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
    res.json({ datos: sede });
  } catch (err) {
    console.error('[sedeController] Error:', err.message);
    res.status(500).json({ error: 'Error al actualizar sede' });
  }
}

async function eliminar(req, res) {
  try {
    const sede = await sedeService.eliminarSede(req.params.id);
    if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
    res.json({ mensaje: 'Sede eliminada exitosamente' });
  } catch (err) {
    console.error('[sedeController] Error:', err.message);
    res.status(500).json({ error: 'Error al eliminar sede' });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
