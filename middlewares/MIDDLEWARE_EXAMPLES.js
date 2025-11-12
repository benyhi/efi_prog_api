/**
 * EJEMPLOS DE USO DE MIDDLEWARES DE AUTENTICACIÓN
 * 
 * Este archivo muestra cómo usar los middlewares en las rutas
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

/**
 * EJEMPLO 1: Ruta protegida por autenticación
 * Solo usuarios autenticados pueden acceder
 */
router.get('/ejemplo-protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Esta ruta está protegida. Solo usuarios autenticados pueden acceder.',
    user: req.user
  });
});

/**
 * EJEMPLO 2: Ruta protegida por autenticación y rol de admin
 * Solo administradores pueden acceder
 */
router.delete('/ejemplo-admin-only', authMiddleware, checkRole('admin'), (req, res) => {
  res.json({
    message: 'Esta ruta solo es accesible por administradores',
    user: req.user
  });
});

/**
 * EJEMPLO 3: Ruta protegida por autenticación y múltiples roles
 * Solo médicos y admins pueden acceder
 */
router.post('/ejemplo-medicos-admins', 
  authMiddleware, 
  checkRole('médico', 'admin'), 
  (req, res) => {
    res.json({
      message: 'Esta ruta es accesible por médicos y administradores',
      user: req.user
    });
  }
);

/**
 * EJEMPLO 4: Ruta solo para pacientes
 */
router.get('/ejemplo-pacientes', 
  authMiddleware, 
  checkRole('paciente'), 
  (req, res) => {
    res.json({
      message: 'Esta ruta es accesible solo por pacientes',
      user: req.user
    });
  }
);

module.exports = router;

/**
 * FORMA DE USAR EN TUAS RUTAS EXISTENTES:
 * 
 * Ejemplo en citaRoutes.js:
 * 
 * const express = require('express');
 * const authMiddleware = require('../middlewares/auth');
 * const checkRole = require('../middlewares/checkRole');
 * const router = express.Router();
 * 
 * // Ruta protegida: solo usuarios autenticados
 * router.get('/', authMiddleware, citaController.getAllCitas);
 * 
 * // Ruta protegida: solo médicos y admins
 * router.post('/', 
 *   authMiddleware, 
 *   checkRole('médico', 'admin'), 
 *   citaController.createCita
 * );
 * 
 * // Ruta protegida: solo admins
 * router.delete('/:id', 
 *   authMiddleware, 
 *   checkRole('admin'), 
 *   citaController.deleteCita
 * );
 * 
 * module.exports = router;
 */
