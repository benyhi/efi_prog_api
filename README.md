# 🏥 Sistema de Gestión Médica - API

API REST para sistema de gestión médica desarrollada con Node.js, Express y Sequelize.

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Configuración
1. Copia `.env.example` a `.env`
2. Configura las variables de entorno según tu necesidad

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start

# Poblar base de datos con datos de prueba
npm run seed:quick
```

## 📁 Estructura del Proyecto

```
📦 efi_prog_api/
├── 📄 index.js              # Servidor principal
├── 📄 package.json          # Dependencias y scripts
├── 📄 jest.config.js        # Configuración de testing
├── 🗂️ config/              # Configuración de base de datos
├── 🗂️ controllers/         # Lógica de controladores
├── 🗂️ models/              # Modelos de datos (Sequelize)
├── 🗂️ routes/              # Definición de rutas API
├── 🗂️ tests/               # Tests automatizados
└── 🗂️ scripts/             # Scripts de utilidad
    ├── 🗂️ seeds/           # Scripts de poblado de datos
    │   ├── seed-database.js    # Seeder principal (completo)
    │   ├── seed-simple.js      # Seeder con interfaz CLI
    │   └── quick-seed.js       # Seeder rápido para desarrollo
    ├── 🗂️ database/        # Scripts de gestión de BD
    │   ├── clean-database.js   # Limpiar base de datos
    │   └── db-status.js        # Estado de la base de datos
    └── 📄 SEEDING.md        # Documentación de seeding
```

## 🛠️ Scripts Disponibles

### 🔄 Desarrollo
```bash
npm start              # Iniciar servidor
npm run dev            # Servidor con auto-reload
npm test               # Ejecutar tests
npm run test:watch     # Tests en modo watch
```

### 🌱 Gestión de Datos
```bash
npm run seed           # Poblar con datos normales
npm run seed:quick     # Datos mínimos para desarrollo
npm run seed:small     # Pocos registros
npm run seed:large     # Muchos registros (testing)
```

### 📊 Base de Datos
```bash
npm run db:status      # Ver estado actual
npm run db:clean       # Limpiar datos
npm run db:reset       # Reiniciar completamente
npm run db:fresh       # Reset + poblar
```

## 🎯 Credenciales de Desarrollo

Después de ejecutar `npm run seed:quick`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | admin@hospital.com | admin123 |
| **Médico** | dr.perez@hospital.com | medico123 |
| **Paciente** | maria@email.com | paciente123 |

## 📋 API Endpoints

La API estará disponible en `http://localhost:3000/api`

### Principales recursos:
- `/api/usuarios` - Gestión de usuarios
- `/api/medicos` - Gestión de médicos
- `/api/pacientes` - Gestión de pacientes
- `/api/citas` - Gestión de citas médicas
- `/api/especialidades` - Especialidades médicas
- `/api/consultorios` - Consultorios disponibles
- `/api/recetas` - Recetas médicas
- `/api/medicamentos` - Medicamentos disponibles

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de coverage
npm test -- --coverage
```

## 📖 Documentación Adicional

- **[📋 API Documentation](./API_DOCUMENTATION.md)** - Documentación completa de todos los endpoints con ejemplos
- **[🌱 Scripts de Seeding](./scripts/SEEDING.md)** - Guía completa para poblar la base de datos
- **[📮 Postman Collection](./postman_collection.json)** - Colección para importar en Postman y probar la API

## 🛡️ Tecnologías

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite (desarrollo) / MySQL (producción)
- **ORM**: Sequelize
- **Testing**: Jest + Supertest
- **Datos de Prueba**: Faker.js

**Desarrollado para Examen Final Integrador - Programación III**