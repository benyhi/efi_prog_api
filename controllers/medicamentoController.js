const { Medicamento, RecetaMedicamento, Receta, HistorialPaciente, Paciente, Usuario, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const medicamentoController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, activo, principio_activo } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { principio_activo: { [Op.like]: `%${search}%` } },
          { laboratorio: { [Op.like]: `%${search}%` } }
        ];
      }
      if (activo !== undefined) {
        whereClause.esta_activo = activo === 'true';
      }
      if (principio_activo) {
        whereClause.principio_activo = { [Op.like]: `%${principio_activo}%` };
      }
      const medicamentos = await Medicamento.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']]
      });
      res.json({
        medicamentos: medicamentos.rows,
        totalItems: medicamentos.count,
        totalPages: Math.ceil(medicamentos.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener medicamentos:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { incluirRecetas = false } = req.query;
      const include = [];
      if (incluirRecetas === 'true') {
        include.push({
          model: RecetaMedicamento,
          as: 'recetas',
          include: [{
            model: Receta,
            as: 'receta',
            attributes: ['id', 'fecha_emision', 'vigencia_hasta'],
            include: [{
              model: HistorialPaciente,
              as: 'historial',
              attributes: ['id', 'fecha'],
              include: [{
                model: Paciente,
                as: 'paciente',
                include: [{
                  model: Usuario,
                  as: 'usuario',
                  attributes: ['nombre']
                }]
              }]
            }]
          }],
          limit: 10,
          order: [['createdAt', 'DESC']]
        });
      }
      const medicamento = await Medicamento.findByPk(id, { include });
      if (!medicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado' 
        });
      }
      res.json(medicamento);
    } catch (error) {
      console.error('Error al obtener medicamento:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        nombre, 
        principio_activo, 
        presentacion, 
        concentracion, 
        laboratorio, 
        codigo_nacional, 
        requiere_receta = true, 
        contraindicaciones, 
        efectos_secundarios, 
        esta_activo = true 
      } = req.body;
      if (!nombre || !principio_activo || !presentacion) {
        return res.status(400).json({ 
          error: 'Nombre, principio activo y presentación son requeridos' 
        });
      }
      const medicamentoExistente = await Medicamento.findOne({
        where: { 
          nombre: { [Op.like]: nombre.trim() },
          concentracion: concentracion || null
        }
      });
      if (medicamentoExistente) {
        return res.status(400).json({ 
          error: 'Ya existe un medicamento con ese nombre y concentración' 
        });
      }
      if (codigo_nacional) {
        const codigoExistente = await Medicamento.findOne({
          where: { codigo_nacional: codigo_nacional.trim() }
        });
        if (codigoExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un medicamento con ese código nacional' 
          });
        }
      }
      const nuevoMedicamento = await Medicamento.create({
        nombre: nombre.trim(),
        principio_activo: principio_activo.trim(),
        presentacion: presentacion.trim(),
        concentracion: concentracion?.trim(),
        laboratorio: laboratorio?.trim(),
        codigo_nacional: codigo_nacional?.trim(),
        requiere_receta,
        contraindicaciones: contraindicaciones?.trim(),
        efectos_secundarios: efectos_secundarios?.trim(),
        esta_activo
      });
      res.status(201).json({
        message: 'Medicamento creado exitosamente',
        medicamento: nuevoMedicamento
      });
    } catch (error) {
      console.error('Error al crear medicamento:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        nombre, 
        principio_activo, 
        presentacion, 
        concentracion, 
        laboratorio, 
        codigo_nacional, 
        requiere_receta, 
        contraindicaciones, 
        efectos_secundarios, 
        esta_activo 
      } = req.body;
      const medicamento = await Medicamento.findByPk(id);
      if (!medicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado' 
        });
      }
      if (nombre !== undefined || concentracion !== undefined) {
        const nuevoNombre = nombre !== undefined ? nombre.trim() : medicamento.nombre;
        const nuevaConcentracion = concentracion !== undefined ? concentracion?.trim() : medicamento.concentracion;
        const medicamentoExistente = await Medicamento.findOne({
          where: { 
            nombre: { [Op.like]: nuevoNombre },
            concentracion: nuevaConcentracion || null,
            id: { [Op.ne]: id }
          }
        });
        if (medicamentoExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un medicamento con ese nombre y concentración' 
          });
        }
      }
      if (codigo_nacional && codigo_nacional !== medicamento.codigo_nacional) {
        const codigoExistente = await Medicamento.findOne({
          where: { 
            codigo_nacional: codigo_nacional.trim(),
            id: { [Op.ne]: id }
          }
        });
        if (codigoExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un medicamento con ese código nacional' 
          });
        }
      }
      const datosActualizacion = {};
      if (nombre !== undefined) datosActualizacion.nombre = nombre.trim();
      if (principio_activo !== undefined) datosActualizacion.principio_activo = principio_activo.trim();
      if (presentacion !== undefined) datosActualizacion.presentacion = presentacion.trim();
      if (concentracion !== undefined) datosActualizacion.concentracion = concentracion?.trim();
      if (laboratorio !== undefined) datosActualizacion.laboratorio = laboratorio?.trim();
      if (codigo_nacional !== undefined) datosActualizacion.codigo_nacional = codigo_nacional?.trim();
      if (requiere_receta !== undefined) datosActualizacion.requiere_receta = requiere_receta;
      if (contraindicaciones !== undefined) datosActualizacion.contraindicaciones = contraindicaciones?.trim();
      if (efectos_secundarios !== undefined) datosActualizacion.efectos_secundarios = efectos_secundarios?.trim();
      if (esta_activo !== undefined) datosActualizacion.esta_activo = esta_activo;
      await medicamento.update(datosActualizacion);
      res.json({
        message: 'Medicamento actualizado exitosamente',
        medicamento
      });
    } catch (error) {
      console.error('Error al actualizar medicamento:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const medicamento = await Medicamento.findByPk(id);
      if (!medicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado' 
        });
      }
      const recetasAsociadas = await RecetaMedicamento.count({
        where: { medicamento_id: id }
      });
      if (recetasAsociadas > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el medicamento porque está siendo usado en recetas' 
        });
      }
      await medicamento.destroy();
      res.json({
        message: 'Medicamento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
      next(error);
    }
  },
  toggleEstado: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const medicamento = await Medicamento.findByPk(id);
      if (!medicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado' 
        });
      }
      const nuevoEstado = !medicamento.esta_activo;
      await medicamento.update({ esta_activo: nuevoEstado });
      res.json({
        message: `Medicamento ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        medicamento,
        motivo
      });
    } catch (error) {
      console.error('Error al cambiar estado del medicamento:', error);
      next(error);
    }
  },
  buscarPorPrincipioActivo: async (req, res, next) => {
    try {
      const { principio_activo } = req.params;
      const { activo = true } = req.query;
      if (!principio_activo) {
        return res.status(400).json({ 
          error: 'El principio activo es requerido' 
        });
      }
      const whereClause = {
        principio_activo: { [Op.like]: `%${principio_activo}%` }
      };
      if (activo !== undefined) {
        whereClause.esta_activo = activo === 'true';
      }
      const medicamentos = await Medicamento.findAll({
        where: whereClause,
        order: [['nombre', 'ASC']]
      });
      res.json({
        principio_activo,
        medicamentos
      });
    } catch (error) {
      console.error('Error al buscar medicamentos por principio activo:', error);
      next(error);
    }
  },
  getEstadisticas: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fecha_desde, fecha_hasta } = req.query;
      const medicamento = await Medicamento.findByPk(id);
      if (!medicamento) {
        return res.status(404).json({ 
          error: 'Medicamento no encontrado' 
        });
      }
      let whereClause = { medicamento_id: id };
      const includeClause = {
        model: Receta,
        as: 'receta',
        attributes: ['fecha_emision'],
        where: {}
      };
      if (fecha_desde || fecha_hasta) {
        if (fecha_desde) {
          includeClause.where.fecha_emision = { [Op.gte]: new Date(fecha_desde) };
        }
        if (fecha_hasta) {
          const fechaHasta = new Date(fecha_hasta);
          fechaHasta.setHours(23, 59, 59, 999);
          includeClause.where.fecha_emision = { 
            ...includeClause.where.fecha_emision,
            [Op.lte]: fechaHasta 
          };
        }
      }
      const recetasMedicamento = await RecetaMedicamento.findAll({
        where: whereClause,
        include: [includeClause],
        attributes: ['dosis', 'frecuencia', 'duracion']
      });
      const totalRecetas = recetasMedicamento.length;
      const dosisUnicas = [...new Set(recetasMedicamento.map(rm => rm.dosis))];
      const frecuenciasUnicas = [...new Set(recetasMedicamento.map(rm => rm.frecuencia))];
      res.json({
        medicamento: {
          id: medicamento.id,
          nombre: medicamento.nombre,
          principio_activo: medicamento.principio_activo
        },
        estadisticas: {
          total_recetas: totalRecetas,
          dosis_mas_comunes: dosisUnicas,
          frecuencias_mas_comunes: frecuenciasUnicas,
          periodo: {
            desde: fecha_desde || 'inicio',
            hasta: fecha_hasta || 'actualidad'
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del medicamento:', error);
      next(error);
    }
  }
};
module.exports = medicamentoController;