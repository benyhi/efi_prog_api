const request = require('supertest');
const express = require('express');
const especialidadRoutes = require('../routes/especialidadRoutes');
const { sequelize } = require('../config/database');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/especialidades', especialidadRoutes);

describe('Especialidad Controller Tests', () => {
  
  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  describe('POST /api/especialidades', () => {
    test('Debería crear una nueva especialidad', async () => {
      const especialidadData = {
        nombre: 'Cardiología',
        descripcion: 'Especialidad médica que se ocupa del corazón'
      };

      const response = await request(app)
        .post('/api/especialidades')
        .send(especialidadData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe(especialidadData.nombre);
      expect(response.body.descripcion).toBe(especialidadData.descripcion);
    });

    test('Debería fallar al crear especialidad con nombre duplicado', async () => {
      const especialidadData = {
        nombre: 'Cardiología',
        descripcion: 'Especialidad médica que se ocupa del corazón'
      };

      // Crear primera especialidad
      await request(app)
        .post('/api/especialidades')
        .send(especialidadData)
        .expect(201);

      // Intentar crear segunda especialidad con mismo nombre
      const response = await request(app)
        .post('/api/especialidades')
        .send(especialidadData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería fallar con datos incompletos', async () => {
      const especialidadIncompleta = {
        descripcion: 'Descripción sin nombre'
        // Falta el campo nombre requerido
      };

      const response = await request(app)
        .post('/api/especialidades')
        .send(especialidadIncompleta)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/especialidades', () => {
    test('Debería obtener lista de especialidades', async () => {
      const especialidades = [
        {
          nombre: 'Cardiología',
          descripcion: 'Especialidad del corazón'
        },
        {
          nombre: 'Dermatología',
          descripcion: 'Especialidad de la piel'
        },
        {
          nombre: 'Neurología',
          descripcion: 'Especialidad del sistema nervioso'
        }
      ];

      for (const especialidad of especialidades) {
        await request(app)
          .post('/api/especialidades')
          .send(especialidad);
      }

      const response = await request(app)
        .get('/api/especialidades')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    test('Debería devolver array vacío cuando no hay especialidades', async () => {
      const response = await request(app)
        .get('/api/especialidades')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/especialidades/:id', () => {
    test('Debería obtener especialidad por ID', async () => {
      const especialidadData = {
        nombre: 'Cardiología',
        descripcion: 'Especialidad médica que se ocupa del corazón'
      };

      const createResponse = await request(app)
        .post('/api/especialidades')
        .send(especialidadData);

      const especialidadId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/especialidades/${especialidadId}`)
        .expect(200);

      expect(response.body.id).toBe(especialidadId);
      expect(response.body.nombre).toBe(especialidadData.nombre);
      expect(response.body.descripcion).toBe(especialidadData.descripcion);
    });

    test('Debería devolver 404 para especialidad inexistente', async () => {
      const response = await request(app)
        .get('/api/especialidades/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/especialidades/:id', () => {
    test('Debería actualizar especialidad existente', async () => {
      const especialidadData = {
        nombre: 'Cardiología',
        descripcion: 'Especialidad médica que se ocupa del corazón'
      };

      const createResponse = await request(app)
        .post('/api/especialidades')
        .send(especialidadData);

      const especialidadId = createResponse.body.id;
      const updateData = {
        nombre: 'Cardiología Avanzada',
        descripcion: 'Especialidad médica avanzada del corazón y sistema cardiovascular'
      };

      const response = await request(app)
        .put(`/api/especialidades/${especialidadId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe(updateData.nombre);
      expect(response.body.descripcion).toBe(updateData.descripcion);
    });

    test('Debería devolver 404 al actualizar especialidad inexistente', async () => {
      const updateData = {
        nombre: 'Especialidad Inexistente',
        descripcion: 'Esta especialidad no existe'
      };

      const response = await request(app)
        .put('/api/especialidades/999999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/especialidades/:id', () => {
    test('Debería eliminar especialidad existente', async () => {
      const especialidadData = {
        nombre: 'Cardiología',
        descripcion: 'Especialidad médica que se ocupa del corazón'
      };

      const createResponse = await request(app)
        .post('/api/especialidades')
        .send(especialidadData);

      const especialidadId = createResponse.body.id;

      await request(app)
        .delete(`/api/especialidades/${especialidadId}`)
        .expect(200);

      // Verificar que la especialidad fue eliminada
      await request(app)
        .get(`/api/especialidades/${especialidadId}`)
        .expect(404);
    });

    test('Debería devolver 404 al eliminar especialidad inexistente', async () => {
      const response = await request(app)
        .delete('/api/especialidades/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/especialidades/buscar/:nombre', () => {
    test('Debería buscar especialidades por nombre', async () => {
      const especialidades = [
        {
          nombre: 'Cardiología',
          descripcion: 'Especialidad del corazón'
        },
        {
          nombre: 'Cardiología Infantil',
          descripcion: 'Cardiología para niños'
        },
        {
          nombre: 'Dermatología',
          descripcion: 'Especialidad de la piel'
        }
      ];

      for (const especialidad of especialidades) {
        await request(app)
          .post('/api/especialidades')
          .send(especialidad);
      }

      const response = await request(app)
        .get('/api/especialidades/buscar/Cardiología')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every(e => e.nombre.includes('Cardiología'))).toBe(true);
    });

    test('Debería devolver array vacío para búsqueda sin resultados', async () => {
      const response = await request(app)
        .get('/api/especialidades/buscar/EspecialidadInexistente')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});