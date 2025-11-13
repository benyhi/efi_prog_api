const express = require('express');
const medicamentoController = require('../controllers/medicamentoController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', medicamentoController.getAll);
router.get('/:id', medicamentoController.getById);
router.get('/principio-activo/:principio_activo', medicamentoController.buscarPorPrincipioActivo);
router.get('/:id/estadisticas', medicamentoController.getEstadisticas);

// CRUD: solo admin
router.post('/', checkRole('admin'), medicamentoController.create);
router.put('/:id', checkRole('admin'), medicamentoController.update);
router.delete('/:id', checkRole('admin'), medicamentoController.delete);
router.patch('/:id/toggle-estado', checkRole('admin'), medicamentoController.toggleEstado);

module.exports = router;