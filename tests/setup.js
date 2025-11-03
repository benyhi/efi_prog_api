// Test setup and configuration
const { sequelize } = require('../config/database');

// Configuración global para pruebas
beforeAll(async () => {
  // Conectar a la base de datos de pruebas
  await sequelize.authenticate();
  console.log('✓ Conectado a la base de datos para pruebas');
});

afterAll(async () => {
  // Cerrar conexión de la base de datos
  await sequelize.close();
  console.log('✓ Conexión a la base de datos cerrada');
});

// Configurar timeout global para pruebas
jest.setTimeout(30000);