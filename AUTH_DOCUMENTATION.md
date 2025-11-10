# Sistema de Autenticación JWT

## Descripción

Este proyecto implementa un sistema completo de autenticación basado en **JWT (JSON Web Tokens)** con validación de roles.

## Instalación

Las dependencias necesarias ya han sido instaladas:
- `jsonwebtoken`: Para crear y verificar tokens JWT
- `bcryptjs`: Para encriptar contraseñas (ya estaba en el proyecto)

## Configuración

### Variables de Entorno (.env)

Asegúrate de tener estas variables en tu archivo `.env`:

```bash
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
```

**Importante**: 
- Cambia `JWT_SECRET` a una cadena segura en producción
- `JWT_EXPIRE` puede ser `24h`, `7d`, `30d`, etc.

## Endpoints de Autenticación

### 1. Registrar Usuario
**POST** `/api/auth/register`

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@example.com",
  "contraseña": "password123",
  "rol": "paciente",
  "telefono": "1234567890",
  "direccion": "Calle 123"
}
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@example.com",
      "rol": "paciente"
    }
  }
}
```

### 2. Login
**POST** `/api/auth/login`

```json
{
  "correo": "juan@example.com",
  "contraseña": "password123"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@example.com",
      "rol": "paciente"
    }
  }
}
```

### 3. Obtener Perfil
**GET** `/api/auth/profile`

**Header requerido**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@example.com",
    "rol": "paciente",
    "telefono": "1234567890",
    "direccion": "Calle 123"
  }
}
```

## Middlewares

### 1. authMiddleware (Autenticación)

Valida que el usuario esté autenticado y tenga un token JWT válido.

**Ubicación**: `middlewares/auth.js`

**Uso**:
```javascript
const authMiddleware = require('../middlewares/auth');

router.get('/mi-ruta-protegida', authMiddleware, miControlador);
```

**Headers requeridos**:
```
Authorization: Bearer <token>
```

**Errores**:
- 401: Token no proporcionado o expirado
- 401: Token inválido

### 2. checkRole (Validación de Roles)

Valida que el usuario autenticado tenga uno de los roles permitidos.

**Ubicación**: `middlewares/checkRole.js`

**Roles disponibles**: `'admin'`, `'médico'`, `'paciente'`

**Uso**:
```javascript
const checkRole = require('../middlewares/checkRole');
const authMiddleware = require('../middlewares/auth');

// Solo admins
router.delete('/usuarios/:id', 
  authMiddleware, 
  checkRole('admin'), 
  miControlador
);

// Médicos y admins
router.post('/citas', 
  authMiddleware, 
  checkRole('médico', 'admin'), 
  miControlador
);

// Solo pacientes
router.get('/mis-citas', 
  authMiddleware, 
  checkRole('paciente'), 
  miControlador
);
```

**Errores**:
- 403: Usuario no tiene permisos para acceder

## Estructura de Token JWT

El token contiene la siguiente información (payload):

```json
{
  "id": 1,
  "correo": "juan@example.com",
  "rol": "paciente",
  "nombre": "Juan",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Flujo de Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión y recibe un token JWT
2. **Almacenamiento**: El cliente guarda el token (localStorage, sessionStorage, etc.)
3. **Uso**: El cliente envía el token en cada solicitud protegida en el header `Authorization: Bearer <token>`
4. **Validación**: El middleware valida el token y extrae la información del usuario
5. **Autorización**: El middleware checkRole valida que el usuario tenga los permisos necesarios

## Seguridad

- Las contraseñas se encriptan con bcryptjs (10 rounds)
- Los tokens expirar después del tiempo especificado en JWT_EXPIRE
- El JWT_SECRET debe ser una cadena segura en producción
- Siempre usa HTTPS en producción

## Ejemplo de Implementación en Rutas

### Archivo: `routes/citaRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// Obtener todas las citas (solo usuarios autenticados)
router.get('/', authMiddleware, citaController.getAllCitas);

// Crear cita (solo médicos y admins)
router.post('/', 
  authMiddleware, 
  checkRole('médico', 'admin'), 
  citaController.createCita
);

// Actualizar cita (solo médicos y admins)
router.put('/:id', 
  authMiddleware, 
  checkRole('médico', 'admin'), 
  citaController.updateCita
);

// Eliminar cita (solo admins)
router.delete('/:id', 
  authMiddleware, 
  checkRole('admin'), 
  citaController.deleteCita
);

module.exports = router;
```

## Testing con Postman

1. **Registrar usuario**:
   - POST: `http://localhost:3000/api/auth/register`
   - Body (JSON): Ver ejemplo arriba
   - Copiar el token de la respuesta

2. **Usar token en peticiones protegidas**:
   - GET: `http://localhost:3000/api/auth/profile`
   - Header: `Authorization: Bearer {token_copiado}`

3. **Probar acceso denegado**:
   - Sin token: Recibirás 401
   - Con rol incorrecto: Recibirás 403

## Archivos Creados/Modificados

- ✅ `middlewares/auth.js` - Middleware de autenticación
- ✅ `middlewares/checkRole.js` - Middleware de validación de roles
- ✅ `controllers/authController.js` - Controlador de autenticación
- ✅ `routes/authRoutes.js` - Rutas de autenticación
- ✅ `routes/index.js` - Actualizado para incluir rutas de autenticación
- ✅ `.env.example` - Configuración de JWT
- ✅ `middlewares/MIDDLEWARE_EXAMPLES.js` - Ejemplos de uso

## Próximos Pasos

1. Actualizar tus rutas existentes para usar los middlewares
2. Cambiar `JWT_SECRET` a un valor seguro en `.env`
3. Proteger las rutas según sea necesario con `authMiddleware` y `checkRole`
4. Hacer pruebas con Postman o Thunder Client
