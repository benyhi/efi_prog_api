const express = require('express');
const consultorioController = require('../controllers/consultorioController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', consultorioController.getAll);
router.get('/disponibles', consultorioController.getDisponibles);
router.get('/numero/:numero', consultorioController.getByNumero);
router.get('/:id', consultorioController.getById);
router.get('/:id/disponibilidad', consultorioController.getDisponibilidad);

// CRUD: solo admin
router.post('/', checkRole('admin'), consultorioController.create);
router.put('/:id', checkRole('admin'), consultorioController.update);
router.delete('/:id', checkRole('admin'), consultorioController.delete);
router.patch('/:id/toggle-disponibilidad', checkRole('admin'), consultorioController.toggleDisponibilidad);

module.exports = router;