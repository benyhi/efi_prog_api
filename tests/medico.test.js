const request = require('supertest');
const express = require('express');
const medicoRoutes = require('../routes/medicoRoutes');
const { sequelize } = require('../config/database');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/medicos', medicoRoutes);

describe('Medico Controller Tests', () => {
  
  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  describe('POST /api/medicos', () => {
    test('Debería crear un nuevo médico', async () => {
      const medicoData = {
        nombre: 'Dr. Carlos',
        apellido: 'García',
        email: 'carlos.garcia@hospital.com',
        telefono: '123456789',
        matricula: 'MED001',
        especialidad_id: 1,
        usuario_id: 1
      };

      const response = await request(app)
        .post('/api/medicos')
        .send(medicoData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe(medicoData.nombre);
      expect(response.body.matricula).toBe(medicoData.matricula);
      expect(response.body.especialidad_id).toBe(medicoData.especialidad_id);
    });

    test('Debería fallar al crear médico con matrícula duplicada', async () => {
      const medicoData = {
        nombre: 'Dr. Carlos',
        apellido: 'García',
        email: 'carlos@hospital.com',
        telefono: '123456789',
        matricula: 'MED001',
        especialidad_id: 1,
        usuario_id: 1
      };

      // Crear primer médico
      await request(app)
        .post('/api/medicos')
        .send(medicoData)
        .expect(201);

      // Intentar crear segundo médico con misma matrícula
      const medicoData2 = {
        ...medicoData,
        email: 'otro@hospital.com',
        usuario_id: 2
      };

      const response = await request(app)
        .post('/api/medicos')
        .send(medicoData2)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería fallar con datos incompletos', async () => {
      const medicoIncompleto = {
        nombre: 'Dr. Carlos'
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/medicos')
        .send(medicoIncompleto)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/medicos', () => {
    test('Debería obtener lista de médicos', async () => {
      // Crear médicos de prueba
      const medicos = [
        {
          nombre: 'Dr. Juan',
          apellido: 'Pérez',
          email: 'juan@hospital.com',
          telefono: '111111111',
          matricula: 'MED001',
          especialidad_id: 1,
          usuario_id: 1
        },
        {
          nombre: 'Dra. María',
          apellido: 'López',
          email: 'maria@hospital.com',
          telefono: '222222222',
          matricula: 'MED002',
          especialidad_id: 2,
          usuario_id: 2
        }
      ];

      for (const medico of medicos) {
        await request(app)
          .post('/api/medicos')
          .send(medico);
      }

      const response = await request(app)
        .get('/api/medicos')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/medicos/:id', () => {
    test('Debería obtener médico por ID', async () => {
      const medicoData = {
        nombre: 'Dr. Carlos',
        apellido: 'García',
        email: 'carlos@hospital.com',
        telefono: '123456789',
        matricula: 'MED001',
        especialidad_id: 1,
        usuario_id: 1
      };

      const createResponse = await request(app)
        .post('/api/medicos')
        .send(medicoData);

      const medicoId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/medicos/${medicoId}`)
        .expect(200);

      expect(response.body.id).toBe(medicoId);
      expect(response.body.nombre).toBe(medicoData.nombre);
      expect(response.body.matricula).toBe(medicoData.matricula);
    });

    test('Debería devolver 404 para médico inexistente', async () => {
      const response = await request(app)
        .get('/api/medicos/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/medicos/:id', () => {
    test('Debería actualizar médico existente', async () => {
      const medicoData = {
        nombre: 'Dr. Carlos',
        apellido: 'García',
        email: 'carlos@hospital.com',
        telefono: '123456789',
        matricula: 'MED001',
        especialidad_id: 1,
        usuario_id: 1
      };

      const createResponse = await request(app)
        .post('/api/medicos')
        .send(medicoData);

      const medicoId = createResponse.body.id;
      const updateData = {
        telefono: '987654321',
        especialidad_id: 2
      };

      const response = await request(app)
        .put(`/api/medicos/${medicoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.telefono).toBe(updateData.telefono);
      expect(response.body.especialidad_id).toBe(updateData.especialidad_id);
    });
  });

  describe('DELETE /api/medicos/:id', () => {
    test('Debería eliminar médico existente', async () => {
      const medicoData = {
        nombre: 'Dr. Carlos',
        apellido: 'García',
        email: 'carlos@hospital.com',
        telefono: '123456789',
        matricula: 'MED001',
        especialidad_id: 1,
        usuario_id: 1
      };

      const createResponse = await request(app)
        .post('/api/medicos')
        .send(medicoData);

      const medicoId = createResponse.body.id;

      await request(app)
        .delete(`/api/medicos/${medicoId}`)
        .expect(200);

      // Verificar que el médico fue eliminado
      await request(app)
        .get(`/api/medicos/${medicoId}`)
        .expect(404);
    });
  });

  describe('GET /api/medicos/especialidad/:especialidadId', () => {
    test('Debería obtener médicos por especialidad', async () => {
      const medicos = [
        {
          nombre: 'Dr. Juan',
          apellido: 'Pérez',
          email: 'juan@hospital.com',
          telefono: '111111111',
          matricula: 'MED001',
          especialidad_id: 1,
          usuario_id: 1
        },
        {
          nombre: 'Dra. María',
          apellido: 'López',
          email: 'maria@hospital.com',
          telefono: '222222222',
          matricula: 'MED002',
          especialidad_id: 1,
          usuario_id: 2
        },
        {
          nombre: 'Dr. Pedro',
          apellido: 'Martín',
          email: 'pedro@hospital.com',
          telefono: '333333333',
          matricula: 'MED003',
          especialidad_id: 2,
          usuario_id: 3
        }
      ];

      for (const medico of medicos) {
        await request(app)
          .post('/api/medicos')
          .send(medico);
      }

      const response = await request(app)
        .get('/api/medicos/especialidad/1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(m => m.especialidad_id === 1)).toBe(true);
    });
  });
});