module.exports = (sequelize, DataTypes) => {
  class RecetaMedicamento extends sequelize.Sequelize.Model {}
  RecetaMedicamento.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_receta: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    id_medicamento: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    cantidad: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    frecuencia: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    duracion: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'RecetaMedicamento',
    tableName: 'receta_medicamentos',
    timestamps: false,
    freezeTableName: true,
  });
  return RecetaMedicamento;
};