const express = require('express');
const pagoController = require('../controllers/pagoController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', pagoController.getAll);
router.get('/:id', pagoController.getById);
router.get('/paciente/:paciente_id', pagoController.getByPaciente);
router.get('/reportes/estadisticas', pagoController.getReportes);

// CRUD: solo admin
router.post('/', checkRole('admin'), pagoController.create);
router.put('/:id', checkRole('admin'), pagoController.update);
router.patch('/:id/anular', checkRole('admin'), pagoController.anular);

module.exports = router;