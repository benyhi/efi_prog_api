const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * Generar JWT token
 * @param {Object} user - Objeto usuario con id y rol
 */
const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      correo: user.correo,
      rol: user.rol,
      nombre: user.nombre
    },
    process.env.JWT_SECRET || 'your_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    }
  );
  return token;
};

/**
 * Login: autenticar usuario y generar token
 */
const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar que se proporcionen correo y contraseña
    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos',
        error: 'Missing email or password'
      });
    }

    // Obtener el modelo de Usuario
    const { Usuario } = sequelize.models;

    // Buscar usuario por correo
    const user = await Usuario.findOne({ where: { correo } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'User not found'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'Invalid password'
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Retornar token y datos del usuario
    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación',
      error: error.message
    });
  }
};

/**
 * Registrar nuevo usuario
 */
const register = async (req, res) => {
  try {
    const { nombre, apellido, correo, contraseña, rol = 'paciente', telefono, direccion } = req.body;

    // Validar campos requeridos
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo y contraseña son requeridos',
        error: 'Missing required fields'
      });
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'médico', 'paciente'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
        error: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    // Obtener el modelo de Usuario
    const { Usuario } = sequelize.models;

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ where: { correo } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El correo ya está registrado',
        error: 'User already exists'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear nuevo usuario
    const newUser = await Usuario.create({
      nombre,
      apellido,
      correo,
      contraseña: hashedPassword,
      rol,
      telefono,
      direccion
    });

    // Generar token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          correo: newUser.correo,
          rol: newUser.rol
        }
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en registro',
      error: error.message
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener el modelo de Usuario
    const { Usuario } = sequelize.models;

    const user = await Usuario.findByPk(userId, {
      attributes: { exclude: ['contraseña'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  generateToken
};
