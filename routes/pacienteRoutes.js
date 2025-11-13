const express = require('express');
const pacienteController = require('../controllers/pacienteController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Listar pacientes: admin
router.get('/', checkRole('admin'), pacienteController.getAll);

// Buscar por número de historia clínica: admin o médico
router.get('/historia/:numeroHistoria', checkRole('admin', 'médico'), pacienteController.getByHistoriaClinica);

// Obtener paciente por id: admin o el propio paciente
router.get('/:id', checkRole('admin', 'paciente'), checkRole.allowAdminOrOwnPaciente('id'), pacienteController.getById);

// Crear paciente: admin (registro público debe usar /auth/register)
router.post('/', checkRole('admin'), pacienteController.create);

// Actualizar: admin o propietario paciente
router.put('/:id', checkRole('admin', 'paciente'), checkRole.allowAdminOrOwnPaciente('id'), pacienteController.update);

// Eliminar: admin
router.delete('/:id', checkRole('admin'), pacienteController.delete);

// Obtener citas de un paciente: admin o el propio paciente
router.get('/:id/citas', checkRole('admin', 'paciente'), checkRole.allowAdminOrOwnPaciente('id'), pacienteController.getCitas);

module.exports = router;