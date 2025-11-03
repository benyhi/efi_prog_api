module.exports = (sequelize, DataTypes) => {
  class Pago extends sequelize.Sequelize.Model {}
  Pago.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_cita: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    monto: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true 
    },
    metodo: { 
      type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'), 
      allowNull: true 
    },
    estado: { 
      type: DataTypes.ENUM('pendiente', 'pagado', 'cancelado'), 
      defaultValue: 'pendiente' 
    },
    fecha: { 
      type: DataTypes.DATE, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Pago',
    tableName: 'pagos',
    timestamps: false,
    freezeTableName: true,
  });
  return Pago;
};