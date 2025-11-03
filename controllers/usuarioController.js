const { Usuario, Medico, Paciente } = require('../config/database.js');
const { Op } = require('sequelize');
const usuarioController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, rol } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {
        esta_activo: true
      };
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { correo: { [Op.like]: `%${search}%` } }
        ];
      }
      if (rol) {
        whereClause.rol = rol;
      }
      const usuarios = await Usuario.findAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['creado', 'DESC']],
        attributes: { exclude: ['contraseña'] }, 
        include: [
          {
            model: Medico,
            as: 'medico',
            required: false
          },
          {
            model: Paciente,
            as: 'paciente',
            required: false
          }
        ]
      });
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findOne({
        where: { 
          id: id,
          esta_activo: true 
        },
        attributes: { exclude: ['contraseña'] },
        include: [
          {
            model: Medico,
            as: 'medico',
            required: false
          },
          {
            model: Paciente,
            as: 'paciente',
            required: false
          }
        ]
      });
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        nombre, 
        apellido,
        correo, 
        email, 
        contraseña,
        password, 
        rol, 
        telefono, 
        direccion 
      } = req.body;
      const emailFinal = correo || email;
      const passwordFinal = contraseña || password;
      if (!nombre || !emailFinal || !passwordFinal || !rol) {
        return res.status(400).json({
          error: 'Nombre, email, contraseña y rol son requeridos'
        });
      }
      const usuarioExistente = await Usuario.findOne({
        where: { correo: emailFinal }
      });
      if (usuarioExistente) {
        return res.status(400).json({
          error: 'Ya existe un usuario con ese email'
        });
      }
      const usuario = await Usuario.create({
        nombre,
        apellido,
        correo: emailFinal,
        contraseña: passwordFinal, 
        rol,
        telefono,
        direccion,
        creado: new Date()
      });
      const { contraseña: _, ...usuarioData } = usuario.toJSON();
      res.status(201).json(usuarioData);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        nombre, 
        correo, 
        telefono, 
        direccion 
      } = req.body;
      const usuario = await Usuario.findOne({
        where: { 
          id: id,
          esta_activo: true 
        }
      });
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }
      await usuario.update({
        nombre,
        correo,
        telefono,
        direccion,
        actualizado: new Date()
      });
      const { contraseña: _, ...usuarioData } = usuario.toJSON();
      res.json(usuarioData);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findOne({
        where: { 
          id: id,
          esta_activo: true 
        }
      });
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }
      await usuario.update({
        esta_activo: false,
        actualizado: new Date()
      });
      res.json({ 
        message: 'Usuario desactivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
};
module.exports = usuarioController;