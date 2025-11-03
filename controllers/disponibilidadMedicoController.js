const { DisponibilidadMedico, Medico, Usuario, Cita, Especialidad, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const disponibilidadMedicoController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, medico_id, fecha, dia_semana } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (medico_id) {
        whereClause.medico_id = medico_id;
      }
      if (dia_semana) {
        whereClause.dia_semana = dia_semana;
      }
      const disponibilidades = await DisponibilidadMedico.findAndCountAll({
        where: whereClause,
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['matricula'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }, {
            model: Especialidad,
            as: 'especialidad',
            attributes: ['nombre']
          }]
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']]
      });
      res.json({
        disponibilidades: disponibilidades.rows,
        totalItems: disponibilidades.count,
        totalPages: Math.ceil(disponibilidades.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener disponibilidades:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const disponibilidad = await DisponibilidadMedico.findByPk(id, {
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['matricula'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }, {
            model: Especialidad,
            as: 'especialidad',
            attributes: ['nombre']
          }]
        }]
      });
      if (!disponibilidad) {
        return res.status(404).json({ 
          error: 'Disponibilidad no encontrada' 
        });
      }
      res.json(disponibilidad);
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        medico_id, 
        fecha, 
        dia_semana, 
        hora_inicio, 
        hora_fin, 
        es_disponible = true 
      } = req.body;
      if (!medico_id || !dia_semana || !hora_inicio || !hora_fin) {
        return res.status(400).json({ 
          error: 'Médico, día de la semana, hora de inicio y fin son requeridos' 
        });
      }
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({ 
          error: 'Médico no encontrado' 
        });
      }
      const horaInicioValida = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora_inicio);
      const horaFinValida = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora_fin);
      if (!horaInicioValida || !horaFinValida) {
        return res.status(400).json({ 
          error: 'Formato de hora inválido. Use HH:MM' 
        });
      }
      const [horaIni, minIni] = hora_inicio.split(':').map(Number);
      const [horaFin, minFin] = hora_fin.split(':').map(Number);
      const minutosInicio = horaIni * 60 + minIni;
      const minutosFin = horaFin * 60 + minFin;
      if (minutosFin <= minutosInicio) {
        return res.status(400).json({ 
          error: 'La hora de fin debe ser mayor que la hora de inicio' 
        });
      }
      const whereClause = {
        medico_id,
        [Op.or]: [
          {
            hora_inicio: { [Op.lte]: hora_inicio },
            hora_fin: { [Op.gt]: hora_inicio }
          },
          {
            hora_inicio: { [Op.lt]: hora_fin },
            hora_fin: { [Op.gte]: hora_fin }
          },
          {
            hora_inicio: { [Op.gte]: hora_inicio },
            hora_fin: { [Op.lte]: hora_fin }
          }
        ]
      };
      whereClause.dia_semana = dia_semana;
      const disponibilidadExistente = await DisponibilidadMedico.findOne({
        where: whereClause
      });
      if (disponibilidadExistente) {
        return res.status(400).json({ 
          error: 'Ya existe una disponibilidad que se solapa con este horario' 
        });
      }
      const nuevaDisponibilidad = await DisponibilidadMedico.create({
        medico_id,
        dia_semana,
        hora_inicio,
        hora_fin
      });
      const disponibilidadCompleta = await DisponibilidadMedico.findByPk(nuevaDisponibilidad.id, {
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['matricula'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }]
        }]
      });
      res.status(201).json({
        message: 'Disponibilidad creada exitosamente',
        disponibilidad: disponibilidadCompleta
      });
    } catch (error) {
      console.error('Error al crear disponibilidad:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fecha, dia_semana, hora_inicio, hora_fin, es_disponible } = req.body;
      const disponibilidad = await DisponibilidadMedico.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({ 
          error: 'Disponibilidad no encontrada' 
        });
      }
      const datosActualizacion = {};
      if (dia_semana !== undefined) datosActualizacion.dia_semana = dia_semana;
      if (hora_inicio !== undefined || hora_fin !== undefined) {
        const nuevaHoraInicio = hora_inicio || disponibilidad.hora_inicio;
        const nuevaHoraFin = hora_fin || disponibilidad.hora_fin;
        const horaInicioValida = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(nuevaHoraInicio);
        const horaFinValida = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(nuevaHoraFin);
        if (!horaInicioValida || !horaFinValida) {
          return res.status(400).json({ 
            error: 'Formato de hora inválido. Use HH:MM' 
          });
        }
        const [horaIni, minIni] = nuevaHoraInicio.split(':').map(Number);
        const [horaFin, minFin] = nuevaHoraFin.split(':').map(Number);
        const minutosInicio = horaIni * 60 + minIni;
        const minutosFin = horaFin * 60 + minFin;
        if (minutosFin <= minutosInicio) {
          return res.status(400).json({ 
            error: 'La hora de fin debe ser mayor que la hora de inicio' 
          });
        }
        datosActualizacion.hora_inicio = nuevaHoraInicio;
        datosActualizacion.hora_fin = nuevaHoraFin;
      }
      await disponibilidad.update(datosActualizacion);
      const disponibilidadActualizada = await DisponibilidadMedico.findByPk(id, {
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['matricula'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }]
        }]
      });
      res.json({
        message: 'Disponibilidad actualizada exitosamente',
        disponibilidad: disponibilidadActualizada
      });
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const disponibilidad = await DisponibilidadMedico.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({ 
          error: 'Disponibilidad no encontrada' 
        });
      }
      let whereClause = {
        medico_id: disponibilidad.medico_id,
        estado: {
          [Op.in]: ['programada', 'en_curso']
        }
      };
      const citasEnHorario = 0; 
      if (citasEnHorario > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la disponibilidad porque hay citas programadas en este horario' 
        });
      }
      await disponibilidad.destroy();
      res.json({
        message: 'Disponibilidad eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar disponibilidad:', error);
      next(error);
    }
  },
  getByMedico: async (req, res, next) => {
    try {
      const { medico_id } = req.params;
      const { fecha, dia_semana, solo_disponibles = false } = req.query;
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({ 
          error: 'Médico no encontrado' 
        });
      }
      const whereClause = { medico_id };
      if (fecha) {
        whereClause.fecha = fecha;
      }
      if (dia_semana) {
        whereClause.dia_semana = dia_semana;
      }
      if (solo_disponibles === 'true') {
        whereClause.es_disponible = true;
      }
      const disponibilidades = await DisponibilidadMedico.findAll({
        where: whereClause,
        order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
      });
      res.json({
        medico: {
          id: medico.id,
          matricula: medico.matricula
        },
        disponibilidades
      });
    } catch (error) {
      console.error('Error al obtener disponibilidades del médico:', error);
      next(error);
    }
  }
};
module.exports = disponibilidadMedicoController;
