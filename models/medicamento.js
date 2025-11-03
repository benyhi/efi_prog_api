module.exports = (sequelize, DataTypes) => {
  class Medicamento extends sequelize.Sequelize.Model {}
  Medicamento.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nombre: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    descripcion: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    dosis: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    presentacion: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Medicamento',
    tableName: 'medicamentos',
    timestamps: false,
    freezeTableName: true,
  });
  return Medicamento;
};