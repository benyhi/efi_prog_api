const express = require('express');
const especialidadController = require('../controllers/especialidadController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', especialidadController.getAll);
router.get('/buscar/:nombre', especialidadController.buscarPorNombre);
router.get('/:id', especialidadController.getById);

// CRUD: solo admin
router.post('/', checkRole('admin'), especialidadController.create);
router.put('/:id', checkRole('admin'), especialidadController.update);
router.delete('/:id', checkRole('admin'), especialidadController.delete);

module.exports = router;