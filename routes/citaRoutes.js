const express = require('express');
const citaController = require('../controllers/citaController.js');
const checkRole = require('../middlewares/checkRole.js');
const { Cita } = require('../config/database.js');
const router = express.Router();

// Listar todas las citas: solo admin
router.get('/', checkRole('admin'), citaController.getAll);

// Obtener citas de un paciente: admin o el propio paciente
router.get('/paciente/:pacienteId', checkRole('admin', 'paciente'), checkRole.allowAdminOrOwnerParam('pacienteId'), citaController.getByPaciente);

// Obtener citas de un médico: admin o el propio médico
router.get('/medico/:medicoId', checkRole('admin', 'médico'), checkRole.allowAdminOrOwnerParam('medicoId'), citaController.getByMedico);

// Obtener cita por id: admin (para simplicidad)
router.get('/:id', checkRole('admin'), citaController.getById);

// Crear cita: paciente solo para su propio id_paciente, o admin
router.post('/', checkRole('admin', 'paciente'), checkRole.allowAdminOrOwnerBody('id_paciente'), citaController.create);

// Actualizar cita (metadatos): admin
router.put('/:id', checkRole('admin'), citaController.update);

// Eliminar (marcar cancelada): admin
router.delete('/:id', checkRole('admin'), citaController.delete);

// Cancelar cita: admin o propietario (paciente) o médico responsable
router.patch('/:id/cancelar', async (req, res, next) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		if (user.rol === 'admin') return citaController.cancelar(req, res, next);
		const cita = await Cita.findByPk(req.params.id);
		if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
		if (user.rol === 'paciente' && parseInt(cita.paciente_id) === parseInt(user.id)) return citaController.cancelar(req, res, next);
		if (user.rol === 'médico' && parseInt(cita.medico_id) === parseInt(user.id)) return citaController.cancelar(req, res, next);
		return res.status(403).json({ success: false, message: 'Acceso denegado: no es propietario de la cita' });
	} catch (error) {
		next(error);
	}
});

// Confirmar cita: admin o médico responsable
router.patch('/:id/confirmar', async (req, res, next) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		if (user.rol === 'admin') return citaController.confirmar(req, res, next);
		if (user.rol !== 'médico') return res.status(403).json({ success: false, message: 'Acceso denegado: solo médico o admin' });
		const cita = await Cita.findByPk(req.params.id);
		if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
		if (parseInt(cita.medico_id) !== parseInt(user.id)) return res.status(403).json({ success: false, message: 'Acceso denegado: no es el médico responsable' });
		return citaController.confirmar(req, res, next);
	} catch (error) {
		next(error);
	}
});

// Completar cita: admin o médico responsable
router.patch('/:id/completar', async (req, res, next) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		if (user.rol === 'admin') return citaController.completar(req, res, next);
		if (user.rol !== 'médico') return res.status(403).json({ success: false, message: 'Acceso denegado: solo médico o admin' });
		const cita = await Cita.findByPk(req.params.id);
		if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
		if (parseInt(cita.medico_id) !== parseInt(user.id)) return res.status(403).json({ success: false, message: 'Acceso denegado: no es el médico responsable' });
		return citaController.completar(req, res, next);
	} catch (error) {
		next(error);
	}
});

module.exports = router;