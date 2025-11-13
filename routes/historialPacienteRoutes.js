const express = require('express');
const historialPacienteController = require('../controllers/historialPacienteController.js');
const checkRole = require('../middlewares/checkRole.js');
const { HistorialPaciente } = require('../config/database.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado (admin y médicos ven historiales)
router.get('/', historialPacienteController.getAll);
router.get('/:id', historialPacienteController.getById);
router.get('/paciente/:paciente_id', historialPacienteController.getByPaciente);

// Crear historial: admin o médico (el médico crea historiales para sus pacientes)
router.post('/', checkRole('admin', 'médico'), historialPacienteController.create);

// Actualizar historial: admin o el médico que lo creó
router.put('/:id', async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    if (user.rol === 'admin') return historialPacienteController.update(req, res, next);
    
    // Para médico: verificar que es el médico que creó el historial
    if (user.rol === 'médico' && user.medico_id) {
      const historial = await HistorialPaciente.findByPk(req.params.id);
      if (!historial) return res.status(404).json({ success: false, message: 'Historial no encontrado' });
      
      if (parseInt(historial.medico_id) !== parseInt(user.medico_id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: solo el médico que creó el historial puede editarlo' });
      }
      return historialPacienteController.update(req, res, next);
    }
    
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo admin o médico' });
  } catch (error) {
    next(error);
  }
});

// Eliminar historial: solo admin
router.delete('/:id', checkRole('admin'), historialPacienteController.delete);

module.exports = router;