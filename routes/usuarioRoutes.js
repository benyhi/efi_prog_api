const express = require('express');
const usuarioController = require('../controllers/usuarioController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Listar usuarios: solo admin
router.get('/', checkRole('admin'), usuarioController.getAll);

// Obtener usuario por id: admin o el propio usuario
router.get('/:id', checkRole.allowAdminOrOwnerParam('id'), usuarioController.getById);

// Crear usuario: solo admin (el registro público está en /auth/register)
router.post('/', checkRole('admin'), usuarioController.create);

// Actualizar usuario: admin o propietario
router.put('/:id', checkRole.allowAdminOrOwnerParam('id'), usuarioController.update);

// Eliminar usuario: solo admin
router.delete('/:id', checkRole('admin'), usuarioController.delete);

module.exports = router;