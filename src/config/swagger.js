const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Monitoreo Cadena de Frío',
      version: '1.0.0',
      description:
        'API REST del sistema IoT para monitoreo de temperatura en cámaras de frío de una farmacia central y sedes remotas.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Docker' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/config/swagger.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * @openapi
 * components:
 *   schemas:
 *     Sede:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nombre: { type: string, example: "Farmacia Central" }
 *         tipo: { type: string, enum: [farmacia, distribuidora, botica] }
 *         direccion: { type: string, example: "Av. Principal 123, Lima" }
 *         created_at: { type: string, format: date-time }
 *
 *     Camara:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         sede_id: { type: integer, example: 1 }
 *         nombre: { type: string, example: "Cámara Farmacia Central" }
 *         temp_min: { type: number, format: float, example: 2.0 }
 *         temp_max: { type: number, format: float, example: 8.0 }
 *         activa: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *
 *     Sensor:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         camara_id: { type: integer, example: 1 }
 *         tipo: { type: string, enum: [temperatura, humedad, apertura, movimiento, agua, humo] }
 *         unidad: { type: string, example: "°C" }
 *         activo: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *
 *     Lectura:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         sensor_id: { type: integer, example: 1 }
 *         valor: { type: number, format: float, example: 7.32 }
 *         registrado_en: { type: string, format: date-time }
 *         sensor_tipo: { type: string, example: "temperatura" }
 *         unidad: { type: string, example: "°C" }
 *
 *     Alerta:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         camara_id: { type: integer, example: 1 }
 *         sensor_id: { type: integer, nullable: true }
 *         lectura_id: { type: integer, nullable: true }
 *         tipo: { type: string, example: "temp_alta" }
 *         mensaje: { type: string, example: "Temperatura alta: 9.5°C (máx. permitido: 8°C)" }
 *         resuelta: { type: boolean, example: false }
 *         creado_en: { type: string, format: date-time }
 *         resuelto_en: { type: string, format: date-time, nullable: true }
 *         camara_nombre: { type: string, example: "Cámara Farmacia Central" }
 *         sensor_tipo: { type: string, example: "temperatura" }
 *
 *     Dashboard:
 *       type: object
 *       properties:
 *         sedes: { type: integer, example: 2 }
 *         camaras: { type: integer, example: 4 }
 *         camarasInactivas: { type: integer, example: 0 }
 *         sensores: { type: integer, example: 19 }
 *         alertasActivas: { type: integer, example: 6 }
 *         ultimasLecturas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               camara_id: { type: integer }
 *               camara_nombre: { type: string }
 *               valor: { type: number, format: float }
 *               registrado_en: { type: string, format: date-time }
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         datos:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIs...
 *             usuario:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 nombre: { type: string, example: "Administrador" }
 *                 email: { type: string, example: "admin@farmacia.com" }
 *                 rol: { type: string, example: "admin" }
 *                 sedes:
 *                   type: array
 *                   items: { type: integer }
 *                   nullable: true
 *                   description: "IDs de sedes a las que tiene acceso (null = todas)"
 *
 *     RegisterBody:
 *       type: object
 *       properties:
 *         nombre: { type: string, example: "Nuevo Usuario" }
 *         email: { type: string, example: "nuevo@farmacia.com" }
 *         password: { type: string, example: "miPassword123" }
 *         rol: { type: string, enum: [admin, operador, tecnico] }
 *         sedes:
 *           type: array
 *           items: { type: integer }
 *           example: [1, 2]
 *           description: "IDs de sedes a asignar (solo para admin, ignorado si rol=admin)"
 *
 *     Error:
 *       type: object
 *       properties:
 *         error: { type: string }
 *
 *   parameters:
 *     sedeId:
 *       in: query
 *       name: sede_id
 *       schema: { type: integer }
 *       description: "Filtrar por sede (el usuario debe tener acceso a esa sede)"
 *     camaraId:
 *       in: query
 *       name: camara_id
 *       schema: { type: integer }
 *       description: Filtrar por cámara
 *     sensorId:
 *       in: query
 *       name: sensor_id
 *       schema: { type: integer }
 *       description: Filtrar por sensor
 *     limite:
 *       in: query
 *       name: limite
 *       schema: { type: integer, default: 50 }
 *       description: Número máximo de registros
 *     resuelta:
 *       in: query
 *       name: resuelta
 *       schema: { type: boolean }
 *       description: Filtrar alertas resueltas (true) o activas (false)
 */

module.exports = swaggerSpec;
