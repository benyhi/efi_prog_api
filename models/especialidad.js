module.exports = (sequelize, DataTypes) => {
  class Especialidad extends sequelize.Sequelize.Model {}
  Especialidad.init({
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
    }
  }, {
    sequelize,
    modelName: 'Especialidad',
    tableName: 'especialidades',
    timestamps: false,
    freezeTableName: true,
  });
  return Especialidad;
};