const request = require('supertest');
const express = require('express');
const usuarioRoutes = require('../routes/usuarioRoutes');
const { sequelize } = require('../config/database');

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);

describe('Usuario Controller Tests', () => {
  
  beforeEach(async () => {
    // Sincronizar base de datos antes de cada prueba
    await sequelize.sync({ force: true });
  });

  describe('POST /api/usuarios', () => {
    test('Debería crear un nuevo usuario', async () => {
      const usuarioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@test.com',
        telefono: '123456789',
        password: 'password123',
        rol: 'paciente'
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(usuarioData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe(usuarioData.nombre);
      expect(response.body.email).toBe(usuarioData.email);
      expect(response.body.rol).toBe(usuarioData.rol);
    });

    test('Debería fallar al crear usuario con email duplicado', async () => {
      const usuarioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'duplicado@test.com',
        telefono: '123456789',
        password: 'password123',
        rol: 'paciente'
      };

      // Crear primer usuario
      await request(app)
        .post('/api/usuarios')
        .send(usuarioData)
        .expect(201);

      // Intentar crear segundo usuario con mismo email
      const response = await request(app)
        .post('/api/usuarios')
        .send(usuarioData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debería fallar con datos incompletos', async () => {
      const usuarioIncompleto = {
        nombre: 'Juan'
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(usuarioIncompleto)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/usuarios', () => {
    test('Debería obtener lista de usuarios', async () => {
      // Crear usuarios de prueba
      const usuarios = [
        {
          nombre: 'Usuario1',
          apellido: 'Apellido1',
          email: 'usuario1@test.com',
          telefono: '111111111',
          password: 'password123',
          rol: 'paciente'
        },
        {
          nombre: 'Usuario2',
          apellido: 'Apellido2',
          email: 'usuario2@test.com',
          telefono: '222222222',
          password: 'password123',
          rol: 'medico'
        }
      ];

      for (const usuario of usuarios) {
        await request(app)
          .post('/api/usuarios')
          .send(usuario);
      }

      const response = await request(app)
        .get('/api/usuarios')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/usuarios/:id', () => {
    test('Debería obtener usuario por ID', async () => {
      const usuarioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '123456789',
        password: 'password123',
        rol: 'paciente'
      };

      const createResponse = await request(app)
        .post('/api/usuarios')
        .send(usuarioData);

      const userId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/usuarios/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.nombre).toBe(usuarioData.nombre);
    });

    test('Debería devolver 404 para usuario inexistente', async () => {
      const response = await request(app)
        .get('/api/usuarios/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    test('Debería actualizar usuario existente', async () => {
      const usuarioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '123456789',
        password: 'password123',
        rol: 'paciente'
      };

      const createResponse = await request(app)
        .post('/api/usuarios')
        .send(usuarioData);

      const userId = createResponse.body.id;
      const updateData = {
        nombre: 'Juan Carlos',
        telefono: '987654321'
      };

      const response = await request(app)
        .put(`/api/usuarios/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe(updateData.nombre);
      expect(response.body.telefono).toBe(updateData.telefono);
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    test('Debería eliminar usuario existente', async () => {
      const usuarioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '123456789',
        password: 'password123',
        rol: 'paciente'
      };

      const createResponse = await request(app)
        .post('/api/usuarios')
        .send(usuarioData);

      const userId = createResponse.body.id;

      await request(app)
        .delete(`/api/usuarios/${userId}`)
        .expect(200);

      // Verificar que el usuario fue eliminado
      await request(app)
        .get(`/api/usuarios/${userId}`)
        .expect(404);
    });
  });
});