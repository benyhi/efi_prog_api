/**
 * Test rápido del sistema de autenticación
 * Ejecutar: node tests/auth.test.quick.js
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('\n🔐 VERIFICANDO SISTEMA DE AUTENTICACIÓN\n');

// 1. Verificar que jsonwebtoken esté disponible
console.log('✅ Verificando jsonwebtoken...');
try {
  const token = jwt.sign({ id: 1, rol: 'paciente' }, 'test_secret', { expiresIn: '1h' });
  const decoded = jwt.verify(token, 'test_secret');
  console.log('   ✓ JWT funcionando correctamente');
  console.log('   ✓ Token generado:', token.substring(0, 30) + '...');
  console.log('   ✓ Token decodificado:', decoded);
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

// 2. Verificar que bcryptjs esté disponible
console.log('\n✅ Verificando bcryptjs...');
try {
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const isValid = bcrypt.compareSync('password123', hashedPassword);
  console.log('   ✓ bcryptjs funcionando correctamente');
  console.log('   ✓ Contraseña encriptada:', hashedPassword.substring(0, 30) + '...');
  console.log('   ✓ Contraseña válida:', isValid);
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

// 3. Verificar estructura de middlewares
console.log('\n✅ Verificando middlewares...');
try {
  const authMiddleware = require('../middlewares/auth');
  const checkRole = require('../middlewares/checkRole');
  console.log('   ✓ authMiddleware cargado correctamente');
  console.log('   ✓ checkRole cargado correctamente');
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

// 4. Verificar estructura de controlador
console.log('\n✅ Verificando authController...');
try {
  const authController = require('../controllers/authController');
  const methods = Object.keys(authController);
  console.log('   ✓ authController cargado correctamente');
  console.log('   ✓ Métodos disponibles:', methods);
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

// 5. Verificar rutas de autenticación
console.log('\n✅ Verificando rutas de autenticación...');
try {
  const authRoutes = require('../routes/authRoutes');
  console.log('   ✓ authRoutes cargadas correctamente');
  console.log('   ✓ Type:', typeof authRoutes);
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
console.log('📝 Próximos pasos:');
console.log('   1. Copiar .env.example a .env');
console.log('   2. Actualizar JWT_SECRET en .env');
console.log('   3. Ejecutar: npm start');
console.log('   4. Probar endpoints en Postman\n');
