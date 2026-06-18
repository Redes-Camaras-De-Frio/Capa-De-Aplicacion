const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/api', (_req, res) => {
  res.json({
    nombre: 'API Monitoreo Cadena de Frío',
    version: '1.0.0',
    documentacion: 'http://localhost:3000/api-docs',
    endpoints: {
      sedes: '/api/sedes',
      camaras: '/api/camaras',
      sensores: '/api/sensores',
      lecturas: '/api/lecturas',
      alertas: '/api/alertas',
      dashboard: '/api/dashboard',
    },
  });
});

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, _req, res, _next) => {
  console.error('[App] Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
