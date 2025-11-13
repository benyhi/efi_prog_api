/**
 * Middleware para enriquecer req.user con la información de paciente o médico
 * Tras autenticar, busca si el usuario tiene un perfil de paciente o médico
 * y lo asigna a req.user.paciente_id o req.user.medico_id
 */
const { Paciente, Medico } = require('../config/database');

const enrichUserRole = async (req, res, next) => {
  try {
    // Si no hay usuario autenticado, pasar al siguiente middleware
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;

    // Buscar si este usuario tiene un perfil de paciente
    const paciente = await Paciente.findOne({
      where: { id_usuario: userId }
    });
    if (paciente) {
      req.user.paciente_id = paciente.id;
    }

    // Buscar si este usuario tiene un perfil de médico
    const medico = await Medico.findOne({
      where: { id_usuario: userId }
    });
    if (medico) {
      req.user.medico_id = medico.id;
    }

    next();
  } catch (error) {
    // Si hay un error en el middleware, no bloquear la cadena
    console.error('Error en enrichUserRole:', error.message);
    next();
  }
};

module.exports = enrichUserRole;
