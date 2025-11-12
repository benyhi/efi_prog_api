const express = require('express');
const authRoutes = require('./authRoutes.js');
const usuarioRoutes = require('./usuarioRoutes.js');
const especialidadRoutes = require('./especialidadRoutes.js');
const medicoRoutes = require('./medicoRoutes.js');
const pacienteRoutes = require('./pacienteRoutes.js');
const consultorioRoutes = require('./consultorioRoutes.js');
const citaRoutes = require('./citaRoutes.js');
const historialPacienteRoutes = require('./historialPacienteRoutes.js');
const disponibilidadMedicoRoutes = require('./disponibilidadMedicoRoutes.js');
const recetaRoutes = require('./recetaRoutes.js');
const medicamentoRoutes = require('./medicamentoRoutes.js');
const pagoRoutes = require('./pagoRoutes.js');
const notificacionRoutes = require('./notificacionRoutes.js');
const router = express.Router();

// Rutas públicas (auth)
router.use('/auth', authRoutes);

// Middleware: requerir token JWT para todas las rutas que siguen
const authMiddleware = require('../middlewares/auth');
router.use(authMiddleware);

// Rutas protegidas (requieren Authorization: Bearer <token>)
router.use('/usuarios', usuarioRoutes);
router.use('/especialidades', especialidadRoutes);
router.use('/medicos', medicoRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/consultorios', consultorioRoutes);
router.use('/citas', citaRoutes);
router.use('/historiales', historialPacienteRoutes);
router.use('/disponibilidades', disponibilidadMedicoRoutes);
router.use('/recetas', recetaRoutes);
router.use('/medicamentos', medicamentoRoutes);
router.use('/pagos', pagoRoutes);
router.use('/notificaciones', notificacionRoutes);
router.get('/', (req, res) => {
  res.json({
    message: 'API Sistema Médico - Funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      especialidades: '/api/especialidades',
      medicos: '/api/medicos',
      pacientes: '/api/pacientes',
      consultorios: '/api/consultorios',
      citas: '/api/citas',
      historiales: '/api/historiales',
      disponibilidades: '/api/disponibilidades',
      recetas: '/api/recetas',
      medicamentos: '/api/medicamentos',
      pagos: '/api/pagos',
      notificaciones: '/api/notificaciones'
    }
  });
});
module.exports = router;