# Tests - Sistema de Gestión Médica

Este directorio contiene las pruebas automatizadas para el sistema de gestión médica. Las pruebas están escritas usando **Jest** y **Supertest** para probar la API REST completa.

## Estructura de Pruebas

```
tests/
├── setup.js                  # Configuración inicial de Jest
├── integration.test.js       # Pruebas de integración completas
├── usuario.test.js           # Pruebas del controlador de usuarios
├── medico.test.js           # Pruebas del controlador de médicos
├── paciente.test.js         # Pruebas del controlador de pacientes
├── cita.test.js             # Pruebas del controlador de citas
├── especialidad.test.js     # Pruebas del controlador de especialidades
├── consultorio.test.js      # Pruebas del controlador de consultorios
└── README.md               # Esta documentación
```

## Configuración

### Prerrequisitos

1. **Node.js** y **npm** instalados
2. **Base de datos MySQL** configurada
3. **Dependencias de pruebas** instaladas:
   ```bash
   npm install --save-dev jest supertest
   ```

### Variables de Entorno

Asegúrate de tener configuradas las variables de entorno para la base de datos de pruebas en tu archivo `.env` o configuración:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=hospital_test
DB_PORT=3306
```

## Ejecutar Pruebas

### Todas las pruebas
```bash
npm test
```

### Pruebas en modo watch (desarrollo)
```bash
npm run test:watch
```

### Pruebas específicas
```bash
# Ejecutar solo pruebas de usuarios
npx jest usuario.test.js

# Ejecutar solo pruebas de médicos
npx jest medico.test.js

# Ejecutar solo pruebas de integración
npx jest integration.test.js
```

### Pruebas con cobertura
```bash
npx jest --coverage
```

## Tipos de Pruebas

### 1. Pruebas Unitarias por Controlador

Cada archivo de prueba (`*.test.js`) contiene pruebas específicas para un controlador:

- **Operaciones CRUD básicas**: CREATE, READ, UPDATE, DELETE
- **Validaciones de entrada**: Datos requeridos, formatos válidos
- **Manejo de errores**: Respuestas apropiadas para errores
- **Casos límite**: Duplicados, datos inexistentes, etc.

### 2. Pruebas de Integración

El archivo `integration.test.js` contiene:

- **Pruebas de conectividad**: Base de datos y endpoints
- **Flujos completos**: Creación de entidades relacionadas
- **Disponibilidad de API**: Todos los endpoints funcionando
- **Manejo de errores globales**: Rutas no encontradas, métodos no soportados

### 3. Configuración de Base de Datos

El archivo `setup.js` maneja:

- **Conexión a BD**: Antes de ejecutar pruebas
- **Limpieza de datos**: Sincronización forzada antes de cada prueba
- **Cierre de conexión**: Después de todas las pruebas
- **Timeouts**: Configuración global de tiempo límite

## Estructura de Pruebas por Controlador

### Patrón Común

Cada archivo de prueba sigue este patrón:

```javascript
describe('Controlador Tests', () => {
  beforeEach(async () => {
    // Limpiar base de datos
    await database.sync({ force: true });
  });

  describe('POST /api/endpoint', () => {
    test('Debería crear nuevo registro', async () => {
      // Prueba de creación exitosa
    });
    
    test('Debería fallar con datos duplicados', async () => {
      // Prueba de validación de duplicados
    });
    
    test('Debería fallar con datos incompletos', async () => {
      // Prueba de validación de campos requeridos
    });
  });

  describe('GET /api/endpoint', () => {
    test('Debería obtener lista', async () => {
      // Prueba de listado
    });
  });

  describe('GET /api/endpoint/:id', () => {
    test('Debería obtener por ID', async () => {
      // Prueba de obtener por ID
    });
    
    test('Debería devolver 404 para ID inexistente', async () => {
      // Prueba de manejo de error
    });
  });

  describe('PUT /api/endpoint/:id', () => {
    test('Debería actualizar registro existente', async () => {
      // Prueba de actualización
    });
  });

  describe('DELETE /api/endpoint/:id', () => {
    test('Debería eliminar registro existente', async () => {
      // Prueba de eliminación
    });
  });
});
```

## Casos de Prueba Cubiertos

### Usuarios
- ✅ Crear usuario con datos válidos
- ✅ Validar email único
- ✅ Validar campos requeridos
- ✅ Obtener lista y por ID
- ✅ Actualizar y eliminar

### Médicos
- ✅ Crear médico con matrícula única
- ✅ Relación con especialidad y usuario
- ✅ Buscar por especialidad
- ✅ Operaciones CRUD completas

### Pacientes
- ✅ Crear paciente con historia clínica única
- ✅ Validar fecha de nacimiento
- ✅ Buscar por número de historia clínica
- ✅ Operaciones CRUD completas

### Citas
- ✅ Crear cita con relaciones válidas
- ✅ Validar fecha y hora
- ✅ Buscar por paciente y médico
- ✅ Estados de cita (programada, completada, cancelada)

### Especialidades
- ✅ Crear especialidad con nombre único
- ✅ Buscar por nombre
- ✅ Operaciones CRUD completas

### Consultorios
- ✅ Crear consultorio con número único
- ✅ Validar capacidad
- ✅ Buscar por número
- ✅ Obtener disponibles

## Comandos Útiles

```bash
# Ejecutar pruebas con output detallado
npm test -- --verbose

# Ejecutar solo pruebas que fallan
npm test -- --onlyFailures

# Ejecutar pruebas en paralelo
npm test -- --maxWorkers=4

# Generar reporte de cobertura
npm test -- --coverage --coverageReporters=html

# Ejecutar pruebas de un archivo específico
npm test -- --testPathPattern=usuario.test.js
```

## Debugging

### Para debugging de pruebas:

1. **Agregar console.log temporales**:
   ```javascript
   test('Mi prueba', async () => {
     console.log('Datos enviados:', datosTest);
     const response = await request(app).post('/api/endpoint').send(datosTest);
     console.log('Respuesta recibida:', response.body);
   });
   ```

2. **Ejecutar una prueba específica**:
   ```bash
   npx jest --testNamePattern="Debería crear usuario"
   ```

3. **Ver errores detallados**:
   ```bash
   npm test -- --verbose --no-coverage
   ```

## Notas Importantes

- **Base de datos**: Cada prueba usa `sync({ force: true })` que **ELIMINA TODOS LOS DATOS**
- **Aislamiento**: Cada prueba es independiente y no afecta a otras
- **Timeouts**: Configurado a 30 segundos para operaciones de BD
- **Cobertura**: Los reportes se generan en la carpeta `coverage/`

## Mantenimiento

### Agregar nuevas pruebas:

1. Crear archivo `nuevo-controlador.test.js`
2. Seguir el patrón de estructura establecido
3. Importar las rutas correspondientes
4. Agregar al `integration.test.js` si es necesario

### Actualizar pruebas existentes:

1. Mantener compatibilidad con estructura actual
2. Actualizar expectativas si cambian los controladores
3. Verificar que todas las pruebas pasen después de cambios

---

¡Las pruebas son fundamentales para mantener la calidad del código! 🧪✅