const request = require('supertest');
const express = require('express');
const consultorioRoutes = require('../routes/consultorioRoutes');
const { sequelize } = require('../config/database');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/consultorios', consultorioRoutes);

describe('Consultorio Controller Tests', () => {
  
  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  describe('POST /api/consultorios', () => {
    test('Debería crear un nuevo consultorio', async () => {
      const consultorioData = {
        numero: '101',
        nombre: 'Consultorio Cardiología',
        ubicacion: 'Piso 1, Ala Este',
        capacidad: 1
      };

      const response = await request(app)
        .post('/api/consultorios')
        .send(consultorioData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.numero).toBe(consultorioData.numero);
      expect(response.body.nombre).toBe(consultorioData.nombre);
      expect(response.body.ubicacion).toBe(consultorioData.ubicacion);
      expect(response.body.capacidad).toBe(consultorioData.capacidad);
    });

    test('Debería fallar al crear consultorio con número duplicado', async () => {
      const consultorioData = {
        numero: '101',
        nombre: 'Consultorio Cardiología',
        ubicacion: 'Piso 1',
        capacidad: 1
      };

      // Crear primer consultorio
      await request(app)
        .post('/api/consultorios')
        .send(consultorioData)
        .expect(201);

      // Intentar crear segundo consultorio con mismo número
      const consultorioData2 = {
        ...consultorioData,
        nombre: 'Otro Consultorio'
      };

      const response = await request(app)
        .post('/api/consultorios')
        .send(consultorioData2)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería fallar con datos incompletos', async () => {
      const consultorioIncompleto = {
        nombre: 'Consultorio sin número'
        // Falta el campo numero requerido
      };

      const response = await request(app)
        .post('/api/consultorios')
        .send(consultorioIncompleto)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/consultorios', () => {
    test('Debería obtener lista de consultorios', async () => {
      const consultorios = [
        {
          numero: '101',
          nombre: 'Consultorio Cardiología',
          ubicacion: 'Piso 1',
          capacidad: 1
        },
        {
          numero: '102',
          nombre: 'Consultorio Dermatología',
          ubicacion: 'Piso 1',
          capacidad: 1
        },
        {
          numero: '201',
          nombre: 'Consultorio Neurología',
          ubicacion: 'Piso 2',
          capacidad: 2
        }
      ];

      for (const consultorio of consultorios) {
        await request(app)
          .post('/api/consultorios')
          .send(consultorio);
      }

      const response = await request(app)
        .get('/api/consultorios')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });
  });

  describe('GET /api/consultorios/:id', () => {
    test('Debería obtener consultorio por ID', async () => {
      const consultorioData = {
        numero: '101',
        nombre: 'Consultorio Cardiología',
        ubicacion: 'Piso 1',
        capacidad: 1
      };

      const createResponse = await request(app)
        .post('/api/consultorios')
        .send(consultorioData);

      const consultorioId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/consultorios/${consultorioId}`)
        .expect(200);

      expect(response.body.id).toBe(consultorioId);
      expect(response.body.numero).toBe(consultorioData.numero);
      expect(response.body.nombre).toBe(consultorioData.nombre);
    });

    test('Debería devolver 404 para consultorio inexistente', async () => {
      const response = await request(app)
        .get('/api/consultorios/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/consultorios/:id', () => {
    test('Debería actualizar consultorio existente', async () => {
      const consultorioData = {
        numero: '101',
        nombre: 'Consultorio Cardiología',
        ubicacion: 'Piso 1',
        capacidad: 1
      };

      const createResponse = await request(app)
        .post('/api/consultorios')
        .send(consultorioData);

      const consultorioId = createResponse.body.id;
      const updateData = {
        nombre: 'Consultorio Cardiología Avanzada',
        capacidad: 2
      };

      const response = await request(app)
        .put(`/api/consultorios/${consultorioId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe(updateData.nombre);
      expect(response.body.capacidad).toBe(updateData.capacidad);
    });
  });

  describe('DELETE /api/consultorios/:id', () => {
    test('Debería eliminar consultorio existente', async () => {
      const consultorioData = {
        numero: '101',
        nombre: 'Consultorio Cardiología',
        ubicacion: 'Piso 1',
        capacidad: 1
      };

      const createResponse = await request(app)
        .post('/api/consultorios')
        .send(consultorioData);

      const consultorioId = createResponse.body.id;

      await request(app)
        .delete(`/api/consultorios/${consultorioId}`)
        .expect(200);

      // Verificar que el consultorio fue eliminado
      await request(app)
        .get(`/api/consultorios/${consultorioId}`)
        .expect(404);
    });
  });

  describe('GET /api/consultorios/numero/:numero', () => {
    test('Debería obtener consultorio por número', async () => {
      const consultorioData = {
        numero: '101',
        nombre: 'Consultorio Cardiología',
        ubicacion: 'Piso 1',
        capacidad: 1
      };

      await request(app)
        .post('/api/consultorios')
        .send(consultorioData);

      const response = await request(app)
        .get(`/api/consultorios/numero/${consultorioData.numero}`)
        .expect(200);

      expect(response.body.numero).toBe(consultorioData.numero);
      expect(response.body.nombre).toBe(consultorioData.nombre);
    });

    test('Debería devolver 404 para número de consultorio inexistente', async () => {
      const response = await request(app)
        .get('/api/consultorios/numero/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/consultorios/disponibles', () => {
    test('Debería obtener consultorios disponibles', async () => {
      const consultorios = [
        {
          numero: '101',
          nombre: 'Consultorio Disponible 1',
          ubicacion: 'Piso 1',
          capacidad: 1
        },
        {
          numero: '102',
          nombre: 'Consultorio Disponible 2',
          ubicacion: 'Piso 1',
          capacidad: 2
        }
      ];

      for (const consultorio of consultorios) {
        await request(app)
          .post('/api/consultorios')
          .send(consultorio);
      }

      const response = await request(app)
        .get('/api/consultorios/disponibles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });
});