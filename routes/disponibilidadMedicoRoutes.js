const express = require('express');
const disponibilidadMedicoController = require('../controllers/disponibilidadMedicoController.js');
const checkRole = require('../middlewares/checkRole.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', disponibilidadMedicoController.getAll);
router.get('/:id', disponibilidadMedicoController.getById);
router.get('/medico/:medico_id', disponibilidadMedicoController.getByMedico);

// Crear disponibilidad: admin o médico (para sí mismo)
router.post('/', checkRole('admin', 'médico'), async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    if (user.rol === 'admin') return disponibilidadMedicoController.create(req, res, next);
    
    // Para médico: solo puede crear disponibilidad para sí mismo
    if (user.rol === 'médico' && user.medico_id) {
      const medicoId = req.body.medico_id || req.body.id_medico;
      if (!medicoId) return res.status(400).json({ success: false, message: 'Falta medico_id en body' });
      
      if (parseInt(medicoId) !== parseInt(user.medico_id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: solo puedes crear disponibilidad para ti mismo' });
      }
      return disponibilidadMedicoController.create(req, res, next);
    }
    
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo admin o médico' });
  } catch (error) {
    next(error);
  }
});

// Actualizar disponibilidad: admin o el médico propietario
router.put('/:id', async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    if (user.rol === 'admin') return disponibilidadMedicoController.update(req, res, next);
    
    // Para médico: verificar que es su propia disponibilidad
    if (user.rol === 'médico' && user.medico_id) {
      const { DisponibilidadMedico } = require('../config/database.js');
      const disponibilidad = await DisponibilidadMedico.findByPk(req.params.id);
      if (!disponibilidad) return res.status(404).json({ success: false, message: 'Disponibilidad no encontrada' });
      
      if (parseInt(disponibilidad.medico_id) !== parseInt(user.medico_id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: solo puedes editar tu propia disponibilidad' });
      }
      return disponibilidadMedicoController.update(req, res, next);
    }
    
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo admin o médico' });
  } catch (error) {
    next(error);
  }
});

// Eliminar disponibilidad: admin o el médico propietario
router.delete('/:id', async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    if (user.rol === 'admin') return disponibilidadMedicoController.delete(req, res, next);
    
    // Para médico: verificar que es su propia disponibilidad
    if (user.rol === 'médico' && user.medico_id) {
      const { DisponibilidadMedico } = require('../config/database.js');
      const disponibilidad = await DisponibilidadMedico.findByPk(req.params.id);
      if (!disponibilidad) return res.status(404).json({ success: false, message: 'Disponibilidad no encontrada' });
      
      if (parseInt(disponibilidad.medico_id) !== parseInt(user.medico_id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: solo puedes eliminar tu propia disponibilidad' });
      }
      return disponibilidadMedicoController.delete(req, res, next);
    }
    
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo admin o médico' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;