const { Router } = require('express');
const alertaController = require('../controllers/alertaController');
const { validateId, validateQueryInt } = require('../middlewares/validateId');

const router = Router();

/**
 * @openapi
 * /api/alertas:
 *   get:
 *     tags: [Alertas]
 *     summary: Lista alertas
 *     parameters:
 *       - $ref: '#/components/parameters/resuelta'
 *       - $ref: '#/components/parameters/limite'
 *     responses:
 *       200:
 *         description: Lista de alertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alerta'
 *                 total:
 *                   type: integer
 */
router.get('/', validateQueryInt('limite'), alertaController.listar);

/**
 * @openapi
 * /api/alertas/{id}:
 *   get:
 *     tags: [Alertas]
 *     summary: Obtiene una alerta por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Alerta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Alerta'
 *       404:
 *         description: Alerta no encontrada
 */
router.get('/:id', validateId, alertaController.obtenerPorId);

/**
 * @openapi
 * /api/alertas/{id}/resolver:
 *   patch:
 *     tags: [Alertas]
 *     summary: Marca una alerta como resuelta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id]
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Alerta resuelta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Alerta'
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Alerta no encontrada o ya resuelta
 */
router.patch('/:id/resolver', validateId, alertaController.resolver);

module.exports = router;
