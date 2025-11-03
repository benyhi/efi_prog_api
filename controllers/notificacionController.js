const { Notificacion, Usuario, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const notificacionController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, usuario_id, leida, tipo } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (usuario_id) {
        whereClause.usuario_id = usuario_id;
      }
      if (leida !== undefined) {
        whereClause.leida = leida === 'true';
      }
      if (tipo) {
        whereClause.tipo = tipo;
      }
      const notificaciones = await Notificacion.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo', 'rol']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_envio', 'DESC']]
      });
      res.json({
        notificaciones: notificaciones.rows,
        totalItems: notificaciones.count,
        totalPages: Math.ceil(notificaciones.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notificacion = await Notificacion.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo', 'rol']
          }
        ]
      });
      if (!notificacion) {
        return res.status(404).json({ 
          error: 'Notificación no encontrada' 
        });
      }
      res.json(notificacion);
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        usuario_id, 
        tipo, 
        titulo, 
        mensaje, 
        fecha_programada 
      } = req.body;
      if (!usuario_id || !tipo || !titulo || !mensaje) {
        return res.status(400).json({ 
          error: 'Usuario, tipo, título y mensaje son requeridos' 
        });
      }
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }
      const tiposValidos = ['recordatorio_cita', 'cambio_cita', 'resultado_disponible', 'mensaje_medico', 'sistema', 'promocion'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ 
          error: 'Tipo de notificación inválido' 
        });
      }
      const nuevaNotificacion = await Notificacion.create({
        usuario_id,
        tipo,
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        fecha_programada: fecha_programada || new Date(),
        fecha_envio: new Date(),
        leida: false
      });
      const notificacionCompleta = await Notificacion.findByPk(nuevaNotificacion.id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo', 'rol']
          }
        ]
      });
      res.status(201).json({
        message: 'Notificación creada exitosamente',
        notificacion: notificacionCompleta
      });
    } catch (error) {
      console.error('Error al crear notificación:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { titulo, mensaje, fecha_programada, leida } = req.body;
      const notificacion = await Notificacion.findByPk(id);
      if (!notificacion) {
        return res.status(404).json({ 
          error: 'Notificación no encontrada' 
        });
      }
      const datosActualizacion = {};
      if (titulo !== undefined) datosActualizacion.titulo = titulo.trim();
      if (mensaje !== undefined) datosActualizacion.mensaje = mensaje.trim();
      if (fecha_programada !== undefined) datosActualizacion.fecha_programada = new Date(fecha_programada);
      if (leida !== undefined) {
        datosActualizacion.leida = leida;
        if (leida && !notificacion.fecha_lectura) {
          datosActualizacion.fecha_lectura = new Date();
        }
      }
      await notificacion.update(datosActualizacion);
      const notificacionActualizada = await Notificacion.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo', 'rol']
          }
        ]
      });
      res.json({
        message: 'Notificación actualizada exitosamente',
        notificacion: notificacionActualizada
      });
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notificacion = await Notificacion.findByPk(id);
      if (!notificacion) {
        return res.status(404).json({ 
          error: 'Notificación no encontrada' 
        });
      }
      await notificacion.destroy();
      res.json({
        message: 'Notificación eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      next(error);
    }
  },
  marcarLeida: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notificacion = await Notificacion.findByPk(id);
      if (!notificacion) {
        return res.status(404).json({ 
          error: 'Notificación no encontrada' 
        });
      }
      await notificacion.update({ 
        leida: true,
        fecha_lectura: new Date()
      });
      res.json({
        message: 'Notificación marcada como leída',
        notificacion
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      next(error);
    }
  },
  marcarVariasLeidas: async (req, res, next) => {
    try {
      const { notificacion_ids } = req.body;
      if (!notificacion_ids || !Array.isArray(notificacion_ids)) {
        return res.status(400).json({ 
          error: 'Se requiere un array de IDs de notificaciones' 
        });
      }
      await Notificacion.update(
        { 
          leida: true,
          fecha_lectura: new Date()
        },
        {
          where: {
            id: { [Op.in]: notificacion_ids }
          }
        }
      );
      res.json({
        message: `${notificacion_ids.length} notificaciones marcadas como leídas`
      });
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
      next(error);
    }
  },
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;
      const { page = 1, limit = 10, solo_no_leidas = false, tipo } = req.query;
      const offset = (page - 1) * limit;
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }
      const whereClause = { usuario_id };
      if (solo_no_leidas === 'true') {
        whereClause.leida = false;
      }
      if (tipo) {
        whereClause.tipo = tipo;
      }
      const notificaciones = await Notificacion.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_envio', 'DESC']]
      });
      const noLeidas = await Notificacion.count({
        where: { 
          usuario_id,
          leida: false
        }
      });
      res.json({
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          rol: usuario.rol
        },
        notificaciones: notificaciones.rows,
        totalItems: notificaciones.count,
        totalPages: Math.ceil(notificaciones.count / limit),
        currentPage: parseInt(page),
        no_leidas: noLeidas
      });
    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      next(error);
    }
  },
  createMasiva: async (req, res, next) => {
    try {
      const { 
        usuarios_ids, 
        tipo, 
        titulo, 
        mensaje, 
        fecha_programada,
        filtro_rol 
      } = req.body;
      if (!tipo || !titulo || !mensaje) {
        return res.status(400).json({ 
          error: 'Tipo, título y mensaje son requeridos' 
        });
      }
      let usuariosDestino = [];
      if (usuarios_ids && Array.isArray(usuarios_ids)) {
        usuariosDestino = await Usuario.findAll({
          where: { id: { [Op.in]: usuarios_ids } },
          attributes: ['id']
        });
      } else if (filtro_rol) {
        usuariosDestino = await Usuario.findAll({
          where: { 
            rol: filtro_rol,
            esta_activo: true
          },
          attributes: ['id']
        });
      } else {
        return res.status(400).json({ 
          error: 'Debe especificar usuarios específicos o un rol' 
        });
      }
      if (usuariosDestino.length === 0) {
        return res.status(404).json({ 
          error: 'No se encontraron usuarios para enviar la notificación' 
        });
      }
      const notificaciones = [];
      for (const usuario of usuariosDestino) {
        const notificacion = await Notificacion.create({
          usuario_id: usuario.id,
          tipo,
          titulo: titulo.trim(),
          mensaje: mensaje.trim(),
          fecha_programada: fecha_programada || new Date(),
          fecha_envio: new Date(),
          leida: false
        });
        notificaciones.push(notificacion);
      }
      res.status(201).json({
        message: `${notificaciones.length} notificaciones creadas exitosamente`,
        total_enviadas: notificaciones.length,
        tipo,
        titulo
      });
    } catch (error) {
      console.error('Error al crear notificaciones masivas:', error);
      next(error);
    }
  },
  getEstadisticas: async (req, res, next) => {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      const whereClause = {};
      if (fecha_desde || fecha_hasta) {
        whereClause.fecha_envio = {};
        if (fecha_desde) {
          whereClause.fecha_envio[Op.gte] = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          const fechaHasta = new Date(fecha_hasta);
          fechaHasta.setHours(23, 59, 59, 999);
          whereClause.fecha_envio[Op.lte] = fechaHasta;
        }
      }
      const totalNotificaciones = await Notificacion.count({ where: whereClause });
      const leidas = await Notificacion.count({ 
        where: { ...whereClause, leida: true } 
      });
      const noLeidas = await Notificacion.count({ 
        where: { ...whereClause, leida: false } 
      });
      const porTipo = await Notificacion.findAll({
        where: whereClause,
        attributes: [
          'tipo',
          [Notificacion.sequelize.fn('COUNT', Notificacion.sequelize.col('id')), 'cantidad']
        ],
        group: ['tipo'],
        raw: true
      });
      const porUsuario = await Notificacion.findAll({
        where: whereClause,
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'rol']
        }],
        attributes: [
          'usuario_id',
          [Notificacion.sequelize.fn('COUNT', Notificacion.sequelize.col('Notificacion.id')), 'cantidad']
        ],
        group: ['usuario_id', 'usuario.id'],
        order: [[Notificacion.sequelize.literal('cantidad'), 'DESC']],
        limit: 10,
        raw: false
      });
      res.json({
        resumen: {
          total: totalNotificaciones,
          leidas,
          no_leidas: noLeidas,
          porcentaje_leidas: totalNotificaciones > 0 ? ((leidas / totalNotificaciones) * 100).toFixed(2) : 0
        },
        por_tipo: porTipo,
        top_usuarios: porUsuario,
        periodo: {
          desde: fecha_desde || 'inicio',
          hasta: fecha_hasta || 'actualidad'
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de notificaciones:', error);
      next(error);
    }
  }
};
module.exports = notificacionController;
