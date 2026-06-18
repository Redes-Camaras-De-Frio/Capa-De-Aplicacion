const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Resumen general del sistema
 *     description: Retorna conteos de sedes, cámaras, sensores, alertas activas y las últimas lecturas de temperatura por cámara.
 *     responses:
 *       200:
 *         description: Resumen del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Dashboard'
 */
router.get('/', dashboardController.resumen);

module.exports = router;
