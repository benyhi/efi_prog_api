const { HistorialPaciente, Paciente, Medico, Usuario, Receta, Especialidad, RecetaMedicamento, Medicamento, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const historialPacienteController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, paciente_id, medico_id, fecha_desde, fecha_hasta } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (paciente_id) {
        whereClause.paciente_id = paciente_id;
      }
      if (medico_id) {
        whereClause.medico_id = medico_id;
      }
      if (fecha_desde || fecha_hasta) {
        whereClause.fecha = {};
        if (fecha_desde) {
          whereClause.fecha[Op.gte] = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          const fechaHasta = new Date(fecha_hasta);
          fechaHasta.setHours(23, 59, 59, 999);
          whereClause.fecha[Op.lte] = fechaHasta;
        }
      }
      const historiales = await HistorialPaciente.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo']
            }]
          },
          {
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
          },
          {
            model: Receta,
            as: 'recetas',
            attributes: ['id', 'fecha', 'indicaciones'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'DESC']]
      });
      res.json({
        historiales: historiales.rows,
        totalItems: historiales.count,
        totalPages: Math.ceil(historiales.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener historiales:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const historial = await HistorialPaciente.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo', 'fecha_nacimiento']
            }]
          },
          {
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
          },
          {
            model: Receta,
            as: 'recetas',
            include: [{
              model: RecetaMedicamento,
              as: 'medicamentos',
              include: [{
                model: Medicamento,
                as: 'medicamento',
                attributes: ['nombre', 'principio_activo', 'presentacion']
              }]
            }]
          }
        ]
      });
      if (!historial) {
        return res.status(404).json({ 
          error: 'Historial no encontrado' 
        });
      }
      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        paciente_id, 
        medico_id, 
        fecha, 
        motivo_consulta, 
        sintomas, 
        exploracion_fisica, 
        diagnostico, 
        tratamiento, 
        observaciones 
      } = req.body;
      if (!paciente_id || !medico_id || !motivo_consulta) {
        return res.status(400).json({ 
          error: 'El paciente, médico y motivo de consulta son requeridos' 
        });
      }
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({ 
          error: 'Médico no encontrado' 
        });
      }
      const nuevoHistorial = await HistorialPaciente.create({
        paciente_id,
        medico_id,
        fecha: fecha || new Date(),
        motivo_consulta: motivo_consulta.trim(),
        sintomas: sintomas?.trim(),
        exploracion_fisica: exploracion_fisica?.trim(),
        diagnostico: diagnostico?.trim(),
        tratamiento: tratamiento?.trim(),
        observaciones: observaciones?.trim()
      });
      const historialCompleto = await HistorialPaciente.findByPk(nuevoHistorial.id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo']
            }]
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['matricula'],
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          }
        ]
      });
      res.status(201).json({
        message: 'Historial creado exitosamente',
        historial: historialCompleto
      });
    } catch (error) {
      console.error('Error al crear historial:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        motivo_consulta, 
        sintomas, 
        exploracion_fisica, 
        diagnostico, 
        tratamiento, 
        observaciones 
      } = req.body;
      const historial = await HistorialPaciente.findByPk(id);
      if (!historial) {
        return res.status(404).json({ 
          error: 'Historial no encontrado' 
        });
      }
      const datosActualizacion = {};
      if (motivo_consulta !== undefined) datosActualizacion.motivo_consulta = motivo_consulta.trim();
      if (sintomas !== undefined) datosActualizacion.sintomas = sintomas?.trim();
      if (exploracion_fisica !== undefined) datosActualizacion.exploracion_fisica = exploracion_fisica?.trim();
      if (diagnostico !== undefined) datosActualizacion.diagnostico = diagnostico?.trim();
      if (tratamiento !== undefined) datosActualizacion.tratamiento = tratamiento?.trim();
      if (observaciones !== undefined) datosActualizacion.observaciones = observaciones?.trim();
      await historial.update(datosActualizacion);
      const historialActualizado = await HistorialPaciente.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'correo']
            }]
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['matricula'],
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre']
            }]
          }
        ]
      });
      res.json({
        message: 'Historial actualizado exitosamente',
        historial: historialActualizado
      });
    } catch (error) {
      console.error('Error al actualizar historial:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const historial = await HistorialPaciente.findByPk(id);
      if (!historial) {
        return res.status(404).json({ 
          error: 'Historial no encontrado' 
        });
      }
      const recetasAsociadas = await Receta.count({
        where: { historial_paciente_id: id }
      });
      if (recetasAsociadas > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el historial porque tiene recetas asociadas' 
        });
      }
      await historial.destroy();
      res.json({
        message: 'Historial eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar historial:', error);
      next(error);
    }
  },
  getByPaciente: async (req, res, next) => {
    try {
      const { paciente_id } = req.params;
      const { page = 1, limit = 10, fecha_desde, fecha_hasta } = req.query;
      const offset = (page - 1) * limit;
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const whereClause = { paciente_id };
      if (fecha_desde || fecha_hasta) {
        whereClause.fecha = {};
        if (fecha_desde) {
          whereClause.fecha[Op.gte] = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          const fechaHasta = new Date(fecha_hasta);
          fechaHasta.setHours(23, 59, 59, 999);
          whereClause.fecha[Op.lte] = fechaHasta;
        }
      }
      const historiales = await HistorialPaciente.findAndCountAll({
        where: whereClause,
        include: [
          {
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
          },
          {
            model: Receta,
            as: 'recetas',
            attributes: ['id', 'fecha', 'indicaciones'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'DESC']]
      });
      res.json({
        paciente: {
          id: paciente.id,
          numero_historia_clinica: paciente.numero_historia_clinica
        },
        historiales: historiales.rows,
        totalItems: historiales.count,
        totalPages: Math.ceil(historiales.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener historiales del paciente:', error);
      next(error);
    }
  }
};
module.exports = historialPacienteController;
