const express = require('express');
const recetaController = require('../controllers/recetaController.js');
const checkRole = require('../middlewares/checkRole.js');
const { HistorialPaciente } = require('../config/database.js');
const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', recetaController.getAll);
router.get('/:id', recetaController.getById);

// Crear receta: admin o médico
router.post('/', checkRole('admin', 'médico'), recetaController.create);

// Actualizar receta: admin o el médico que la creó
router.put('/:id', async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    if (user.rol === 'admin') return recetaController.update(req, res, next);
    
    // Para médico: verificar que es el médico que creó la receta
    if (user.rol === 'médico' && user.medico_id) {
      const { Receta } = require('../config/database.js');
      const receta = await Receta.findByPk(req.params.id);
      if (!receta) return res.status(404).json({ success: false, message: 'Receta no encontrada' });
      
      // Verificar que el médico que crea la receta es el mismo que intenta editarla
      const historial = await HistorialPaciente.findByPk(receta.historial_paciente_id);
      if (!historial) return res.status(404).json({ success: false, message: 'Historial no encontrado' });
      
      if (parseInt(historial.medico_id) !== parseInt(user.medico_id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: solo el médico que creó la receta puede editarla' });
      }
      return recetaController.update(req, res, next);
    }
    
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo admin o médico' });
  } catch (error) {
    next(error);
  }
});

// Eliminar receta: solo admin
router.delete('/:id', checkRole('admin'), recetaController.delete);

// Agregar medicamento a receta: admin o el médico que la creó
router.post('/:id/medicamentos', async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    if (user.rol === 'admin') return recetaController.agregarMedicamento(req, res, next);
    
    if (user.rol === 'médico' && user.medico_id) {
      const { Receta } = require('../config/database.js');
      const receta = await Receta.findByPk(req.params.id);
      if (!receta) return res.status(404).json({ success: false, message: 'Receta no encontrada' });
      
      const historial = await HistorialPaciente.findByPk(receta.historial_paciente_id);
      if (!historial) return res.status(404).json({ success: false, message: 'Historial no encontrado' });
      
      if (parseInt(historial.medico_id) !== parseInt(user.medico_id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: solo el médico que creó la receta puede modificarla' });
      }
      return recetaController.agregarMedicamento(req, res, next);
    }
    
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo admin o médico' });
  } catch (error) {
    next(error);
  }
});

// Eliminar medicamento de receta: solo admin
router.delete('/:id/medicamentos/:medicamento_id', checkRole('admin'), recetaController.eliminarMedicamento);

module.exports = router;