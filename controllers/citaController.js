const { Cita, Medico, Paciente, Consultorio, Usuario, sequelize, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const citaController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, fecha_inicio, fecha_fin, estado, id_medico, id_paciente } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (fecha_inicio && fecha_fin) {
        whereClause.fecha = {
          [Op.between]: [fecha_inicio, fecha_fin]
        };
      }
      if (estado) {
        whereClause.estado = estado;
      }
      if (id_medico) {
        whereClause.id_medico = id_medico;
      }
      if (id_paciente) {
        whereClause.id_paciente = id_paciente;
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
            attributes: ['id', 'nombre', 'matricula'],
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo']
            }]
          },
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id'],
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo', 'telefono']
            }]
          },
          {
            model: Consultorio,
            as: 'consultorio',
            attributes: ['id', 'nombre', 'ubicacion']
          }
        ]
      });
      res.json(citas.rows);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cita = await Cita.findOne({
        where: { 
          id: id,
          estado: { [Op.ne]: 'cancelada' } 
        },
        include: [
          {
            model: Medico,
            as: 'medico',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: { exclude: ['contraseña'] }
            }]
          },
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: { exclude: ['contraseña'] }
            }]
          },
          {
            model: Consultorio,
            as: 'consultorio'
          }
        ]
      });
      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada'
        });
      }
      res.json(cita);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const { 
        id_medico,
        id_paciente,
        id_consultorio,
        fecha,
        motivo,
        costo,
        medico_id,
        paciente_id,
        consultorio_id,
        fecha_hora
      } = req.body;
      const medicoId = id_medico || medico_id;
      const pacienteId = id_paciente || paciente_id;
      const consultorioId = id_consultorio || consultorio_id;
      const fechaCita = fecha || fecha_hora;
      if (!medicoId || !pacienteId || !consultorioId || !fechaCita) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Faltan campos requeridos: medico_id, paciente_id, consultorio_id, fecha_hora'
        });
      }
      const fechaDate = new Date(fechaCita);
      if (isNaN(fechaDate.getTime())) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'La fecha proporcionada no es válida'
        });
      }
      const citasExistentes = await Cita.findAll({
        where: {
          id_medico: medicoId,
          fecha: {
            [Op.between]: [
              new Date(new Date(fechaCita).getTime() - 30 * 60000), 
              new Date(new Date(fechaCita).getTime() + 30 * 60000)  
            ]
          },
          estado: 'programada'
        },
        transaction
      });
      if (citasExistentes.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'El médico ya tiene una cita programada en ese horario'
        });
      }
      const cita = await Cita.create({
        id_medico: medicoId,
        id_paciente: pacienteId,
        id_consultorio: consultorioId,
        fecha: fechaCita,
        motivo,
        costo,
        creado: new Date()
      }, { transaction });
      await transaction.commit();
      const citaCompleta = await Cita.findByPk(cita.id, {
        include: [
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'nombre']
          },
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          },
          {
            model: Consultorio,
            as: 'consultorio'
          }
        ]
      });
      const respuesta = {
        id: citaCompleta.id,
        id_medico: citaCompleta.id_medico,
        id_paciente: citaCompleta.id_paciente,
        id_consultorio: citaCompleta.id_consultorio,
        fecha: citaCompleta.fecha,
        estado: citaCompleta.estado,
        motivo: citaCompleta.motivo,
        costo: citaCompleta.costo,
        creado: citaCompleta.creado,
        medico_id: citaCompleta.id_medico,
        paciente_id: citaCompleta.id_paciente,
        consultorio_id: citaCompleta.id_consultorio,
        fecha_hora: citaCompleta.fecha
      };
      res.status(201).json(respuesta);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        fecha,
        estado,
        motivo,
        notas_medico,
        costo
      } = req.body;
      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada'
        });
      }
      await cita.update({
        fecha,
        estado,
        motivo,
        notas_medico,
        costo,
        actualizado: new Date()
      });
      res.json(cita);
    } catch (error) {
      next(error);
    }
  },
  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada'
        });
      }
      await cita.update({
        estado: 'cancelada',
        actualizado: new Date()
      });
      res.json({
        message: 'Cita cancelada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  },
  getCitasHoy: async (req, res, next) => {
    try {
      const hoy = new Date();
      const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
      const citas = await Cita.findAll({
        where: {
          fecha: {
            [Op.between]: [inicioDelDia, finDelDia]
          }
        },
        order: [['fecha', 'ASC']],
        include: [
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'nombre']
          },
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          }
        ]
      });
      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      next(error);
    }
  },
  cancelar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({ 
          error: 'Cita no encontrada' 
        });
      }
      if (cita.estado === 'cancelada') {
        return res.status(400).json({ 
          error: 'La cita ya está cancelada' 
        });
      }
      if (cita.estado === 'completada') {
        return res.status(400).json({ 
          error: 'No se puede cancelar una cita completada' 
        });
      }
      await cita.update({ 
        estado: 'cancelada',
        observaciones: `${cita.observaciones || ''}\nCancelada: ${motivo || 'Sin motivo especificado'}`.trim()
      });
      res.json({
        message: 'Cita cancelada exitosamente',
        cita
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      next(error);
    }
  },
  confirmar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({ 
          error: 'Cita no encontrada' 
        });
      }
      if (cita.estado !== 'programada') {
        return res.status(400).json({ 
          error: 'Solo se pueden confirmar citas programadas' 
        });
      }
      await cita.update({ estado: 'confirmada' });
      res.json({
        message: 'Cita confirmada exitosamente',
        cita
      });
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      next(error);
    }
  },
  completar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;
      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({ 
          error: 'Cita no encontrada' 
        });
      }
      if (cita.estado === 'cancelada') {
        return res.status(400).json({ 
          error: 'No se puede completar una cita cancelada' 
        });
      }
      if (cita.estado === 'completada') {
        return res.status(400).json({ 
          error: 'La cita ya está completada' 
        });
      }
      await cita.update({ 
        estado: 'completada',
        observaciones: observaciones || cita.observaciones
      });
      res.json({
        message: 'Cita completada exitosamente',
        cita
      });
    } catch (error) {
      console.error('Error al completar cita:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cita = await Cita.findByPk(id);
      if (!cita) {
        return res.status(404).json({ 
          error: 'Cita no encontrada' 
        });
      }
      await cita.update({
        estado: 'cancelada',
        actualizado: new Date()
      });
      res.json({
        message: 'Cita eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      next(error);
    }
  },
  getByPaciente: async (req, res, next) => {
    try {
      const { pacienteId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const citas = await Cita.findAndCountAll({
        where: { id_paciente: pacienteId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'DESC']],
        include: [
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'nombre', 'matricula']
          },
          {
            model: Consultorio,
            as: 'consultorio',
            attributes: ['id', 'nombre', 'ubicacion']
          }
        ]
      });
      const citasFormateadas = citas.rows.map(cita => ({
        ...cita.toJSON(),
        paciente_id: cita.id_paciente,
        medico_id: cita.id_medico,
        consultorio_id: cita.id_consultorio
      }));
      res.json(citasFormateadas);
    } catch (error) {
      next(error);
    }
  },
  getByMedico: async (req, res, next) => {
    try {
      const { medicoId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const citas = await Cita.findAndCountAll({
        where: { id_medico: medicoId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'DESC']],
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo', 'telefono']
            }]
          },
          {
            model: Consultorio,
            as: 'consultorio',
            attributes: ['id', 'nombre', 'ubicacion']
          }
        ]
      });
      const citasFormateadas = citas.rows.map(cita => ({
        ...cita.toJSON(),
        paciente_id: cita.id_paciente,
        medico_id: cita.id_medico,
        consultorio_id: cita.id_consultorio
      }));
      res.json(citasFormateadas);
    } catch (error) {
      next(error);
    }
  }
};
module.exports = citaController;