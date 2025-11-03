const { sequelize } = require('../../config/database');
class DatabaseCleaner {
  constructor() {
    this.models = sequelize.models;
    this.deletionOrder = [
      'RecetaMedicamento',
      'Notificacion', 
      'Pago',
      'Receta',
      'HistorialPaciente',
      'Cita',
      'DisponibilidadMedico',
      'Paciente',
      'Medico',
      'Medicamento',
      'Consultorio',
      'Especialidad',
      'Usuario'
    ];
  }
  async clean() {
    console.log('🧹 ========================================');
    console.log('🧹 INICIANDO LIMPIEZA DE BASE DE DATOS');
    console.log('🧹 ========================================\n');
    try {
      await sequelize.query('PRAGMA foreign_keys = OFF;');
      console.log('🔓 Restricciones de claves foráneas deshabilitadas');
      let totalDeleted = 0;
      for (const modelName of this.deletionOrder) {
        const model = this.models[modelName];
        if (model) {
          try {
            const count = await model.count();
            if (count > 0) {
              await model.destroy({ where: {}, truncate: true });
              console.log(`✅ ${modelName}: ${count} registros eliminados`);
              totalDeleted += count;
            } else {
              console.log(`⚪ ${modelName}: sin registros`);
            }
          } catch (error) {
            console.warn(`⚠️  Error limpiando ${modelName}:`, error.message);
          }
        }
      }
      await sequelize.query('PRAGMA foreign_keys = ON;');
      console.log('🔒 Restricciones de claves foráneas rehabilitadas');
      console.log('\n🎉 ========================================');
      console.log('🎉 LIMPIEZA COMPLETADA EXITOSAMENTE');
      console.log('🎉 ========================================');
      console.log(`📊 Total de registros eliminados: ${totalDeleted}`);
      console.log('🎉 ========================================\n');
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
      throw error;
    }
  }
  async reset() {
    console.log('🔄 ========================================');
    console.log('🔄 REINICIANDO BASE DE DATOS COMPLETA');
    console.log('🔄 ========================================\n');
    try {
      await this.clean();
      await sequelize.sync({ force: true });
      console.log('✅ Esquema de base de datos recreado');
      console.log('\n🎉 ========================================');
      console.log('🎉 REINICIO COMPLETADO EXITOSAMENTE');
      console.log('🎉 ========================================');
      console.log('🆕 Base de datos limpia y lista para usar');
      console.log('🎉 ========================================\n');
    } catch (error) {
      console.error('❌ Error durante el reinicio:', error);
      throw error;
    }
  }
}
async function main() {
  const cleaner = new DatabaseCleaner();
  const action = process.argv[2];
  try {
    if (action === 'reset' || action === '--reset') {
      await cleaner.reset();
    } else {
      await cleaner.clean();
    }
    console.log('✅ Operación completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la operación:', error);
    process.exit(1);
  }
}
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧹 Script de Limpieza de Base de Datos - AYUDA
==============================================
USO:
  node clean-database.js          # Limpiar datos (mantener estructura)
  node clean-database.js reset    # Reiniciar completamente (recrear esquema)
COMANDOS:
  clean (defecto)  Elimina todos los datos pero mantiene la estructura
  reset            Elimina datos y recrea el esquema completo
EJEMPLOS:
  node clean-database.js          # Solo limpiar datos
  node clean-database.js reset    # Reinicio completo
NOTA: Este script respeta las dependencias entre tablas para evitar errores.
`);
  process.exit(0);
}
if (require.main === module) {
  main();
}
module.exports = { DatabaseCleaner };