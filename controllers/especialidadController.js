const { Especialidad, Medico, Usuario, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const especialidadController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, incluirMedicos = false } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { descripcion: { [Op.like]: `%${search}%` } }
        ];
      }
      const include = [];
      if (incluirMedicos === 'true') {
        include.push({
          model: Medico,
          as: 'medicos',
          attributes: ['id', 'numero_matricula', 'telefono'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo']
          }]
        });
      }
      const especialidades = await Especialidad.findAndCountAll({
        where: whereClause,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']]
      });
      res.json(especialidades.rows);
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { incluirMedicos = false } = req.query;
      const include = [];
      if (incluirMedicos === 'true') {
        include.push({
          model: Medico,
          as: 'medicos',
          attributes: ['id', 'numero_matricula', 'telefono'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo']
          }]
        });
      }
      const especialidad = await Especialidad.findByPk(id, { include });
      if (!especialidad) {
        return res.status(404).json({ 
          error: 'Especialidad no encontrada' 
        });
      }
      res.json(especialidad);
    } catch (error) {
      console.error('Error al obtener especialidad:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) {
        return res.status(400).json({ 
          error: 'El nombre es requerido' 
        });
      }
      const especialidadExistente = await Especialidad.findOne({
        where: { nombre: { [Op.like]: nombre.trim() } }
      });
      if (especialidadExistente) {
        return res.status(400).json({ 
          error: 'Ya existe una especialidad con ese nombre' 
        });
      }
      const nuevaEspecialidad = await Especialidad.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim()
      });
      res.status(201).json(nuevaEspecialidad);
    } catch (error) {
      console.error('Error al crear especialidad:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const especialidad = await Especialidad.findByPk(id);
      if (!especialidad) {
        return res.status(404).json({ 
          error: 'Especialidad no encontrada' 
        });
      }
      if (nombre) {
        const especialidadExistente = await Especialidad.findOne({
          where: { 
            nombre: { [Op.like]: nombre.trim() },
            id: { [Op.ne]: id }
          }
        });
        if (especialidadExistente) {
          return res.status(400).json({ 
            error: 'Ya existe una especialidad con ese nombre' 
          });
        }
      }
      const datosActualizacion = {};
      if (nombre !== undefined) datosActualizacion.nombre = nombre.trim();
      if (descripcion !== undefined) datosActualizacion.descripcion = descripcion?.trim();
      await especialidad.update(datosActualizacion);
      res.json(especialidad);
    } catch (error) {
      console.error('Error al actualizar especialidad:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const especialidad = await Especialidad.findByPk(id);
      if (!especialidad) {
        return res.status(404).json({ 
          error: 'Especialidad no encontrada' 
        });
      }
      const medicosAsociados = await Medico.count({
        where: { especialidad_id: id }
      });
      if (medicosAsociados > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la especialidad porque tiene médicos asociados' 
        });
      }
      await especialidad.destroy();
      res.json({ message: 'Especialidad eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar especialidad:', error);
      next(error);
    }
  },
  buscarPorNombre: async (req, res, next) => {
    try {
      const { nombre } = req.params;
      const especialidades = await Especialidad.findAll({
        where: {
          nombre: { [Op.like]: `%${nombre}%` }
        },
        order: [['nombre', 'ASC']]
      });
      res.json(especialidades);
    } catch (error) {
      console.error('Error al buscar especialidades:', error);
      next(error);
    }
  }
};
module.exports = especialidadController;