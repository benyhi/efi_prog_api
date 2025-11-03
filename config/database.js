require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const config = {
  database: process.env.DB_NAME || 'medical_system',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  storage: process.env.DB_DIALECT === 'sqlite' 
    ? (process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '..', 'database.sqlite'))
    : null,
  logging: false,
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  },
  define: {
    freezeTableName: true, 
    timestamps: false,
  },
};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  storage: config.storage,
  logging: config.logging,
  dialectOptions: config.dialectOptions,
  define: config.define,
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

Usuario.hasOne(Medico, { foreignKey: 'id_usuario', as: 'medico' });
Medico.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Usuario.hasOne(Paciente, { foreignKey: 'id_usuario', as: 'paciente' });
Paciente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Especialidad.hasMany(Medico, { foreignKey: 'especialidad_id', as: 'medicos' });
Medico.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });

Medico.hasMany(Cita, { foreignKey: 'medico_id', as: 'citas' });
Cita.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

Paciente.hasMany(Cita, { foreignKey: 'paciente_id', as: 'citas' });
Cita.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

Consultorio.hasMany(Cita, { foreignKey: 'consultorio_id', as: 'citas' });
Cita.belongsTo(Consultorio, { foreignKey: 'consultorio_id', as: 'consultorio' });

Paciente.hasMany(HistorialPaciente, { foreignKey: 'paciente_id', as: 'historiales' });
HistorialPaciente.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

Medico.hasMany(HistorialPaciente, { foreignKey: 'medico_id', as: 'historiales' });
HistorialPaciente.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

Medico.hasMany(DisponibilidadMedico, { foreignKey: 'medico_id', as: 'disponibilidades' });
DisponibilidadMedico.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

HistorialPaciente.hasMany(Receta, { foreignKey: 'historial_paciente_id', as: 'recetas' });
Receta.belongsTo(HistorialPaciente, { foreignKey: 'historial_paciente_id', as: 'historial' });

Receta.hasMany(RecetaMedicamento, { foreignKey: 'receta_id', as: 'medicamentos' });
RecetaMedicamento.belongsTo(Receta, { foreignKey: 'receta_id', as: 'receta' });

Medicamento.hasMany(RecetaMedicamento, { foreignKey: 'medicamento_id', as: 'recetas' });
RecetaMedicamento.belongsTo(Medicamento, { foreignKey: 'medicamento_id', as: 'medicamento' });

Cita.hasMany(Pago, { foreignKey: 'cita_id', as: 'pagos' });
Pago.belongsTo(Cita, { foreignKey: 'cita_id', as: 'cita' });

Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

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