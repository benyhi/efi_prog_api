const { Medico, Usuario, Especialidad, Cita, DisponibilidadMedico } = require('../config/database.js');
const { Op } = require('sequelize');
const medicoController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, id_especialidad, estado } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { matricula: { [Op.like]: `%${search}%` } }
        ];
      }
      if (id_especialidad) {
        whereClause.id_especialidad = id_especialidad;
      }
      if (estado !== undefined) {
        whereClause.estado = estado === 'true';
      }
      const medicos = await Medico.findAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['creado', 'DESC']],
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: { exclude: ['contraseña'] }
          },
          {
            model: Especialidad,
            as: 'especialidad',
            attributes: ['id', 'nombre', 'descripcion']
          }
        ]
      });
      res.json(medicos);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const medico = await Medico.findOne({
        where: { 
          id: id,
          estado: true
        },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: { exclude: ['contraseña'] }
          },
          {
            model: Especialidad,
            as: 'especialidad'
          },
          {
            model: DisponibilidadMedico,
            as: 'disponibilidades'
          }
        ]
      });
      if (!medico) {
        return res.status(404).json({
          error: 'Médico no encontrado'
        });
      }
      res.json(medico);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        nombre,
        apellido,
        email,
        telefono,
        matricula,
        especialidad_id,
        usuario_id  
      } = req.body;
      if (!nombre || !email || !matricula || !especialidad_id) {
        return res.status(400).json({ 
          error: 'Nombre, email, matrícula y especialidad son requeridos' 
        });
      }
      const medicoExistente = await Medico.findOne({
        where: { matricula: matricula }
      });
      if (medicoExistente) {
        return res.status(400).json({ 
          error: 'Ya existe un médico con esa matrícula' 
        });
      }
      let usuarioId;
      if (nombre && email) {
        const usuarioExistente = await Usuario.findOne({
          where: { correo: email }
        });
        if (usuarioExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un usuario con ese email' 
          });
        }
        const nuevoUsuario = await Usuario.create({
          nombre,
          apellido,
          correo: email,
          contraseña: 'temp123', 
          rol: 'médico',
          telefono
        });
        usuarioId = nuevoUsuario.id;
      } else if (usuario_id) {
        const usuario = await Usuario.findByPk(usuario_id);
        if (!usuario) {
          return res.status(404).json({ 
            error: 'Usuario no encontrado' 
          });
        }
        usuarioId = usuario_id;
      } else {
        return res.status(400).json({ 
          error: 'Se requieren datos del usuario o usuario_id' 
        });
      }
      const medico = await Medico.create({
        nombre: nombre || `Dr. ${apellido}`, 
        matricula,
        id_especialidad: especialidad_id,
        id_usuario: usuarioId
      });
      const medicoCompleto = await Medico.findByPk(medico.id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'correo', 'telefono']
          },
          {
            model: Especialidad,
            as: 'especialidad',
            attributes: ['id', 'nombre']
          }
        ]
      });
      const respuesta = {
        id: medicoCompleto.id,
        matricula: medicoCompleto.matricula,
        especialidad_id: medicoCompleto.id_especialidad,
        usuario_id: medicoCompleto.id_usuario,
        nombre: medicoCompleto.usuario.nombre,
        apellido: medicoCompleto.usuario.apellido,
        email: medicoCompleto.usuario.correo,
        telefono: medicoCompleto.usuario.telefono,
        creado: medicoCompleto.creado
      };
      res.status(201).json(respuesta);
    } catch (error) {
      next(error);
    }
  },
  getCitas: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, fecha_inicio, fecha_fin, estado } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = { id_medico: id };
      if (fecha_inicio && fecha_fin) {
        whereClause.fecha = {
          [Op.between]: [fecha_inicio, fecha_fin]
        };
      }
      if (estado) {
        whereClause.estado = estado;
      }
      const citas = await Cita.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'ASC']],
        include: [
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'nombre']
          }
        ]
      });
      res.json({
        data: citas.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(citas.count / limit),
          totalItems: citas.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        nombre,
        apellido,
        telefono,
        email,
        matricula,
        id_especialidad,
        especialidad_id, 
        horario_inicio,
        horario_fin,
        dias_trabajo,
        estado
      } = req.body;
      const especialidadId = especialidad_id || id_especialidad;
      const medico = await Medico.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario'
          }
        ]
      });
      if (!medico) {
        return res.status(404).json({
          error: 'Médico no encontrado'
        });
      }
      if (matricula && matricula !== medico.matricula) {
        const medicoExistente = await Medico.findOne({
          where: { 
            matricula: matricula,
            id: { [Op.ne]: id }
          }
        });
        if (medicoExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un médico con esa matrícula' 
          });
        }
      }
      await medico.update({
        matricula,
        id_especialidad: especialidadId,
        horario_inicio,
        horario_fin,
        dias_trabajo,
        estado,
        actualizado: new Date()
      });
      if (nombre || apellido || telefono || email) {
        await medico.usuario.update({
          nombre: nombre || medico.usuario.nombre,
          apellido: apellido || medico.usuario.apellido,
          telefono: telefono || medico.usuario.telefono,
          correo: email || medico.usuario.correo
        });
      }
      const medicoActualizado = await Medico.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: { exclude: ['contraseña'] }
          },
          {
            model: Especialidad,
            as: 'especialidad'
          }
        ]
      });
      const respuesta = {
        id: medicoActualizado.id,
        matricula: medicoActualizado.matricula,
        especialidad_id: medicoActualizado.id_especialidad,
        usuario_id: medicoActualizado.id_usuario,
        nombre: medicoActualizado.usuario.nombre,
        apellido: medicoActualizado.usuario.apellido,
        email: medicoActualizado.usuario.correo,
        telefono: medicoActualizado.usuario.telefono,
        horario_inicio: medicoActualizado.horario_inicio,
        horario_fin: medicoActualizado.horario_fin,
        dias_trabajo: medicoActualizado.dias_trabajo,
        estado: medicoActualizado.estado,
        actualizado: medicoActualizado.actualizado
      };
      res.json(respuesta);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const medico = await Medico.findByPk(id);
      if (!medico) {
        return res.status(404).json({
          error: 'Médico no encontrado'
        });
      }
      await medico.update({
        estado: false,
        actualizado: new Date()
      });
      res.json({
        message: 'Médico desactivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  },
  getByEspecialidad: async (req, res, next) => {
    try {
      const { especialidadId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const medicos = await Medico.findAndCountAll({
        where: { 
          id_especialidad: especialidadId,
          estado: true
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: { exclude: ['contraseña'] }
          },
          {
            model: Especialidad,
            as: 'especialidad'
          }
        ]
      });
      const medicosFormateados = medicos.rows.map(medico => ({
        id: medico.id,
        nombre: medico.nombre,
        matricula: medico.matricula,
        especialidad_id: medico.id_especialidad,
        usuario_id: medico.id_usuario,
        horario_inicio: medico.horario_inicio,
        horario_fin: medico.horario_fin,
        dias_trabajo: medico.dias_trabajo,
        estado: medico.estado,
        creado: medico.creado,
        actualizado: medico.actualizado,
        usuario: medico.usuario,
        especialidad: medico.especialidad
      }));
      res.json(medicosFormateados);
    } catch (error) {
      next(error);
    }
  }
};
module.exports = medicoController;