const request = require('supertest');
const express = require('express');
const citaRoutes = require('../routes/citaRoutes');
const { sequelize } = require('../config/database');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/citas', citaRoutes);

describe('Cita Controller Tests', () => {
  
  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  describe('POST /api/citas', () => {
    test('Debería crear una nueva cita', async () => {
      const citaData = {
        fecha_hora: '2024-12-25 10:00:00',
        estado: 'programada',
        motivo: 'Consulta general',
        paciente_id: 1,
        medico_id: 1,
        consultorio_id: 1
      };

      const response = await request(app)
        .post('/api/citas')
        .send(citaData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.motivo).toBe(citaData.motivo);
      expect(response.body.estado).toBe(citaData.estado);
      expect(response.body.paciente_id).toBe(citaData.paciente_id);
      expect(response.body.medico_id).toBe(citaData.medico_id);
    });

    test('Debería fallar con datos incompletos', async () => {
      const citaIncompleta = {
        motivo: 'Consulta general'
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/citas')
        .send(citaIncompleta)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería fallar con fecha inválida', async () => {
      const citaData = {
        fecha_hora: 'fecha-invalida',
        estado: 'programada',
        motivo: 'Consulta general',
        paciente_id: 1,
        medico_id: 1,
        consultorio_id: 1
      };

      const response = await request(app)
        .post('/api/citas')
        .send(citaData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/citas', () => {
    test('Debería obtener lista de citas', async () => {
      const citas = [
        {
          fecha_hora: '2024-12-25 10:00:00',
          estado: 'programada',
          motivo: 'Consulta general',
          paciente_id: 1,
          medico_id: 1,
          consultorio_id: 1
        },
        {
          fecha_hora: '2024-12-25 14:00:00',
          estado: 'programada',
          motivo: 'Control',
          paciente_id: 2,
          medico_id: 1,
          consultorio_id: 1
        }
      ];

      for (const cita of citas) {
        await request(app)
          .post('/api/citas')
          .send(cita);
      }

      const response = await request(app)
        .get('/api/citas')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/citas/:id', () => {
    test('Debería obtener cita por ID', async () => {
      const citaData = {
        fecha_hora: '2024-12-25 10:00:00',
        estado: 'programada',
        motivo: 'Consulta general',
        paciente_id: 1,
        medico_id: 1,
        consultorio_id: 1
      };

      const createResponse = await request(app)
        .post('/api/citas')
        .send(citaData);

      const citaId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/citas/${citaId}`)
        .expect(200);

      expect(response.body.id).toBe(citaId);
      expect(response.body.motivo).toBe(citaData.motivo);
    });

    test('Debería devolver 404 para cita inexistente', async () => {
      const response = await request(app)
        .get('/api/citas/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/citas/:id', () => {
    test('Debería actualizar cita existente', async () => {
      const citaData = {
        fecha_hora: '2024-12-25 10:00:00',
        estado: 'programada',
        motivo: 'Consulta general',
        paciente_id: 1,
        medico_id: 1,
        consultorio_id: 1
      };

      const createResponse = await request(app)
        .post('/api/citas')
        .send(citaData);

      const citaId = createResponse.body.id;
      const updateData = {
        estado: 'completada',
        motivo: 'Consulta de control'
      };

      const response = await request(app)
        .put(`/api/citas/${citaId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.estado).toBe(updateData.estado);
      expect(response.body.motivo).toBe(updateData.motivo);
    });
  });

  describe('DELETE /api/citas/:id', () => {
    test('Debería eliminar cita existente', async () => {
      const citaData = {
        fecha_hora: '2024-12-25 10:00:00',
        estado: 'programada',
        motivo: 'Consulta general',
        paciente_id: 1,
        medico_id: 1,
        consultorio_id: 1
      };

      const createResponse = await request(app)
        .post('/api/citas')
        .send(citaData);

      const citaId = createResponse.body.id;

      await request(app)
        .delete(`/api/citas/${citaId}`)
        .expect(200);

      // Verificar que la cita fue eliminada
      await request(app)
        .get(`/api/citas/${citaId}`)
        .expect(404);
    });
  });

  describe('GET /api/citas/paciente/:pacienteId', () => {
    test('Debería obtener citas por paciente', async () => {
      const citas = [
        {
          fecha_hora: '2024-12-25 10:00:00',
          estado: 'programada',
          motivo: 'Consulta general',
          paciente_id: 1,
          medico_id: 1,
          consultorio_id: 1
        },
        {
          fecha_hora: '2024-12-25 14:00:00',
          estado: 'programada',
          motivo: 'Control',
          paciente_id: 1,
          medico_id: 2,
          consultorio_id: 2
        },
        {
          fecha_hora: '2024-12-25 16:00:00',
          estado: 'programada',
          motivo: 'Consulta',
          paciente_id: 2,
          medico_id: 1,
          consultorio_id: 1
        }
      ];

      for (const cita of citas) {
        await request(app)
          .post('/api/citas')
          .send(cita);
      }

      const response = await request(app)
        .get('/api/citas/paciente/1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(c => c.paciente_id === 1)).toBe(true);
    });
  });

  describe('GET /api/citas/medico/:medicoId', () => {
    test('Debería obtener citas por médico', async () => {
      const citas = [
        {
          fecha_hora: '2024-12-25 10:00:00',
          estado: 'programada',
          motivo: 'Consulta general',
          paciente_id: 1,
          medico_id: 1,
          consultorio_id: 1
        },
        {
          fecha_hora: '2024-12-25 14:00:00',
          estado: 'programada',
          motivo: 'Control',
          paciente_id: 2,
          medico_id: 1,
          consultorio_id: 1
        },
        {
          fecha_hora: '2024-12-25 16:00:00',
          estado: 'programada',
          motivo: 'Consulta',
          paciente_id: 3,
          medico_id: 2,
          consultorio_id: 2
        }
      ];

      for (const cita of citas) {
        await request(app)
          .post('/api/citas')
          .send(cita);
      }

      const response = await request(app)
        .get('/api/citas/medico/1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(c => c.medico_id === 1)).toBe(true);
    });
  });
});