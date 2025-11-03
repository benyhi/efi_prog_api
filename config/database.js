const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const config = {
  database: process.env.DB_NAME || 'db',
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'pass',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false,
};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
  define: {
    freezeTableName: true, 
    timestamps: false,
  },
});

const Usuario = require('../models/usuario')(sequelize, DataTypes);
const Especialidad = require('../models/especialidad')(sequelize, DataTypes);
const Medico = require('../models/medico')(sequelize, DataTypes);
const Paciente = require('../models/paciente')(sequelize, DataTypes);
const Consultorio = require('../models/consultorio')(sequelize, DataTypes);
const Cita = require('../models/cita')(sequelize, DataTypes);
const HistorialPaciente = require('../models/historial_paciente')(sequelize, DataTypes);
const DisponibilidadMedico = require('../models/disponibilidad_medico')(sequelize, DataTypes);
const Receta = require('../models/receta')(sequelize, DataTypes);
const Medicamento = require('../models/medicamento')(sequelize, DataTypes);
const RecetaMedicamento = require('../models/receta_medicamento')(sequelize, DataTypes);
const Pago = require('../models/pago')(sequelize, DataTypes);
const Notificacion = require('../models/notificacion')(sequelize, DataTypes);


// RELACIONES MÉDICAS

// Usuario -> Médico (1:1)
Usuario.hasOne(Medico, { foreignKey: 'id_usuario', as: 'medico' });
Medico.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario -> Paciente (1:1)
Usuario.hasOne(Paciente, { foreignKey: 'id_usuario', as: 'paciente' });
Paciente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Especialidad -> Médico (1:N)
Especialidad.hasMany(Medico, { foreignKey: 'id_especialidad', as: 'medicos' });
Medico.belongsTo(Especialidad, { foreignKey: 'id_especialidad', as: 'especialidad' });

// Médico -> Cita (1:N)
Medico.hasMany(Cita, { foreignKey: 'id_medico', as: 'citas' });
Cita.belongsTo(Medico, { foreignKey: 'id_medico', as: 'medico' });

// Paciente -> Cita (1:N)
Paciente.hasMany(Cita, { foreignKey: 'id_paciente', as: 'citas' });
Cita.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

// Consultorio -> Cita (1:N)
Consultorio.hasMany(Cita, { foreignKey: 'id_consultorio', as: 'citas' });
Cita.belongsTo(Consultorio, { foreignKey: 'id_consultorio', as: 'consultorio' });

// Paciente -> HistorialPaciente (1:N)
Paciente.hasMany(HistorialPaciente, { foreignKey: 'id_paciente', as: 'historial' });
HistorialPaciente.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

// Médico -> HistorialPaciente (1:N)
Medico.hasMany(HistorialPaciente, { foreignKey: 'id_medico', as: 'historiales' });
HistorialPaciente.belongsTo(Medico, { foreignKey: 'id_medico', as: 'medico' });

// Médico -> DisponibilidadMedico (1:N)
Medico.hasMany(DisponibilidadMedico, { foreignKey: 'id_medico', as: 'disponibilidades' });
DisponibilidadMedico.belongsTo(Medico, { foreignKey: 'id_medico', as: 'medico' });

// Cita -> Receta (1:N)
Cita.hasMany(Receta, { foreignKey: 'id_cita', as: 'recetas' });
Receta.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });

// Médico -> Receta (1:N)
Medico.hasMany(Receta, { foreignKey: 'id_medico', as: 'recetas' });
Receta.belongsTo(Medico, { foreignKey: 'id_medico', as: 'medico' });

// Paciente -> Receta (1:N)
Paciente.hasMany(Receta, { foreignKey: 'id_paciente', as: 'recetas' });
Receta.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

// Receta -> RecetaMedicamento (1:N)
Receta.hasMany(RecetaMedicamento, { foreignKey: 'id_receta', as: 'medicamentos' });
RecetaMedicamento.belongsTo(Receta, { foreignKey: 'id_receta', as: 'receta' });

// Medicamento -> RecetaMedicamento (1:N)
Medicamento.hasMany(RecetaMedicamento, { foreignKey: 'id_medicamento', as: 'recetas' });
RecetaMedicamento.belongsTo(Medicamento, { foreignKey: 'id_medicamento', as: 'medicamento' });

// Cita -> Pago (1:N)
Cita.hasMany(Pago, { foreignKey: 'id_cita', as: 'pagos' });
Pago.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });

// Usuario -> Notificacion (1:N)
Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

module.exports = {
  sequelize,
  Sequelize,
  Usuario,
  Especialidad,
  Medico,
  Paciente,
  Consultorio,
  Cita,
  HistorialPaciente,
  DisponibilidadMedico,
  Receta,
  Medicamento,
  RecetaMedicamento,
  Pago,
  Notificacion,
};
