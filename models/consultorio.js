module.exports = (sequelize, DataTypes) => {
  class Consultorio extends sequelize.Sequelize.Model {}
  Consultorio.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nombre: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    ubicacion: { 
      type: DataTypes.STRING(200), 
      allowNull: true 
    },
    piso: { 
      type: DataTypes.STRING(20), 
      allowNull: true 
    },
    numero: { 
      type: DataTypes.STRING(20), 
      allowNull: true 
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    esta_disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Consultorio',
    tableName: 'consultorios',
    timestamps: false,
    freezeTableName: true,
  });
  return Consultorio;
};