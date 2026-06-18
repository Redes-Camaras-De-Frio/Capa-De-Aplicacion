const { Router } = require('express');
const { verificarToken } = require('../middlewares/auth');

const authRoutes = require('./authRoutes');
const sedeRoutes = require('./sedeRoutes');
const camaraRoutes = require('./camaraRoutes');
const sensorRoutes = require('./sensorRoutes');
const lecturaRoutes = require('./lecturaRoutes');
const alertaRoutes = require('./alertaRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = Router();

router.use('/auth', authRoutes);

router.use('/sedes', verificarToken, sedeRoutes);
router.use('/camaras', verificarToken, camaraRoutes);
router.use('/sensores', verificarToken, sensorRoutes);
router.use('/lecturas', verificarToken, lecturaRoutes);
router.use('/alertas', verificarToken, alertaRoutes);
router.use('/dashboard', verificarToken, dashboardRoutes);

module.exports = router;
