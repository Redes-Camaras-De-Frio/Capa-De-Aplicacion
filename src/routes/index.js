const { Router } = require('express');
const { verificarToken, verificarAccesoSede } = require('../middlewares/auth');

const authRoutes = require('./authRoutes');
const sedeRoutes = require('./sedeRoutes');
const camaraRoutes = require('./camaraRoutes');
const sensorRoutes = require('./sensorRoutes');
const lecturaRoutes = require('./lecturaRoutes');
const alertaRoutes = require('./alertaRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = Router();

router.use('/auth', authRoutes);

router.use('/sedes', verificarToken, verificarAccesoSede, sedeRoutes);
router.use('/camaras', verificarToken, verificarAccesoSede, camaraRoutes);
router.use('/sensores', verificarToken, verificarAccesoSede, sensorRoutes);
router.use('/lecturas', verificarToken, verificarAccesoSede, lecturaRoutes);
router.use('/alertas', verificarToken, verificarAccesoSede, alertaRoutes);
router.use('/dashboard', verificarToken, verificarAccesoSede, dashboardRoutes);

module.exports = router;
