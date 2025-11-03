const request = require('supertest');
const express = require('express');
const pacienteRoutes = require('../routes/pacienteRoutes');
const { sequelize } = require('../config/database');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/pacientes', pacienteRoutes);

describe('Paciente Controller Tests', () => {
  
  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  describe('POST /api/pacientes', () => {
    test('Debería crear un nuevo paciente', async () => {
      const pacienteData = {
        nombre: 'Ana',
        apellido: 'González',
        email: 'ana.gonzalez@email.com',
        telefono: '123456789',
        fecha_nacimiento: '1990-05-15',
        direccion: 'Calle 123, Ciudad',
        numero_historia_clinica: 'HC001',
        usuario_id: 1
      };

      const response = await request(app)
        .post('/api/pacientes')
        .send(pacienteData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe(pacienteData.nombre);
      expect(response.body.numero_historia_clinica).toBe(pacienteData.numero_historia_clinica);
      expect(response.body.usuario_id).toBe(pacienteData.usuario_id);
    });

    test('Debería fallar al crear paciente con número de historia clínica duplicado', async () => {
      const pacienteData = {
        nombre: 'Ana',
        apellido: 'González',
        email: 'ana@email.com',
        telefono: '123456789',
        fecha_nacimiento: '1990-05-15',
        direccion: 'Calle 123',
        numero_historia_clinica: 'HC001',
        usuario_id: 1
      };

      // Crear primer paciente
      await request(app)
        .post('/api/pacientes')
        .send(pacienteData)
        .expect(201);

      // Intentar crear segundo paciente con mismo número de historia clínica
      const pacienteData2 = {
        ...pacienteData,
        email: 'otro@email.com',
        usuario_id: 2
      };

      const response = await request(app)
        .post('/api/pacientes')
        .send(pacienteData2)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería fallar con datos incompletos', async () => {
      const pacienteIncompleto = {
        nombre: 'Ana'
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/pacientes')
        .send(pacienteIncompleto)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/pacientes', () => {
    test('Debería obtener lista de pacientes', async () => {
      const pacientes = [
        {
          nombre: 'Ana',
          apellido: 'González',
          email: 'ana@email.com',
          telefono: '111111111',
          fecha_nacimiento: '1990-05-15',
          direccion: 'Calle 123',
          numero_historia_clinica: 'HC001',
          usuario_id: 1
        },
        {
          nombre: 'Luis',
          apellido: 'Martínez',
          email: 'luis@email.com',
          telefono: '222222222',
          fecha_nacimiento: '1985-03-20',
          direccion: 'Avenida 456',
          numero_historia_clinica: 'HC002',
          usuario_id: 2
        }
      ];

      for (const paciente of pacientes) {
        await request(app)
          .post('/api/pacientes')
          .send(paciente);
      }

      const response = await request(app)
        .get('/api/pacientes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/pacientes/:id', () => {
    test('Debería obtener paciente por ID', async () => {
      const pacienteData = {
        nombre: 'Ana',
        apellido: 'González',
        email: 'ana@email.com',
        telefono: '123456789',
        fecha_nacimiento: '1990-05-15',
        direccion: 'Calle 123',
        numero_historia_clinica: 'HC001',
        usuario_id: 1
      };

      const createResponse = await request(app)
        .post('/api/pacientes')
        .send(pacienteData);

      const pacienteId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/pacientes/${pacienteId}`)
        .expect(200);

      expect(response.body.id).toBe(pacienteId);
      expect(response.body.nombre).toBe(pacienteData.nombre);
      expect(response.body.numero_historia_clinica).toBe(pacienteData.numero_historia_clinica);
    });

    test('Debería devolver 404 para paciente inexistente', async () => {
      const response = await request(app)
        .get('/api/pacientes/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/pacientes/:id', () => {
    test('Debería actualizar paciente existente', async () => {
      const pacienteData = {
        nombre: 'Ana',
        apellido: 'González',
        email: 'ana@email.com',
        telefono: '123456789',
        fecha_nacimiento: '1990-05-15',
        direccion: 'Calle 123',
        numero_historia_clinica: 'HC001',
        usuario_id: 1
      };

      const createResponse = await request(app)
        .post('/api/pacientes')
        .send(pacienteData);

      const pacienteId = createResponse.body.id;
      const updateData = {
        telefono: '987654321',
        direccion: 'Nueva Dirección 789'
      };

      const response = await request(app)
        .put(`/api/pacientes/${pacienteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.telefono).toBe(updateData.telefono);
      expect(response.body.direccion).toBe(updateData.direccion);
    });
  });

  describe('DELETE /api/pacientes/:id', () => {
    test('Debería eliminar paciente existente', async () => {
      const pacienteData = {
        nombre: 'Ana',
        apellido: 'González',
        email: 'ana@email.com',
        telefono: '123456789',
        fecha_nacimiento: '1990-05-15',
        direccion: 'Calle 123',
        numero_historia_clinica: 'HC001',
        usuario_id: 1
      };

      const createResponse = await request(app)
        .post('/api/pacientes')
        .send(pacienteData);

      const pacienteId = createResponse.body.id;

      await request(app)
        .delete(`/api/pacientes/${pacienteId}`)
        .expect(200);

      // Verificar que el paciente fue eliminado
      await request(app)
        .get(`/api/pacientes/${pacienteId}`)
        .expect(404);
    });
  });

  describe('GET /api/pacientes/historia/:numeroHistoria', () => {
    test('Debería obtener paciente por número de historia clínica', async () => {
      const pacienteData = {
        nombre: 'Ana',
        apellido: 'González',
        email: 'ana@email.com',
        telefono: '123456789',
        fecha_nacimiento: '1990-05-15',
        direccion: 'Calle 123',
        numero_historia_clinica: 'HC001',
        usuario_id: 1
      };

      await request(app)
        .post('/api/pacientes')
        .send(pacienteData);

      const response = await request(app)
        .get(`/api/pacientes/historia/${pacienteData.numero_historia_clinica}`)
        .expect(200);

      expect(response.body.numero_historia_clinica).toBe(pacienteData.numero_historia_clinica);
      expect(response.body.nombre).toBe(pacienteData.nombre);
    });

    test('Debería devolver 404 para número de historia inexistente', async () => {
      const response = await request(app)
        .get('/api/pacientes/historia/HC999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});