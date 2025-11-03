const { Consultorio, Cita, Medico, Usuario, Paciente, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const consultorioController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, disponible, incluirCitas = false } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { numero: { [Op.like]: `%${search}%` } },
          { nombre: { [Op.like]: `%${search}%` } },
          { ubicacion: { [Op.like]: `%${search}%` } }
        ];
      }
      if (disponible !== undefined) {
        whereClause.esta_disponible = disponible === 'true';
      }
      const include = [];
      if (incluirCitas === 'true') {
        include.push({
          model: Cita,
          as: 'citas',
          where: {
            fecha_hora: {
              [Op.gte]: new Date()
            }
          },
          required: false,
          include: [{
            model: Medico,
            as: 'medico',
            attributes: ['numero_matricula'],
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          }],
          order: [['fecha_hora', 'ASC']],
          limit: 5
        });
      }
      const consultorios = await Consultorio.findAndCountAll({
        where: whereClause,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['numero', 'ASC']]
      });
      res.json(consultorios.rows);
    } catch (error) {
      console.error('Error al obtener consultorios:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { incluirCitas = false } = req.query;
      const include = [];
      if (incluirCitas === 'true') {
        include.push({
          model: Cita,
          as: 'citas',
          include: [{
            model: Medico,
            as: 'medico',
            attributes: ['numero_matricula'],
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          }, {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          }],
          order: [['fecha_hora', 'ASC']]
        });
      }
      const consultorio = await Consultorio.findByPk(id, { include });
      if (!consultorio) {
        return res.status(404).json({ 
          error: 'Consultorio no encontrado' 
        });
      }
      res.json(consultorio);
    } catch (error) {
      console.error('Error al obtener consultorio:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { numero, nombre, ubicacion, capacidad = 1, esta_disponible = true } = req.body;
      if (!numero || !nombre) {
        return res.status(400).json({ 
          error: 'El número y nombre del consultorio son requeridos' 
        });
      }
      const consultorioExistente = await Consultorio.findOne({
        where: { numero: numero.toString().trim() }
      });
      if (consultorioExistente) {
        return res.status(400).json({ 
          error: 'Ya existe un consultorio con ese número' 
        });
      }
      const nuevoConsultorio = await Consultorio.create({
        numero: numero.toString().trim(),
        nombre: nombre.trim(),
        ubicacion: ubicacion?.trim(),
        capacidad: parseInt(capacidad) || 1,
        esta_disponible
      });
      res.status(201).json(nuevoConsultorio);
    } catch (error) {
      console.error('Error al crear consultorio:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { numero, nombre, ubicacion, capacidad, esta_disponible } = req.body;
      const consultorio = await Consultorio.findByPk(id);
      if (!consultorio) {
        return res.status(404).json({ 
          error: 'Consultorio no encontrado' 
        });
      }
      if (numero && numero !== consultorio.numero) {
        const consultorioExistente = await Consultorio.findOne({
          where: { 
            numero: numero.toString().trim(),
            id: { [Op.ne]: id }
          }
        });
        if (consultorioExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un consultorio con ese número' 
          });
        }
      }
      const datosActualizacion = {};
      if (numero !== undefined) datosActualizacion.numero = numero.toString().trim();
      if (nombre !== undefined) datosActualizacion.nombre = nombre.trim();
      if (ubicacion !== undefined) datosActualizacion.ubicacion = ubicacion?.trim();
      if (capacidad !== undefined) datosActualizacion.capacidad = parseInt(capacidad) || 1;
      if (esta_disponible !== undefined) datosActualizacion.esta_disponible = esta_disponible;
      await consultorio.update(datosActualizacion);
      res.json(consultorio);
    } catch (error) {
      console.error('Error al actualizar consultorio:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const consultorio = await Consultorio.findByPk(id);
      if (!consultorio) {
        return res.status(404).json({ 
          error: 'Consultorio no encontrado' 
        });
      }
      const citasAsociadas = await Cita.count({
        where: { consultorio_id: id }
      });
      if (citasAsociadas > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el consultorio porque tiene citas asociadas' 
        });
      }
      await consultorio.destroy();
      res.json({
        message: 'Consultorio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar consultorio:', error);
      next(error);
    }
  },
  getDisponibilidad: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fecha } = req.query;
      const consultorio = await Consultorio.findByPk(id);
      if (!consultorio) {
        return res.status(404).json({ 
          error: 'Consultorio no encontrado' 
        });
      }
      if (!consultorio.esta_disponible) {
        return res.json({
          disponible: false,
          motivo: 'Consultorio no disponible',
          citas: []
        });
      }
      let whereClause = { consultorio_id: id };
      if (fecha) {
        const fechaInicio = new Date(fecha);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        whereClause.fecha_hora = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      } else {
        whereClause.fecha_hora = {
          [Op.gte]: new Date()
        };
      }
      const citas = await Cita.findAll({
        where: whereClause,
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['numero_matricula'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }]
        }, {
          model: Paciente,
          as: 'paciente',
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }]
        }],
        order: [['fecha_hora', 'ASC']]
      });
      res.json({
        disponible: true,
        consultorio: {
          id: consultorio.id,
          numero: consultorio.numero,
          nombre: consultorio.nombre,
          ubicacion: consultorio.ubicacion
        },
        citas
      });
    } catch (error) {
      console.error('Error al obtener disponibilidad del consultorio:', error);
      next(error);
    }
  },
  toggleDisponibilidad: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const consultorio = await Consultorio.findByPk(id);
      if (!consultorio) {
        return res.status(404).json({ 
          error: 'Consultorio no encontrado' 
        });
      }
      const nuevoEstado = !consultorio.esta_disponible;
      if (!nuevoEstado) {
        const citasFuturas = await Cita.count({
          where: {
            consultorio_id: id,
            fecha_hora: {
              [Op.gte]: new Date()
            },
            estado: {
              [Op.in]: ['programada', 'en_curso']
            }
          }
        });
        if (citasFuturas > 0) {
          return res.status(400).json({ 
            error: 'No se puede deshabilitar el consultorio porque tiene citas futuras programadas' 
          });
        }
      }
      await consultorio.update({ 
        esta_disponible: nuevoEstado
      });
      res.json({
        message: `Consultorio ${nuevoEstado ? 'habilitado' : 'deshabilitado'} exitosamente`,
        consultorio,
        motivo
      });
    } catch (error) {
      console.error('Error al cambiar disponibilidad del consultorio:', error);
      next(error);
    }
  },
  getByNumero: async (req, res, next) => {
    try {
      const { numero } = req.params;
      const consultorio = await Consultorio.findOne({
        where: { numero: numero.toString().trim() }
      });
      if (!consultorio) {
        return res.status(404).json({ 
          error: 'Consultorio no encontrado' 
        });
      }
      res.json(consultorio);
    } catch (error) {
      console.error('Error al obtener consultorio por número:', error);
      next(error);
    }
  },
  getDisponibles: async (req, res, next) => {
    try {
      const consultorios = await Consultorio.findAll({
        where: { esta_disponible: true },
        order: [['numero', 'ASC']]
      });
      res.json(consultorios);
    } catch (error) {
      console.error('Error al obtener consultorios disponibles:', error);
      next(error);
    }
  }
};
module.exports = consultorioController;