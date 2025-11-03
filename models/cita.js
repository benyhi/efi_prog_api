module.exports = (sequelize, DataTypes) => {
  class Cita extends sequelize.Sequelize.Model {}
  Cita.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_medico: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    id_paciente: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    id_consultorio: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    fecha: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    estado: { 
      type: DataTypes.ENUM('programada', 'realizada', 'cancelada'), 
      defaultValue: 'programada' 
    },
    motivo: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    notas_medico: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    costo: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true 
    },
    creado: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW 
    },
    actualizado: { 
      type: DataTypes.DATE, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Cita',
    tableName: 'citas',
    timestamps: false,
    freezeTableName: true,
  });
  return Cita;
};