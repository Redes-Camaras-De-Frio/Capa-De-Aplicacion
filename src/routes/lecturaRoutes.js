const { Router } = require('express');
const lecturaController = require('../controllers/lecturaController');
const { validateQueryInt } = require('../middlewares/validateId');

const router = Router();

/**
 * @openapi
 * /api/lecturas:
 *   get:
 *     tags: [Lecturas]
 *     summary: Lista lecturas históricas
 *     parameters:
 *       - $ref: '#/components/parameters/sensorId'
 *       - $ref: '#/components/parameters/limite'
 *     responses:
 *       200:
 *         description: Lista de lecturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lectura'
 *                 total:
 *                   type: integer
 */
router.get('/', validateQueryInt('sensor_id'), validateQueryInt('limite'), lecturaController.listar);

/**
 * @openapi
 * /api/lecturas/ultimas-por-camara:
 *   get:
 *     tags: [Lecturas]
 *     summary: Última lectura de temperatura por cámara
 *     responses:
 *       200:
 *         description: Últimas lecturas agrupadas por cámara
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       camara_id: { type: integer }
 *                       camara_nombre: { type: string }
 *                       sensor_id: { type: integer }
 *                       sensor_tipo: { type: string }
 *                       valor: { type: number, format: float }
 *                       unidad: { type: string }
 *                       registrado_en: { type: string, format: date-time }
 */
router.get('/ultimas-por-camara', lecturaController.ultimasPorCamara);

module.exports = router;
