module.exports = (sequelize, DataTypes) => {
  class Receta extends sequelize.Sequelize.Model {}
  Receta.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_cita: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    id_medico: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    id_paciente: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    fecha: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    indicaciones: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Receta',
    tableName: 'recetas',
    timestamps: false,
    freezeTableName: true,
  });
  return Receta;
};