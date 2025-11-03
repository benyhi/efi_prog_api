module.exports = (sequelize, DataTypes) => {
  class DisponibilidadMedico extends sequelize.Sequelize.Model {}
  DisponibilidadMedico.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_medico: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    dia_semana: { 
      type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'), 
      allowNull: true 
    },
    hora_inicio: { 
      type: DataTypes.TIME, 
      allowNull: true 
    },
    hora_fin: { 
      type: DataTypes.TIME, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'DisponibilidadMedico',
    tableName: 'disponibilidad_medicos',
    timestamps: false,
    freezeTableName: true,
  });
  return DisponibilidadMedico;
};