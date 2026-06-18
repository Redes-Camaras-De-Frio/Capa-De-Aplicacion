require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = parseInt(process.env.API_PORT, 10) || 3000;

async function main() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('[Server] La API iniciará sin conexión a la BD');
  }

  app.listen(PORT, () => {
    console.log(`[Server] API corriendo en http://localhost:${PORT}`);
    console.log(`[Server] Documentación de endpoints: http://localhost:${PORT}/api`);
  });
}

main();
