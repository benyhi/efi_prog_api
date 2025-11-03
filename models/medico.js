module.exports = (sequelize, DataTypes) => {
  class Medico extends sequelize.Sequelize.Model {}
  Medico.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nombre: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    matricula: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    id_usuario: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      unique: true 
    },
    id_especialidad: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    horario_inicio: { 
      type: DataTypes.TIME, 
      allowNull: true 
    },
    horario_fin: { 
      type: DataTypes.TIME, 
      allowNull: true 
    },
    dias_trabajo: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    estado: { 
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
    modelName: 'Medico',
    tableName: 'medicos',
    timestamps: false,
    freezeTableName: true,
  });
  return Medico;
};