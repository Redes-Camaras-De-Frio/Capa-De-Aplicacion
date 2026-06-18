const { Router } = require('express');
const sedeController = require('../controllers/sedeController');
const { validateId } = require('../middlewares/validateId');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

/**
 * @openapi
 * /api/sedes:
 *   get:
 *     tags: [Sedes]
 *     summary: Lista todas las sedes
 *     responses:
 *       200:
 *         description: Lista de sedes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sede'
 *                 total:
 *                   type: integer
 */
router.get('/', sedeController.listar);

/**
 * @openapi
 * /api/sedes/{id}:
 *   get:
 *     tags: [Sedes]
 *     summary: Obtiene una sede por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Sede encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Sede'
 *       404:
 *         description: Sede no encontrada
 */
router.get('/:id', validateId, sedeController.obtenerPorId);

/**
 * @openapi
 * /api/sedes:
 *   post:
 *     tags: [Sedes]
 *     summary: Crea una nueva sede (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, tipo]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Distribuidora Sur"
 *               tipo:
 *                 type: string
 *                 enum: [farmacia, distribuidora, botica]
 *               direccion:
 *                 type: string
 *                 example: "Av. Sur 456, Lima"
 *     responses:
 *       201:
 *         description: Sede creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Sede'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, requiereRol('admin'), sedeController.crear);

/**
 * @openapi
 * /api/sedes/{id}:
 *   put:
 *     tags: [Sedes]
 *     summary: Actualiza una sede (solo admin)
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
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [farmacia, distribuidora, botica]
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sede actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   $ref: '#/components/schemas/Sede'
 *       404:
 *         description: Sede no encontrada
 */
router.put('/:id', validateId, verificarToken, requiereRol('admin'), sedeController.actualizar);

/**
 * @openapi
 * /api/sedes/{id}:
 *   delete:
 *     tags: [Sedes]
 *     summary: Elimina una sede (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Sede eliminada
 *       404:
 *         description: Sede no encontrada
 */
router.delete('/:id', validateId, verificarToken, requiereRol('admin'), sedeController.eliminar);

module.exports = router;
