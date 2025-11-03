const { Paciente, Usuario, Cita, HistorialPaciente, Medico, Especialidad, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const pacienteController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, incluirCitas = false } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (search) {
        const usuariosIds = await Usuario.findAll({
          where: {
            [Op.or]: [
              { nombre: { [Op.like]: `%${search}%` } },
              { correo: { [Op.like]: `%${search}%` } }
            ]
          },
          attributes: ['id']
        });
        whereClause[Op.or] = [
          { numero_historia_clinica: { [Op.like]: `%${search}%` } },
          { telefono: { [Op.like]: `%${search}%` } },
          { direccion: { [Op.like]: `%${search}%` } },
          { id_usuario: { [Op.in]: usuariosIds.map(u => u.id) } }
        ];
      }
      const include = [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'correo', 'fecha_nacimiento']
        }
      ];
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
          }],
          order: [['fecha_hora', 'DESC']],
          limit: 5
        });
      }
      const pacientes = await Paciente.findAll({
        where: whereClause,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['creado', 'DESC']]
      });
      res.json(pacientes);
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { incluirHistorial = false, incluirCitas = false } = req.query;
      const include = [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'correo', 'fecha_nacimiento']
        }
      ];
      if (incluirHistorial === 'true') {
        include.push({
          model: HistorialPaciente,
          as: 'historiales',
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
          order: [['fecha', 'DESC']]
        });
      }
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
          }],
          order: [['fecha_hora', 'DESC']]
        });
      }
      const paciente = await Paciente.findByPk(id, { include });
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const respuesta = {
        id: paciente.id,
        numero_historia_clinica: paciente.numero_historia_clinica,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        telefono: paciente.telefono || paciente.usuario?.telefono,
        direccion: paciente.direccion || paciente.usuario?.direccion,
        grupo_sanguineo: paciente.grupo_sanguineo,
        alergias: paciente.alergias,
        antecedentes: paciente.antecedentes,
        usuario_id: paciente.id_usuario,
        nombre: paciente.usuario?.nombre,
        apellido: paciente.usuario?.apellido,
        email: paciente.usuario?.correo,
        creado: paciente.creado
      };
      res.json(respuesta);
    } catch (error) {
      console.error('Error al obtener paciente:', error);
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
        fecha_nacimiento, 
        direccion, 
        numero_historia_clinica,
        genero,
        grupo_sanguineo,
        alergias,
        antecedentes,
        usuario_id  
      } = req.body;
      if (!nombre || !email || !numero_historia_clinica) {
        return res.status(400).json({ 
          error: 'Nombre, email y número de historia clínica son requeridos' 
        });
      }
      const pacienteExistente = await Paciente.findOne({
        where: { numero_historia_clinica }
      });
      if (pacienteExistente) {
        return res.status(400).json({ 
          error: 'Ya existe un paciente con ese número de historia clínica' 
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
          rol: 'paciente',
          telefono,
          direccion,
          fecha_nacimiento
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
      const nuevoPaciente = await Paciente.create({
        numero_historia_clinica,
        fecha_nacimiento,
        genero,
        telefono,
        direccion,
        grupo_sanguineo,
        alergias,
        antecedentes,
        id_usuario: usuarioId
      });
      const pacienteCompleto = await Paciente.findByPk(nuevoPaciente.id, {
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'correo', 'telefono', 'direccion', 'fecha_nacimiento']
        }]
      });
      const respuesta = {
        id: pacienteCompleto.id,
        numero_historia_clinica: pacienteCompleto.numero_historia_clinica,
        fecha_nacimiento: pacienteCompleto.fecha_nacimiento,
        genero: pacienteCompleto.genero,
        telefono: pacienteCompleto.telefono || pacienteCompleto.usuario.telefono,
        direccion: pacienteCompleto.direccion || pacienteCompleto.usuario.direccion,
        grupo_sanguineo: pacienteCompleto.grupo_sanguineo,
        alergias: pacienteCompleto.alergias,
        antecedentes: pacienteCompleto.antecedentes,
        usuario_id: pacienteCompleto.id_usuario,
        nombre: pacienteCompleto.usuario.nombre,
        apellido: pacienteCompleto.usuario.apellido,
        email: pacienteCompleto.usuario.correo,
        creado: pacienteCompleto.creado
      };
      res.status(201).json(respuesta);
    } catch (error) {
      console.error('Error al crear paciente:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        numero_historia_clinica, 
        telefono, 
        direccion, 
        genero,
        grupo_sanguineo,
        alergias,
        antecedentes
      } = req.body;
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      if (numero_historia_clinica && numero_historia_clinica !== paciente.numero_historia_clinica) {
        const historiaExistente = await Paciente.findOne({
          where: { 
            numero_historia_clinica,
            id: { [Op.ne]: id }
          }
        });
        if (historiaExistente) {
          return res.status(400).json({ 
            error: 'Ya existe un paciente con ese número de historia clínica' 
          });
        }
      }
      const datosActualizacion = {};
      if (numero_historia_clinica !== undefined) datosActualizacion.numero_historia_clinica = numero_historia_clinica;
      if (telefono !== undefined) datosActualizacion.telefono = telefono;
      if (direccion !== undefined) datosActualizacion.direccion = direccion;
      if (genero !== undefined) datosActualizacion.genero = genero;
      if (grupo_sanguineo !== undefined) datosActualizacion.grupo_sanguineo = grupo_sanguineo;
      if (alergias !== undefined) datosActualizacion.alergias = alergias;
      if (antecedentes !== undefined) datosActualizacion.antecedentes = antecedentes;
      await paciente.update(datosActualizacion);
      const pacienteActualizado = await Paciente.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'correo', 'telefono', 'direccion', 'fecha_nacimiento']
        }]
      });
      const respuesta = {
        id: pacienteActualizado.id,
        numero_historia_clinica: pacienteActualizado.numero_historia_clinica,
        fecha_nacimiento: pacienteActualizado.fecha_nacimiento,
        genero: pacienteActualizado.genero,
        telefono: pacienteActualizado.telefono || pacienteActualizado.usuario?.telefono,
        direccion: pacienteActualizado.direccion || pacienteActualizado.usuario?.direccion,
        grupo_sanguineo: pacienteActualizado.grupo_sanguineo,
        alergias: pacienteActualizado.alergias,
        antecedentes: pacienteActualizado.antecedentes,
        usuario_id: pacienteActualizado.id_usuario,
        nombre: pacienteActualizado.usuario?.nombre,
        apellido: pacienteActualizado.usuario?.apellido,
        email: pacienteActualizado.usuario?.correo
      };
      res.json(respuesta);
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const citasAsociadas = await Cita.count({
        where: { paciente_id: id }
      });
      if (citasAsociadas > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el paciente porque tiene citas asociadas' 
        });
      }
      const historialesAsociados = await HistorialPaciente.count({
        where: { paciente_id: id }
      });
      if (historialesAsociados > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el paciente porque tiene historiales médicos asociados' 
        });
      }
      await paciente.destroy();
      res.json({
        message: 'Paciente eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      next(error);
    }
  },
  getCitas: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, estado } = req.query;
      const offset = (page - 1) * limit;
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const whereClause = { paciente_id: id };
      if (estado) {
        whereClause.estado = estado;
      }
      const citas = await Cita.findAndCountAll({
        where: whereClause,
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['numero_matricula'],
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
        order: [['fecha_hora', 'DESC']]
      });
      res.json({
        citas: citas.rows,
        totalItems: citas.count,
        totalPages: Math.ceil(citas.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener citas del paciente:', error);
      next(error);
    }
  },
  getByHistoriaClinica: async (req, res, next) => {
    try {
      const { numeroHistoria } = req.params;
      const paciente = await Paciente.findOne({
        where: { numero_historia_clinica: numeroHistoria },
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'correo', 'telefono', 'direccion', 'fecha_nacimiento']
        }]
      });
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const respuesta = {
        id: paciente.id,
        numero_historia_clinica: paciente.numero_historia_clinica,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        telefono: paciente.telefono || paciente.usuario.telefono,
        direccion: paciente.direccion || paciente.usuario.direccion,
        grupo_sanguineo: paciente.grupo_sanguineo,
        alergias: paciente.alergias,
        antecedentes: paciente.antecedentes,
        usuario_id: paciente.id_usuario,
        nombre: paciente.usuario.nombre,
        apellido: paciente.usuario.apellido,
        email: paciente.usuario.correo
      };
      res.json(respuesta);
    } catch (error) {
      console.error('Error al obtener paciente por historia clínica:', error);
      next(error);
    }
  }
};
module.exports = pacienteController;