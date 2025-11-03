module.exports = (sequelize, DataTypes) => {
  class Usuario extends sequelize.Sequelize.Model {}
  Usuario.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nombre: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    correo: { 
      type: DataTypes.STRING(150), 
      allowNull: false, 
      unique: true 
    },
    contraseña: { 
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: { 
      type: DataTypes.ENUM('admin', 'médico', 'paciente'), 
      allowNull: false 
    },
    telefono: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    direccion: { 
      type: DataTypes.STRING(200), 
      allowNull: true 
    },
    esta_activo: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
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
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false,
    freezeTableName: true,
  });
  return Usuario;
};