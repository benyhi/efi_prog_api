/**
 * Middleware para validar roles
 * @param {...string} allowedRoles - Roles permitidos (admin, médico, paciente)
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Validar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'Authentication required'
        });
      }

      // Obtener el rol del usuario
      const userRole = req.user.rol;

      // Validar que el rol esté en la lista de roles permitidos
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: permisos insuficientes',
          error: `User role '${userRole}' is not authorized. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error en validación de roles',
        error: error.message
      });
    }
  };
};

module.exports = checkRole;
