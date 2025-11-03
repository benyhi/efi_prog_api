#!/usr/bin/env node
const { sequelize } = require('../../config/database');
class DatabaseStatus {
  async showStatus() {
    console.log('📊 ESTADO ACTUAL DE LA BASE DE DATOS');
    console.log('=====================================\n');
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos exitosa\n');
      const models = sequelize.models;
      const modelNames = [
        'Usuario',
        'Especialidad', 
        'Consultorio',
        'Medico',
        'Paciente',
        'Medicamento',
        'DisponibilidadMedico',
        'Cita',
        'HistorialPaciente',
        'Receta',
        'Pago',
        'Notificacion',
        'RecetaMedicamento'
      ];
      let totalRecords = 0;
      let activeModels = 0;
      console.log('📋 CONTEO POR TABLA:');
      console.log('--------------------');
      for (const modelName of modelNames) {
        const model = models[modelName];
        if (model) {
          try {
            const count = await model.count();
            const icon = this.getIcon(modelName);
            const displayName = this.getDisplayName(modelName);
            if (count > 0) {
              console.log(`${icon} ${displayName}: ${count} registros`);
              activeModels++;
            } else {
              console.log(`⚪ ${displayName}: vacía`);
            }
            totalRecords += count;
          } catch (error) {
            console.log(`❌ ${modelName}: Error al contar (${error.message})`);
          }
        }
      }
      console.log('\n📈 RESUMEN GENERAL:');
      console.log('-------------------');
      console.log(`📊 Total de registros: ${totalRecords}`);
      console.log(`🎯 Tablas con datos: ${activeModels}/${modelNames.length}`);
      console.log(`📅 Estado: ${activeModels > 0 ? 'Base de datos poblada' : 'Base de datos vacía'}`);
      if (totalRecords > 0) {
        console.log('\n🚀 COMANDOS ÚTILES:');
        console.log('------------------');
        console.log('npm run db:clean      # Limpiar todos los datos');
        console.log('npm run db:reset      # Reiniciar completamente');
        console.log('npm run seed:quick    # Poblar con datos mínimos');
        console.log('npm run seed          # Poblar con datos normales');
      } else {
        console.log('\n💡 SUGERENCIA:');
        console.log('-------------');
        console.log('La base de datos está vacía. Puedes poblarla con:');
        console.log('npm run seed:quick    # Para desarrollo rápido');
        console.log('npm run seed          # Para datos completos');
      }
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error.message);
      throw error;
    }
    console.log('\n' + '='.repeat(50) + '\n');
  }
  getIcon(modelName) {
    const icons = {
      'Usuario': '👥',
      'Especialidad': '🏥',
      'Consultorio': '🏢',
      'Medico': '👨‍⚕️',
      'Paciente': '🤒',
      'Medicamento': '💊',
      'DisponibilidadMedico': '📅',
      'Cita': '📋',
      'HistorialPaciente': '📄',
      'Receta': '📝',
      'Pago': '💰',
      'Notificacion': '🔔',
      'RecetaMedicamento': '🔗'
    };
    return icons[modelName] || '📂';
  }
  getDisplayName(modelName) {
    const names = {
      'Usuario': 'Usuarios',
      'Especialidad': 'Especialidades',
      'Consultorio': 'Consultorios',
      'Medico': 'Médicos',
      'Paciente': 'Pacientes',
      'Medicamento': 'Medicamentos',
      'DisponibilidadMedico': 'Disponibilidades',
      'Cita': 'Citas',
      'HistorialPaciente': 'Historiales',
      'Receta': 'Recetas',
      'Pago': 'Pagos',
      'Notificacion': 'Notificaciones',
      'RecetaMedicamento': 'Receta-Medicamentos'
    };
    return names[modelName] || modelName;
  }
}
async function main() {
  const status = new DatabaseStatus();
  try {
    await status.showStatus();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  }
}
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📊 Script de Estado de Base de Datos - AYUDA
===========================================
USO:
  node db-status.js     # Mostrar estado actual
  npm run db:status     # Alias del comando anterior
DESCRIPCIÓN:
Este script muestra el estado actual de la base de datos, incluyendo:
- Cantidad de registros en cada tabla
- Resumen general del sistema
- Sugerencias de comandos útiles
EJEMPLO DE SALIDA:
  👥 Usuarios: 15 registros
  🏥 Especialidades: 8 registros
  🤒 Pacientes: 50 registros
  Total: 123 registros en 7 tablas activas
`);
  process.exit(0);
}
if (require.main === module) {
  main();
}
module.exports = DatabaseStatus;