const { Router } = require('express');
const sensorController = require('../controllers/sensorController');
const { validateId, validateQueryInt } = require('../middlewares/validateId');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

/**
 * @openapi
 * /api/sensores:
 *   get:
 *     tags: [Sensores]
 *     summary: Lista todos los sensores
 *     parameters:
 *       - $ref: '#/components/parameters/camaraId'
 *     responses:
 *       200:
 *         description: Lista de sensores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sensor'
 *                 total:
 *                   type: integer
 */
router.get('/', validateQueryInt('camara_id'), sensorController.listar);

/**
 * @openapi
 * /api/sensores/{id}:
 *   get:
 *     tags: [Sensores]
 *     summary: Obtiene un sensor por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Sensor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Sensor'
 *       404:
 *         description: Sensor no encontrado
 */
router.get('/:id', validateId, sensorController.obtenerPorId);

/**
 * @openapi
 * /api/sensores:
 *   post:
 *     tags: [Sensores]
 *     summary: Crea un nuevo sensor (admin o técnico)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [camara_id, tipo, unidad]
 *             properties:
 *               camara_id:
 *                 type: integer
 *                 example: 1
 *               tipo:
 *                 type: string
 *                 enum: [temperatura, humedad, apertura, movimiento, agua, humo]
 *               unidad:
 *                 type: string
 *                 example: "°C"
 *               activo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Sensor creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Sensor'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, requiereRol('admin', 'tecnico'), sensorController.crear);

/**
 * @openapi
 * /api/sensores/{id}:
 *   put:
 *     tags: [Sensores]
 *     summary: Actualiza un sensor (admin o técnico)
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               tipo: { type: string }
 *               unidad: { type: string }
 *               activo: { type: boolean }
 *     responses:
 *       200:
 *         description: Sensor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Sensor'
 *       404:
 *         description: Sensor no encontrado
 */
router.put('/:id', validateId, verificarToken, requiereRol('admin', 'tecnico'), sensorController.actualizar);

/**
 * @openapi
 * /api/sensores/{id}:
 *   delete:
 *     tags: [Sensores]
 *     summary: Elimina un sensor (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Sensor eliminado
 *       404:
 *         description: Sensor no encontrado
 */
router.delete('/:id', validateId, verificarToken, requiereRol('admin'), sensorController.eliminar);

module.exports = router;
