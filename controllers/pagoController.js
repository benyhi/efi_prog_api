const { Pago, Cita, Paciente, Medico, Usuario, Especialidad, Consultorio, Sequelize } = require('../config/database.js');
const { Op } = Sequelize;
const pagoController = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, paciente_id, estado, metodo, fecha_desde, fecha_hasta } = req.query;
      const offset = (page - 1) * limit;
      const whereClause = {};
      if (paciente_id) {
        const citasIds = await Cita.findAll({
          where: { paciente_id },
          attributes: ['id']
        });
        whereClause.cita_id = {
          [Op.in]: citasIds.map(c => c.id)
        };
      }
      if (estado) {
        whereClause.estado = estado;
      }
      if (metodo) {
        whereClause.metodo = metodo;
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
      const pagos = await Pago.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Cita,
            as: 'cita',
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
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha', 'DESC']]
      });
      res.json({
        pagos: pagos.rows,
        totalItems: pagos.count,
        totalPages: Math.ceil(pagos.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const pago = await Pago.findByPk(id, {
        include: [
          {
            model: Cita,
            as: 'cita',
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
                model: Consultorio,
                as: 'consultorio',
                attributes: ['numero', 'nombre']
              }
            ]
          }
        ]
      });
      if (!pago) {
        return res.status(404).json({ 
          error: 'Pago no encontrado' 
        });
      }
      res.json(pago);
    } catch (error) {
      console.error('Error al obtener pago:', error);
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { 
        cita_id, 
        monto, 
        metodo, 
        fecha, 
        numero_transaccion, 
        observaciones 
      } = req.body;
      if (!cita_id || !monto || !metodo) {
        return res.status(400).json({ 
          error: 'Cita, monto y método de pago son requeridos' 
        });
      }
      const cita = await Cita.findByPk(cita_id);
      if (!cita) {
        return res.status(404).json({ 
          error: 'Cita no encontrada' 
        });
      }
      const pagoExistente = await Pago.findOne({
        where: { 
          cita_id,
          estado: 'completado'
        }
      });
      if (pagoExistente) {
        return res.status(400).json({ 
          error: 'Ya existe un pago completado para esta cita' 
        });
      }
      if (monto <= 0) {
        return res.status(400).json({ 
          error: 'El monto debe ser mayor a 0' 
        });
      }
      const metodosPago = ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'obra_social'];
      if (!metodosPago.includes(metodo)) {
        return res.status(400).json({ 
          error: 'Método de pago inválido' 
        });
      }
      const nuevoPago = await Pago.create({
        cita_id,
        monto: parseFloat(monto),
        metodo,
        fecha: fecha || new Date(),
        numero_transaccion: numero_transaccion?.trim(),
        observaciones: observaciones?.trim(),
        estado: 'completado' 
      });
      const pagoCompleto = await Pago.findByPk(nuevoPago.id, {
        include: [
          {
            model: Cita,
            as: 'cita',
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
          }
        ]
      });
      res.status(201).json({
        message: 'Pago registrado exitosamente',
        pago: pagoCompleto
      });
    } catch (error) {
      console.error('Error al crear pago:', error);
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { monto, metodo, numero_transaccion, observaciones, estado } = req.body;
      const pago = await Pago.findByPk(id);
      if (!pago) {
        return res.status(404).json({ 
          error: 'Pago no encontrado' 
        });
      }
      if (pago.estado === 'completado' && estado && estado !== 'completado') {
        return res.status(400).json({ 
          error: 'No se puede cambiar el estado de un pago completado' 
        });
      }
      const datosActualizacion = {};
      if (monto !== undefined) {
        if (monto <= 0) {
          return res.status(400).json({ 
            error: 'El monto debe ser mayor a 0' 
          });
        }
        datosActualizacion.monto = parseFloat(monto);
      }
      if (metodo !== undefined) {
        const metodosPago = ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'obra_social'];
        if (!metodosPago.includes(metodo)) {
          return res.status(400).json({ 
            error: 'Método de pago inválido' 
          });
        }
        datosActualizacion.metodo = metodo;
      }
      if (numero_transaccion !== undefined) datosActualizacion.numero_transaccion = numero_transaccion?.trim();
      if (observaciones !== undefined) datosActualizacion.observaciones = observaciones?.trim();
      if (estado !== undefined) datosActualizacion.estado = estado;
      await pago.update(datosActualizacion);
      const pagoActualizado = await Pago.findByPk(id, {
        include: [
          {
            model: Cita,
            as: 'cita',
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
          }
        ]
      });
      res.json({
        message: 'Pago actualizado exitosamente',
        pago: pagoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      next(error);
    }
  },
  anular: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const pago = await Pago.findByPk(id);
      if (!pago) {
        return res.status(404).json({ 
          error: 'Pago no encontrado' 
        });
      }
      if (pago.estado === 'anulado') {
        return res.status(400).json({ 
          error: 'El pago ya está anulado' 
        });
      }
      await pago.update({ 
        estado: 'anulado',
        observaciones: `${pago.observaciones || ''}\nANULADO: ${motivo || 'Sin motivo especificado'}`.trim()
      });
      res.json({
        message: 'Pago anulado exitosamente',
        pago,
        motivo
      });
    } catch (error) {
      console.error('Error al anular pago:', error);
      next(error);
    }
  },
  getByPaciente: async (req, res, next) => {
    try {
      const { paciente_id } = req.params;
      const { page = 1, limit = 10, estado } = req.query;
      const offset = (page - 1) * limit;
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ 
          error: 'Paciente no encontrado' 
        });
      }
      const citasIds = await Cita.findAll({
        where: { paciente_id },
        attributes: ['id']
      });
      const whereClause = {
        cita_id: { [Op.in]: citasIds.map(c => c.id) }
      };
      if (estado) {
        whereClause.estado = estado;
      }
      const pagos = await Pago.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Cita,
            as: 'cita',
            include: [
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
        pagos: pagos.rows,
        totalItems: pagos.count,
        totalPages: Math.ceil(pagos.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener pagos del paciente:', error);
      next(error);
    }
  },
  getReportes: async (req, res, next) => {
    try {
      const { fecha_desde, fecha_hasta, metodo, agrupar_por = 'dia' } = req.query;
      const whereClause = {
        estado: 'completado'
      };
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
      if (metodo) {
        whereClause.metodo = metodo;
      }
      const pagos = await Pago.findAll({
        where: whereClause,
        attributes: ['monto', 'metodo', 'fecha'],
        order: [['fecha', 'ASC']]
      });
      const totalIngresos = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
      const totalPagos = pagos.length;
      const porMetodoPago = pagos.reduce((acc, pago) => {
        const metodo = pago.metodo;
        if (!acc[metodo]) {
          acc[metodo] = { cantidad: 0, monto: 0 };
        }
        acc[metodo].cantidad += 1;
        acc[metodo].monto += parseFloat(pago.monto);
        return acc;
      }, {});
      const porPeriodo = {};
      pagos.forEach(pago => {
        let clave;
        const fecha = new Date(pago.fecha);
        switch (agrupar_por) {
          case 'mes':
            clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'ano':
            clave = fecha.getFullYear().toString();
            break;
          default: 
            clave = fecha.toISOString().split('T')[0];
        }
        if (!porPeriodo[clave]) {
          porPeriodo[clave] = { cantidad: 0, monto: 0 };
        }
        porPeriodo[clave].cantidad += 1;
        porPeriodo[clave].monto += parseFloat(pago.monto);
      });
      res.json({
        resumen: {
          total_ingresos: totalIngresos,
          total_pagos: totalPagos,
          promedio_por_pago: totalPagos > 0 ? totalIngresos / totalPagos : 0
        },
        por_metodo: porMetodoPago,
        por_periodo: porPeriodo,
        filtros: {
          fecha_desde: fecha_desde || 'inicio',
          fecha_hasta: fecha_hasta || 'actualidad',
          metodo: metodo || 'todos',
          agrupado_por: agrupar_por
        }
      });
    } catch (error) {
      console.error('Error al obtener reportes de pagos:', error);
      next(error);
    }
  }
};
module.exports = pagoController;
