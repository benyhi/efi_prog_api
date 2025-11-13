const express = require('express');
const notificacionController = require('../controllers/notificacionController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', notificacionController.getAll);
router.get('/:id', notificacionController.getById);
router.get('/usuario/:usuario_id', notificacionController.getByUsuario);
router.get('/reportes/estadisticas', notificacionController.getEstadisticas);

// CRUD: solo admin
router.post('/', checkRole('admin'), notificacionController.create);
router.put('/:id', checkRole('admin'), notificacionController.update);
router.delete('/:id', checkRole('admin'), notificacionController.delete);
router.post('/masiva', checkRole('admin'), notificacionController.createMasiva);
router.patch('/:id/marcar-leida', notificacionController.marcarLeida);
router.patch('/marcar-leidas', notificacionController.marcarVariasLeidas);

module.exports = router;