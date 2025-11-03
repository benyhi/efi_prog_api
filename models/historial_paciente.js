module.exports = (sequelize, DataTypes) => {
  class HistorialPaciente extends sequelize.Sequelize.Model {}
  HistorialPaciente.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_paciente: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    id_medico: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    fecha: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    descripcion: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    tipo: { 
      type: DataTypes.ENUM('consulta', 'estudio', 'tratamiento'), 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'HistorialPaciente',
    tableName: 'historial_pacientes',
    timestamps: false,
    freezeTableName: true,
  });
  return HistorialPaciente;
};