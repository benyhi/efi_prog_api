const { Receta, RecetaMedicamento, Medicamento, HistorialPaciente, Paciente, Medico, Usuario, Especialidad, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const recetaController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, paciente_id, medico_id, vigente } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (paciente_id) {
        const historialesIds = await HistorialPaciente.findAll({
          where: { paciente_id },
          attributes: ['id']
        });
        whereClause.historial_paciente_id = {
          [Op.in]: historialesIds.map(h => h.id)
        };
      }
      if (medico_id) {
        const historialesIds = await HistorialPaciente.findAll({
          where: { medico_id },
          attributes: ['id']
        });
        whereClause.historial_paciente_id = {
          [Op.in]: historialesIds.map(h => h.id)
        };
      }
      if (vigente !== undefined) {
        if (vigente === 'true') {
          whereClause.vigencia_hasta = {
            [Op.gte]: new Date()
          };
        } else {
          whereClause.vigencia_hasta = {
            [Op.lt]: new Date()
          };
        }
      }
      const recetas = await Receta.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: HistorialPaciente,
            as: 'historial',
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
          },
          {
            model: RecetaMedicamento,
            as: 'medicamentos',
            include: [{
              model: Medicamento,
              as: 'medicamento',
              attributes: ['nombre', 'descripcion', 'presentacion']
            }]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'DESC']]
      });
      res.json({
        recetas: recetas.rows,
        totalItems: recetas.count,
        totalPages: Math.ceil(recetas.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener recetas:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const receta = await Receta.findByPk(id, {
        include: [
          {
            model: HistorialPaciente,
            as: 'historial',
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
              }
            ]
          },
          {
            model: RecetaMedicamento,
            as: 'medicamentos',
            include: [{
              model: Medicamento,
              as: 'medicamento'
            }]
          }
        ]
      });
      if (!receta) {
        return res.status(404).json({ 
          error: 'Receta no encontrada' 
        });
      }
      res.json(receta);
    } catch (error) {
      console.error('Error al obtener receta:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        historial_paciente_id, 
        fecha, 
        vigencia_hasta, 
        indicaciones_generales,
        medicamentos = []
      } = req.body;
      if (!historial_paciente_id) {
        return res.status(400).json({ 
          error: 'El historial del paciente es requerido' 
        });
      }
      const historial = await HistorialPaciente.findByPk(historial_paciente_id);
      if (!historial) {
        return res.status(404).json({ 
          error: 'Historial del paciente no encontrado' 
        });
      }
      const fechaEmision = fecha ? new Date(fecha) : new Date();
      const fechaVigencia = vigencia_hasta ? new Date(vigencia_hasta) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
      if (fechaVigencia <= fechaEmision) {
        return res.status(400).json({ 
          error: 'La fecha de vigencia debe ser posterior a la fecha de emisión' 
        });
      }
      const nuevaReceta = await Receta.create({
        historial_paciente_id,
        fecha: fechaEmision,
        vigencia_hasta: fechaVigencia,
        indicaciones_generales: indicaciones_generales?.trim()
      });
      if (medicamentos.length > 0) {
        for (const med of medicamentos) {
          const { medicamento_id, dosis, frecuencia, duracion, indicaciones_especificas } = med;
          if (!medicamento_id || !dosis || !frecuencia) {
            return res.status(400).json({ 
              error: 'Medicamento, dosis y frecuencia son requeridos para cada medicamento' 
            });
          }
          const medicamento = await Medicamento.findByPk(medicamento_id);
          if (!medicamento) {
            return res.status(404).json({ 
              error: `Medicamento con ID ${medicamento_id} no encontrado` 
            });
          }
          await RecetaMedicamento.create({
            receta_id: nuevaReceta.id,
            medicamento_id,
            dosis: dosis.trim(),
            frecuencia: frecuencia.trim(),
            duracion: duracion?.trim(),
            indicaciones_especificas: indicaciones_especificas?.trim()
          });
        }
      }
      const recetaCompleta = await Receta.findByPk(nuevaReceta.id, {
        include: [
          {
            model: HistorialPaciente,
            as: 'historial',
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
          },
          {
            model: RecetaMedicamento,
            as: 'medicamentos',
            include: [{
              model: Medicamento,
              as: 'medicamento'
            }]
          }
        ]
      });
      res.status(201).json({
        message: 'Receta creada exitosamente',
        receta: recetaCompleta
      });
    } catch (error) {
      console.error('Error al crear receta:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { vigencia_hasta, indicaciones_generales } = req.body;
      const receta = await Receta.findByPk(id);
      if (!receta) {
        return res.status(404).json({ 
          error: 'Receta no encontrada' 
        });
      }
      const datosActualizacion = {};
      if (vigencia_hasta !== undefined) {
        const nuevaVigencia = new Date(vigencia_hasta);
        if (nuevaVigencia <= receta.fecha) {
          return res.status(400).json({ 
            error: 'La fecha de vigencia debe ser posterior a la fecha de emisión' 
          });
        }
        datosActualizacion.vigencia_hasta = nuevaVigencia;
      }
      if (indicaciones_generales !== undefined) {
        datosActualizacion.indicaciones_generales = indicaciones_generales?.trim();
      }
      await receta.update(datosActualizacion);
      const recetaActualizada = await Receta.findByPk(id, {
        include: [
          {
            model: HistorialPaciente,
            as: 'historial',
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
          },
          {
            model: RecetaMedicamento,
            as: 'medicamentos',
            include: [{
              model: Medicamento,
              as: 'medicamento'
            }]
          }
        ]
      });
      res.json({
        message: 'Receta actualizada exitosamente',
        receta: recetaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar receta:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const receta = await Receta.findByPk(id);
      if (!receta) {
        return res.status(404).json({ 
          error: 'Receta no encontrada' 
        });
      }
      await RecetaMedicamento.destroy({
        where: { receta_id: id }
      });
      await receta.destroy();
      res.json({
        message: 'Receta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      next(error);
    }
  },
  agregarMedicamento: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { medicamento_id, dosis, frecuencia, duracion, indicaciones_especificas } = req.body;
      if (!medicamento_id || !dosis || !frecuencia) {
        return res.status(400).json({ 
          error: 'Medicamento, dosis y frecuencia son requeridos' 
        });
      }
      const receta = await Receta.findByPk(id);
      if (!receta) {
        return res.status(404).json({ 
          error: 'Receta no encontrada' 
        });
      }
      const medicamento = await Medicamento.findByPk(medicamento_id);
      if (!medicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado' 
        });
      }
      const medicamentoExistente = await RecetaMedicamento.findOne({
        where: { receta_id: id, medicamento_id }
      });
      if (medicamentoExistente) {
        return res.status(400).json({ 
          error: 'El medicamento ya está incluido en esta receta' 
        });
      }
      const nuevoMedicamento = await RecetaMedicamento.create({
        receta_id: id,
        medicamento_id,
        dosis: dosis.trim(),
        frecuencia: frecuencia.trim(),
        duracion: duracion?.trim(),
        indicaciones_especificas: indicaciones_especificas?.trim()
      });
      const medicamentoCompleto = await RecetaMedicamento.findByPk(nuevoMedicamento.id, {
        include: [{
          model: Medicamento,
          as: 'medicamento'
        }]
      });
      res.status(201).json({
        message: 'Medicamento agregado a la receta exitosamente',
        medicamento: medicamentoCompleto
      });
    } catch (error) {
      console.error('Error al agregar medicamento a receta:', error);
      next(error);
    }
  },
  eliminarMedicamento: async (req, res, next) => {
    try {
      const { id, medicamento_id } = req.params;
      const recetaMedicamento = await RecetaMedicamento.findOne({
        where: { receta_id: id, medicamento_id }
      });
      if (!recetaMedicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado en esta receta' 
        });
      }
      await recetaMedicamento.destroy();
      res.json({
        message: 'Medicamento eliminado de la receta exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar medicamento de receta:', error);
      next(error);
    }
  }
};
module.exports = recetaController;
