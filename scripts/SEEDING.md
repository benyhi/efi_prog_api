# 🌱 Scripts de Poblado de Base de Datos

Este conjunto de scripts te permite poblar la base de datos con datos de prueba realistas para el sistema de gestión médica.

## 📋 Scripts Disponibles

### 🚀 Comandos Rápidos (NPM)
```bash
# Poblar con configuración mediana (recomendado)
npm run seed

# Poblar con datos mínimos (para desarrollo rápido)
npm run seed:small

# Poblar con muchos datos (para pruebas de rendimiento)
npm run seed:large

# Ver estado actual de la base de datos
npm run db:status

# Limpiar todos los datos
npm run db:clean

# Reiniciar base de datos completa
npm run db:reset

# Limpiar y poblar de nuevo (fresh start)
npm run db:fresh
```

### 🔧 Scripts Personalizados

#### Script Simple (Recomendado)
```bash
# Configuración por defecto
node scripts/seeds/seed-simple.js

# Personalizar cantidades específicas
node scripts/seeds/seed-simple.js --usuarios=50 --pacientes=100 --medicos=20

# Ver ayuda completa
node scripts/seeds/seed-simple.js --help
```

#### Script Completo (Avanzado)
```bash
# Usar configuración completa predefinida
node scripts/seeds/seed-database.js

# Personalizar con variables de entorno
SEED_USUARIOS=100 SEED_PACIENTES=200 node scripts/seeds/seed-database.js
SEED_USUARIOS=100 SEED_PACIENTES=200 node seed-database.js
```

#### Limpieza de Base de Datos
```bash
# Limpiar datos (mantener estructura)
node clean-database.js

# Reiniciar completamente (recrear esquema)
node clean-database.js reset

# Ver ayuda
node clean-database.js --help
```

## 📊 Configuraciones Predefinidas

### 🟢 Pequeña (Desarrollo)
- 👥 Usuarios: 10
- 👨‍⚕️ Médicos: 5  
- 🤒 Pacientes: 20
- 📋 Citas: 25
- 💊 Medicamentos: 15

### 🟡 Mediana (Por Defecto)
- 👥 Usuarios: 30
- 👨‍⚕️ Médicos: 15
- 🤒 Pacientes: 60  
- 📋 Citas: 50
- 💊 Medicamentos: 25

### 🔴 Grande (Pruebas de Rendimiento)
- 👥 Usuarios: 100
- 👨‍⚕️ Médicos: 30
- 🤒 Pacientes: 150
- 📋 Citas: 120
- 💊 Medicamentos: 50

## 🎯 Parámetros Personalizables

Todos los scripts admiten estos parámetros:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `--usuarios=N` | Cantidad de usuarios | `--usuarios=50` |
| `--especialidades=N` | Especialidades médicas | `--especialidades=10` |
| `--consultorios=N` | Consultorios/salas | `--consultorios=15` |
| `--medicos=N` | Médicos profesionales | `--medicos=20` |
| `--pacientes=N` | Pacientes registrados | `--pacientes=100` |
| `--medicamentos=N` | Medicamentos disponibles | `--medicamentos=30` |
| `--disponibilidades=N` | Horarios médicos | `--disponibilidades=40` |
| `--citas=N` | Citas médicas | `--citas=80` |
| `--historiales=N` | Historiales clínicos | `--historiales=60` |
| `--recetas=N` | Recetas médicas | `--recetas=40` |
| `--pagos=N` | Registros de pago | `--pagos=70` |
| `--notificaciones=N` | Notificaciones | `--notificaciones=90` |

## 📝 Ejemplos de Uso

### Desarrollo Básico
```bash
# Para desarrollo local con pocos datos
npm run seed:small
```

### Testing Completo
```bash
# Para pruebas completas con datos variados
npm run seed

# O personalizado para tu caso específico
node seed-simple.js --usuarios=40 --medicos=15 --pacientes=80 --citas=60
```

### Pruebas de Rendimiento
```bash
# Para probar con muchos datos
npm run seed:large

# O súper personalizado
node seed-simple.js --usuarios=200 --pacientes=500 --citas=300
```

### Reset Completo
```bash
# Limpiar todo y empezar de nuevo
npm run db:fresh
```

## 🔄 Flujo de Trabajo Recomendado

1. **Primera configuración:**
   ```bash
   npm run seed
   ```

2. **Durante desarrollo (cuando necesites datos frescos):**
   ```bash
   npm run db:fresh
   ```

3. **Para pruebas específicas:**
   ```bash
   node seed-simple.js --medicos=10 --pacientes=50 --citas=30
   ```

4. **Solo limpiar (mantener estructura):**
   ```bash
   npm run db:clean
   ```

## ⚠️ Notas Importantes

- **Dependencias:** Los scripts respetan automáticamente las relaciones entre tablas
- **Datos Realistas:** Utiliza Faker.js para generar datos con aspecto real
- **Seguridad:** Los scripts verifican errores y continúan con warnings
- **Performance:** Para conjuntos de datos grandes (>1000 registros), el proceso puede tomar varios minutos

## 🚨 Advertencias

- ⚠️ `npm run db:reset` **ELIMINA TODOS LOS DATOS** y recrea el esquema
- ⚠️ `npm run db:clean` elimina todos los datos pero mantiene la estructura
- ⚠️ Los scripts no verifican datos existentes, pueden crear duplicados si se ejecutan múltiples veces

## 🛠️ Troubleshooting

### Error: "Cannot find module '@faker-js/faker'"
```bash
npm install @faker-js/faker --save-dev
```

### Error: "Database connection failed"
Verifica que:
1. La base de datos esté configurada correctamente en `config/database.js`
2. El servidor de base de datos esté ejecutándose
3. Las credenciales sean correctas

### Los datos no se crean correctamente
1. Ejecuta `npm run db:reset` para limpiar completamente
2. Luego `npm run seed` para poblar de nuevo
3. Revisa los logs en la consola para identificar errores específicos

## 🤝 Contribuir

Para añadir nuevos tipos de datos o modificar los existentes, edita:
- `seed-database.js` - Lógica principal de creación
- `seed-simple.js` - Configuraciones y presets
- `clean-database.js` - Lógica de limpieza