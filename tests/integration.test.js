const request = require('supertest');
const express = require('express');
const { sequelize } = require('../config/database');

// Importar todas las rutas
const usuarioRoutes = require('../routes/usuarioRoutes');
const medicoRoutes = require('../routes/medicoRoutes');
const pacienteRoutes = require('../routes/pacienteRoutes');
const citaRoutes = require('../routes/citaRoutes');
const especialidadRoutes = require('../routes/especialidadRoutes');
const consultorioRoutes = require('../routes/consultorioRoutes');
const medicamentoRoutes = require('../routes/medicamentoRoutes');
const recetaRoutes = require('../routes/recetaRoutes');
const pagoRoutes = require('../routes/pagoRoutes');
const historialPacienteRoutes = require('../routes/historialPacienteRoutes');
const disponibilidadMedicoRoutes = require('../routes/disponibilidadMedicoRoutes');
const notificacionRoutes = require('../routes/notificacionRoutes');

// Crear app completa de prueba
const app = express();
app.use(express.json());

// Configurar todas las rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/consultorios', consultorioRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/historial-pacientes', historialPacienteRoutes);
app.use('/api/disponibilidad-medicos', disponibilidadMedicoRoutes);
app.use('/api/notificaciones', notificacionRoutes);

describe('API Integration Tests', () => {
  
  beforeAll(async () => {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✓ Conectado a la base de datos para pruebas de integración');
  });

  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Cerrar conexión
    await sequelize.close();
    console.log('✓ Conexión cerrada');
  });

  describe('Health Check', () => {
    test('La aplicación debería estar funcionando', async () => {
      // Crear una ruta de health check simple
      app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
      });

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Database Models Integration', () => {
    test('Debería crear modelos relacionados correctamente', async () => {
      // Crear una especialidad
      const especialidadResponse = await request(app)
        .post('/api/especialidades')
        .send({
          nombre: 'Cardiología',
          descripcion: 'Especialidad del corazón'
        })
        .expect(201);

      // Crear un usuario
      const usuarioResponse = await request(app)
        .post('/api/usuarios')
        .send({
          nombre: 'Dr. Juan',
          apellido: 'Pérez',
          email: 'dr.juan@hospital.com',
          telefono: '123456789',
          password: 'password123',
          rol: 'medico'
        })
        .expect(201);

      // Crear un médico
      const medicoResponse = await request(app)
        .post('/api/medicos')
        .send({
          nombre: 'Dr. Juan',
          apellido: 'Pérez',
          email: 'dr.juan@hospital.com',
          telefono: '123456789',
          matricula: 'MED001',
          especialidad_id: especialidadResponse.body.id,
          usuario_id: usuarioResponse.body.id
        })
        .expect(201);

      // Crear un paciente usuario
      const pacienteUsuarioResponse = await request(app)
        .post('/api/usuarios')
        .send({
          nombre: 'Ana',
          apellido: 'González',
          email: 'ana@email.com',
          telefono: '987654321',
          password: 'password123',
          rol: 'paciente'
        })
        .expect(201);

      // Crear un paciente
      const pacienteResponse = await request(app)
        .post('/api/pacientes')
        .send({
          nombre: 'Ana',
          apellido: 'González',
          email: 'ana@email.com',
          telefono: '987654321',
          fecha_nacimiento: '1990-05-15',
          direccion: 'Calle 123',
          numero_historia_clinica: 'HC001',
          usuario_id: pacienteUsuarioResponse.body.id
        })
        .expect(201);

      // Crear un consultorio
      const consultorioResponse = await request(app)
        .post('/api/consultorios')
        .send({
          numero: '101',
          nombre: 'Consultorio Cardiología',
          ubicacion: 'Piso 1',
          capacidad: 1
        })
        .expect(201);

      // Crear una cita
      const citaResponse = await request(app)
        .post('/api/citas')
        .send({
          fecha_hora: '2024-12-25 10:00:00',
          estado: 'programada',
          motivo: 'Consulta cardiológica',
          paciente_id: pacienteResponse.body.id,
          medico_id: medicoResponse.body.id,
          consultorio_id: consultorioResponse.body.id
        })
        .expect(201);

      // Verificar que todos los modelos se crearon correctamente
      expect(especialidadResponse.body.nombre).toBe('Cardiología');
      expect(medicoResponse.body.matricula).toBe('MED001');
      expect(pacienteResponse.body.numero_historia_clinica).toBe('HC001');
      expect(consultorioResponse.body.numero).toBe('101');
      expect(citaResponse.body.motivo).toBe('Consulta cardiológica');
    });
  });

  describe('API Endpoints Availability', () => {
    const endpoints = [
      { method: 'GET', path: '/api/usuarios' },
      { method: 'GET', path: '/api/medicos' },
      { method: 'GET', path: '/api/pacientes' },
      { method: 'GET', path: '/api/citas' },
      { method: 'GET', path: '/api/especialidades' },
      { method: 'GET', path: '/api/consultorios' },
      { method: 'GET', path: '/api/medicamentos' },
      { method: 'GET', path: '/api/recetas' },
      { method: 'GET', path: '/api/pagos' },
      { method: 'GET', path: '/api/historial-pacientes' },
      { method: 'GET', path: '/api/disponibilidad-medicos' },
      { method: 'GET', path: '/api/notificaciones' }
    ];

    endpoints.forEach(endpoint => {
      test(`${endpoint.method} ${endpoint.path} debería estar disponible`, async () => {
        const response = await request(app)[endpoint.method.toLowerCase()](endpoint.path);
        
        // Debe devolver un status code válido (no 404)
        expect(response.status).not.toBe(404);
        
        // Para GET endpoints, esperamos 200 (aunque esté vacío)
        if (endpoint.method === 'GET') {
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('Debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/api/ruta-inexistente')
        .expect(404);
    });

    test('Debería manejar métodos HTTP no soportados', async () => {
      const response = await request(app)
        .patch('/api/usuarios')
        .expect(404);
    });
  });

  describe('CORS and Middleware', () => {
    test('Debería procesar JSON correctamente', async () => {
      const response = await request(app)
        .post('/api/especialidades')
        .send({
          nombre: 'Test JSON',
          descripcion: 'Prueba de procesamiento JSON'
        })
        .expect(201);

      expect(response.body.nombre).toBe('Test JSON');
    });
  });
});