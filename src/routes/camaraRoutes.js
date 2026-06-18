const { Router } = require('express');
const camaraController = require('../controllers/camaraController');
const { validateId, validateQueryInt } = require('../middlewares/validateId');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

/**
 * @openapi
 * /api/camaras:
 *   get:
 *     tags: [Cámaras]
 *     summary: Lista todas las cámaras
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/sedeId'
 *     responses:
 *       200:
 *         description: Lista de cámaras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Camara'
 *                 total:
 *                   type: integer
 */
router.get('/', validateQueryInt('sede_id'), camaraController.listar);

/**
 * @openapi
 * /api/camaras/{id}:
 *   get:
 *     tags: [Cámaras]
 *     summary: Obtiene una cámara por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cámara encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Camara'
 *       404:
 *         description: Cámara no encontrada
 */
router.get('/:id', validateId, camaraController.obtenerPorId);

/**
 * @openapi
 * /api/camaras:
 *   post:
 *     tags: [Cámaras]
 *     summary: Crea una nueva cámara (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sede_id, nombre, temp_min, temp_max]
 *             properties:
 *               sede_id:
 *                 type: integer
 *                 example: 1
 *               nombre:
 *                 type: string
 *                 example: "Cámara 2 - Central"
 *               temp_min:
 *                 type: number
 *                 format: float
 *                 example: 2.0
 *               temp_max:
 *                 type: number
 *                 format: float
 *                 example: 8.0
 *               activa:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Cámara creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Camara'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, requiereRol('admin'), camaraController.crear);

/**
 * @openapi
 * /api/camaras/{id}:
 *   put:
 *     tags: [Cámaras]
 *     summary: Actualiza una cámara (admin o técnico)
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
 *               nombre: { type: string }
 *               temp_min: { type: number, format: float }
 *               temp_max: { type: number, format: float }
 *               activa: { type: boolean }
 *     responses:
 *       200:
 *         description: Cámara actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Camara'
 *       404:
 *         description: Cámara no encontrada
 */
router.put('/:id', validateId, verificarToken, requiereRol('admin', 'tecnico'), camaraController.actualizar);

/**
 * @openapi
 * /api/camaras/{id}:
 *   delete:
 *     tags: [Cámaras]
 *     summary: Elimina una cámara (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cámara eliminada
 *       404:
 *         description: Cámara no encontrada
 */
router.delete('/:id', validateId, verificarToken, requiereRol('admin'), camaraController.eliminar);

module.exports = router;
