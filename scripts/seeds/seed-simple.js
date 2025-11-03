#!/usr/bin/env node
const { DatabaseSeeder } = require('./seed-database');
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value && !isNaN(value)) {
        config[key.toUpperCase()] = parseInt(value);
      }
    }
  });
  return config;
}
const PRESETS = {
  pequeño: {
    USUARIOS: 10,
    ESPECIALIDADES: 5,
    CONSULTORIOS: 8,
    MEDICOS: 5,
    PACIENTES: 20,
    MEDICAMENTOS: 15,
    DISPONIBILIDADES: 15,
    CITAS: 25,
    HISTORIALES: 20,
    RECETAS: 15,
    PAGOS: 20,
    NOTIFICACIONES: 30
  },
  mediano: {
    USUARIOS: 30,
    ESPECIALIDADES: 8,
    CONSULTORIOS: 12,
    MEDICOS: 15,
    PACIENTES: 60,
    MEDICAMENTOS: 25,
    DISPONIBILIDADES: 40,
    CITAS: 50,
    HISTORIALES: 45,
    RECETAS: 30,
    PAGOS: 40,
    NOTIFICACIONES: 70
  },
  grande: {
    USUARIOS: 100,
    ESPECIALIDADES: 12,
    CONSULTORIOS: 20,
    MEDICOS: 30,
    PACIENTES: 150,
    MEDICAMENTOS: 50,
    DISPONIBILIDADES: 80,
    CITAS: 120,
    HISTORIALES: 100,
    RECETAS: 80,
    PAGOS: 100,
    NOTIFICACIONES: 200
  }
};
async function main() {
  console.log('🌱 Script Simple de Poblado de Base de Datos');
  console.log('============================================\n');
  const customConfig = parseArgs();
  let finalConfig;
  if (Object.keys(customConfig).length === 0) {
    finalConfig = PRESETS.mediano;
    console.log('📋 Usando configuración predeterminada: MEDIANO');
  } else {
    finalConfig = { ...PRESETS.mediano, ...customConfig };
    console.log('📋 Usando configuración personalizada');
  }
  console.log('📊 Configuración final:', finalConfig);
  console.log('============================================\n');
  const seeder = new DatabaseSeeder(finalConfig);
  try {
    await seeder.run();
    console.log('\n🎉 ¡Poblado completado exitosamente!');
    console.log('💡 La base de datos está lista para usar');
  } catch (error) {
    console.error('\n❌ Error durante el poblado:', error.message);
    process.exit(1);
  }
}
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌱 Script de Poblado de Base de Datos - AYUDA
=============================================
USO:
  node seed-simple.js                           # Configuración mediana por defecto
  node seed-simple.js --usuarios=20             # Personalizar usuarios
  node seed-simple.js --usuarios=20 --medicos=10 # Múltiples parámetros
PARÁMETROS DISPONIBLES:
  --usuarios=N         Cantidad de usuarios a crear
  --especialidades=N   Cantidad de especialidades
  --consultorios=N     Cantidad de consultorios
  --medicos=N          Cantidad de médicos
  --pacientes=N        Cantidad de pacientes
  --medicamentos=N     Cantidad de medicamentos
  --disponibilidades=N Cantidad de disponibilidades médicas
  --citas=N            Cantidad de citas
  --historiales=N      Cantidad de historiales médicos
  --recetas=N          Cantidad de recetas
  --pagos=N            Cantidad de pagos
  --notificaciones=N   Cantidad de notificaciones
PRESETS DISPONIBLES:
  - PEQUEÑO:  ~10-30 registros por modelo
  - MEDIANO:  ~30-70 registros por modelo (DEFECTO)
  - GRANDE:   ~50-200 registros por modelo
EJEMPLOS:
  node seed-simple.js --usuarios=50 --pacientes=100
  node seed-simple.js --medicos=20 --citas=80
NOTAS:
  - El script respeta las dependencias entre modelos
  - Los datos se generan automáticamente con Faker.js
  - Se pueden usar variables de entorno (SEED_USUARIOS, etc.)
`);
  process.exit(0);
}
main();