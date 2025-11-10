const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

/**
 * POST /api/auth/login
 * Login: autenticar usuario y obtener JWT token
 * Body: { correo, contraseña }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 * Body: { nombre, apellido, correo, contraseña, rol?, telefono?, direccion? }
 */
router.post('/register', authController.register);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 * Header: Authorization: Bearer <token>
 */
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
