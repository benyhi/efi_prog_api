const jwt = require('jsonwebtoken');

/**
 * Middleware para validar el token JWT
 * Esperado en el header: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
        error: 'Authorization header missing'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

    // Adjuntar el usuario decodificado al request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en autenticación',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
