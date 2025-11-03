module.exports = (sequelize, DataTypes) => {
  class Notificacion extends sequelize.Sequelize.Model {}
  Notificacion.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_usuario: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    mensaje: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    tipo: { 
      type: DataTypes.ENUM('recordatorio', 'cancelación', 'nueva_cita'), 
      allowNull: true 
    },
    leido: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    fecha_envio: { 
      type: DataTypes.DATE, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Notificacion',
    tableName: 'notificaciones',
    timestamps: false,
    freezeTableName: true,
  });
  return Notificacion;
};