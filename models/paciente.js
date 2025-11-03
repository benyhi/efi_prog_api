module.exports = (sequelize, DataTypes) => {
  class Paciente extends sequelize.Sequelize.Model {}
  Paciente.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    fecha_nacimiento: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    genero: { 
      type: DataTypes.ENUM('M', 'F', 'Otro'), 
      allowNull: true 
    },
    telefono: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    direccion: { 
      type: DataTypes.STRING(200), 
      allowNull: true 
    },
    grupo_sanguineo: { 
      type: DataTypes.STRING(5), 
      allowNull: true 
    },
    alergias: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    antecedentes: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    id_usuario: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      unique: true 
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
    modelName: 'Paciente',
    tableName: 'pacientes',
    timestamps: false,
    freezeTableName: true,
  });
  return Paciente;
};