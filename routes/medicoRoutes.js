const express = require('express');
const medicoController = require('../controllers/medicoController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Listar médicos: admin o médico (ver perfiles)
router.get('/', checkRole('admin', 'médico'), medicoController.getAll);

// Obtener médicos por especialidad: admin y médicos
router.get('/especialidad/:especialidadId', checkRole('admin', 'médico'), medicoController.getByEspecialidad);

// Obtener médico por id: cualquier usuario autenticado (admin, médico, paciente)
router.get('/:id', checkRole('admin', 'médico', 'paciente'), medicoController.getById);

// Obtener citas de un médico: admin o el propio médico
router.get('/:id/citas', checkRole('admin', 'médico'), checkRole.allowAdminOrOwnMedico('id'), medicoController.getCitas);

// Crear médico: solo admin
router.post('/', checkRole('admin'), medicoController.create);

// Actualizar médico: admin
router.put('/:id', checkRole('admin'), medicoController.update);

// Eliminar médico: admin
router.delete('/:id', checkRole('admin'), medicoController.delete);

module.exports = router;