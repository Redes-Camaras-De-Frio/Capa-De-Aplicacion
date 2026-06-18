const { Router } = require('express');
const authController = require('../controllers/authController');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Inicia sesión y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@farmacia.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         nombre: { type: string }
 *                         email: { type: string }
 *                         rol: { type: string }
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registra un nuevo usuario (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nuevo Usuario"
 *               email:
 *                 type: string
 *                 example: "nuevo@farmacia.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "miPassword123"
 *               rol:
 *                 type: string
 *                 enum: [admin, operador, tecnico]
 *                 example: "operador"
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     nombre: { type: string }
 *                     email: { type: string }
 *                     rol: { type: string }
 *                     activo: { type: boolean }
 *                     created_at: { type: string, format: date-time }
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', verificarToken, requiereRol('admin'), authController.registrar);

module.exports = router;
