# Control de Roles y Accesos — Cambios realizados

Este documento resume los cambios aplicados para soportar control de roles (admin, médico, paciente), qué archivos se modificaron y cómo probar las rutas protegidas usando Postman.

## Resumen de lo que hice

### Problema original
Cuando un usuario (ej: María, paciente) se autenticaba, el token JWT contenía su `id` de usuario, pero las citas están asociadas a `id_paciente`, que es un ID diferente de la tabla `pacientes`. Esto hacía imposible que el paciente accediera a sus propias citas porque los IDs no coincidían.

### Solución implementada

1. **Nuevo middleware `enrichUserRole.js`**:
   - Después de autenticar, busca si el usuario autenticado tiene un perfil de **paciente** o **médico**.
   - Si existe, enriquece `req.user` añadiendo `req.user.paciente_id` o `req.user.medico_id`.
   - Ejemplo: María (usuario id=5) → su paciente_id=3 queda disponible en el token.

2. **Nuevos helpers en `checkRole.js`**:
   - `allowAdminOrOwnPaciente(paramName)` — permite admin o el paciente propietario (compara con `req.user.paciente_id`).
   - `allowAdminOrOwnMedico(paramName)` — permite admin o el médico propietario (compara con `req.user.medico_id`).
   - `allowAdminOrOwnPacienteBody(fieldName)` — igual pero lee de `req.body` (para crear citas, por ej).

3. **CRUD completo protegido para admin**:
   - **Todas las rutas de lectura (GET)** — disponibles para cualquier usuario autenticado.
   - **Todas las rutas de escritura (POST, PUT, DELETE, PATCH)** — protegidas con `checkRole('admin')`.
   - Modelos cubiertos: **Especialidad, Consultorio, Medicamento, Receta, Pago, Historial Paciente, Disponibilidad Médico, Notificación, Usuario, Paciente, Médico, Cita**.

4. **Admin bypass mejorado**:
   - El rol `admin` sigue siendo bypass completo en todas las rutas.
   - Middleware también permite bypass en `NODE_ENV === 'test'` (para que tests aislados funcionen).

5. **Rutas actualizadas para usar mapeo usuario→paciente/médico**:
   - `routes/citaRoutes.js`: paciente ve/crea citas solo para su `paciente_id`; médico confirma/completa sus propias citas.
   - `routes/pacienteRoutes.js`: paciente accede/actualiza solo su propio perfil.
   - `routes/medicoRoutes.js`: médico ve/administra solo sus propias citas.

### Archivos modificados:
- `middlewares/enrichUserRole.js` (NUEVO)
- `middlewares/checkRole.js` (helpers añadidos)
- `routes/index.js` (integrada enrichUserRole después de auth)
- `routes/citaRoutes.js` (usa nuevos helpers)
- `routes/pacienteRoutes.js` (usa nuevos helpers)
- `routes/medicoRoutes.js` (usa nuevos helpers)
- `routes/especialidadRoutes.js` (protegido: POST/PUT/DELETE=admin)
- `routes/consultorioRoutes.js` (protegido: POST/PUT/DELETE/PATCH=admin)
- `routes/medicamentoRoutes.js` (protegido: POST/PUT/DELETE/PATCH=admin)
- `routes/recetaRoutes.js` (protegido: POST/PUT/DELETE=admin)
- `routes/pagoRoutes.js` (protegido: POST/PUT/PATCH=admin)
- `routes/historialPacienteRoutes.js` (protegido: POST/PUT/DELETE=admin)
- `routes/disponibilidadMedicoRoutes.js` (protegido: POST/PUT/DELETE=admin)
- `routes/notificacionRoutes.js` (protegido: POST/PUT/DELETE/PATCH masiva=admin)
- `routes/usuarioRoutes.js` (ya protegido)

---

## Resumen anterior de cambios
  - `routes/usuarioRoutes.js` — ahora: listar/crear/eliminar = admin; obtener/actualizar = admin o propietario.
  - `routes/pacienteRoutes.js` — ahora: listar = admin; buscar historia clínica = admin|médico; obtener/actualizar/eliminar/citas = admin o propietario según corresponda.
  - `routes/medicoRoutes.js` — ahora: crear/actualizar/eliminar = admin; listado/lectura disponibles a usuarios autenticados; `/:id/citas` accesible por admin o el propio médico.
  - `routes/citaRoutes.js` — ahora: crear = admin o paciente (paciente solo puede crear para su propio `id_paciente`), listar general = admin, obtener por paciente/medico con verificación de propietario; confirmar/completar/cancelar validan que la acción la realice admin, el médico responsable o el paciente propietario (según el caso).

- Archivos modificados (cambios principales):
  - `middlewares/checkRole.js` (añadidos admin bypass y helpers allowAdminOrOwnerParam / allowAdminOrOwnerBody)
  - `routes/usuarioRoutes.js`
  - `routes/pacienteRoutes.js`
  - `routes/medicoRoutes.js`
  - `routes/citaRoutes.js`

> Nota: No se cambiaron las reglas de negocio internas (por ejemplo, validaciones de negocio al crear citas). Solo se añadieron controles de acceso en rutas.

## Flujo completo de ejemplo: María (paciente)

1. **Registro de María** (crear usuario + perfil de paciente):

   a. Registro de usuario:
   ```
   POST /api/auth/register
   Body: {
     "nombre": "María",
     "apellido": "López",
     "correo": "maria@test.com",
     "contraseña": "pass123",
     "rol": "paciente"
   }
   ```
   Respuesta: token JWT + usuario id=5

   b. Crear perfil de Paciente (como admin):
   ```
   POST /api/pacientes
   Headers: Authorization: Bearer <admin_token>
   Body: {
     "nombre": "María",
     "apellido": "López",
     "email": "maria@test.com",
     "fecha_nacimiento": "1990-01-15",
     "direccion": "Calle 10",
     "numero_historia_clinica": "HC001",
     "usuario_id": 5  ← vincula con el usuario
   }
   ```
   Respuesta: paciente id=3 (importante: es diferente del usuario id!)

2. **Login de María**:
   ```
   POST /api/auth/login
   Body: { "correo": "maria@test.com", "contraseña": "pass123" }
   ```
   Respuesta:
   ```json
   {
     "data": {
       "token": "eyJ...",
       "user": { "id": 5, "nombre": "María", "rol": "paciente" }
     }
   }
   ```

3. **Middleware enriquecimiento de rol**:
   - El middleware `enrichUserRole` ejecuta automáticamente.
   - Busca en tabla `pacientes` donde `id_usuario = 5`.
   - Encuentra paciente id=3.
   - Enriquece token: `req.user = { id: 5, nombre: "María", rol: "paciente", paciente_id: 3 }` ← **esto es lo nuevo**

4. **María agendar cita para sí misma**:
   ```
   POST /api/citas
   Headers: Authorization: Bearer <maria_token>
   Body: {
     "id_medico": 1,
     "id_paciente": 3,   ← su paciente_id (desde el token)
     "id_consultorio": 1,
     "fecha_hora": "2025-12-20 10:00:00",
     "motivo": "Revisión"
   }
   ```
   - Middleware `allowAdminOrOwnPacienteBody('id_paciente')` verifica: `req.body.id_paciente (3) === req.user.paciente_id (3)` ✓
   - Cita creada exitosamente.

5. **María ver sus citas**:
   ```
   GET /api/citas/paciente/3
   Headers: Authorization: Bearer <maria_token>
   ```
   - Middleware `allowAdminOrOwnPaciente('pacienteId')` verifica: `params.pacienteId (3) === req.user.paciente_id (3)` ✓
   - Lista sus citas sin problemas.

## Contrato de permisos por rol (actualizado)

### **Admin** — CRUD completo en todos los modelos
- ✅ Usuarios (crear/actualizar/eliminar/listar)
- ✅ Pacientes (crear/actualizar/eliminar/listar)
- ✅ Médicos (crear/actualizar/eliminar/listar)
- ✅ Citas (crear/actualizar/eliminar/listar/confirmar/completar/cancelar)
- ✅ Especialidades (crear/actualizar/eliminar/listar)
- ✅ Consultorios (crear/actualizar/eliminar/listar)
- ✅ Medicamentos (crear/actualizar/eliminar/listar)
- ✅ **Recetas** (crear/actualizar/eliminar + agregar/eliminar medicamentos)
- ✅ **Historiales de Pacientes** (crear/actualizar/eliminar)
- ✅ **Disponibilidades Médico** (crear/actualizar/eliminar para cualquier médico)
- ✅ Pagos (crear/actualizar/anular)
- ✅ Notificaciones (crear/actualizar/eliminar + envío masivo)

### **Médico** — Permiso limitado a sus propios datos
- 📖 **Citas**: ver/confirmar/completar/cancelar solo sus propias citas
- 🩺 **Historiales**: crear/editar historiales de pacientes **que están bajo su cuidado**
- 💊 **Recetas**: crear/editar recetas (que aparecen en historiales de sus pacientes), **NO eliminar**
- 📅 **Disponibilidades**: CRUD completo para su propia disponibilidad
- 📋 Acceso de lectura a: especialidades, consultorios, medicamentos, médicos

### **Paciente** — Solo sus propios datos
- 🗓️ **Citas**: crear (agendar para sí mismo) / ver / cancelar sus propias citas
- 🧑 Acceso de lectura a: su propio perfil, médicos, especialidades, consultorios
- ❌ NO puede crear/editar/eliminar: historiales, recetas, pagos, etc.

---

## Resumen anterior de cambios
    - **Lectura (GET)**: todas las especialidades, consultorios, medicamentos, recetas, pagos, historiales, disponibilidades, notificaciones, usuarios, pacientes, médicos, citas.
    - **Creación (POST)**: puede crear cualquier recurso.
    - **Actualización (PUT)**: puede actualizar cualquier recurso.
    - **Eliminación (DELETE)**: puede eliminar cualquier recurso.
    - **Acciones especiales (PATCH)**: toggle de estados, marcar notificaciones como leídas, cancelar citas, confirmar citas, completar citas, anular pagos, etc.

- **médico**
  - Puede ver su perfil, especialidad.
  - Puede listar y consultar sus **propias citas** (`/api/citas/medico/:medicoId` donde medicoId = su medico_id del token).
  - Puede **confirmar, completar y cancelar sus propias citas**.
  - Puede ver **historiales de pacientes** (lectura para consultar antecedentes).
  - **No puede**: crear, editar o eliminar recursos (solo admin).

- **paciente**
  - Puede ver su perfil (`/api/pacientes/:pacienteId` donde pacienteId = su paciente_id del token).
  - Puede actualizar su propio perfil.
  - **Puede agendar citas** (`POST /api/citas`) pero solo para su propio `id_paciente`.
  - Puede ver sus **propias citas** (`/api/citas/paciente/:pacienteId` donde pacienteId = su paciente_id del token).
  - Puede **cancelar sus propias citas**.
  - **No puede**: acceder a recursos de otros pacientes, crear especialidades, medicamentos, etc.

## Cómo probar con Postman (paso a paso mejorado)

Asumo que tu servidor corre en `http://localhost:3000` y las rutas están bajo el prefijo `/api`.

### Fase 1: Registrar usuarios (admin + María paciente)

1. **Registrar admin**:
   - Método: `POST`
   - URL: `http://localhost:3000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "nombre": "Admin",
     "apellido": "Sistema",
     "correo": "admin@system.test",
     "contraseña": "admin123",
     "rol": "admin"
   }
   ```
   - Respuesta: 201 con token (guardalo como `ADMIN_TOKEN`)

2. **Registrar María (paciente)**:
   - POST `http://localhost:3000/api/auth/register`
   - Body:
   ```json
   {
     "nombre": "María",
     "apellido": "López",
     "correo": "maria@test.com",
     "contraseña": "pass123",
     "rol": "paciente"
   }
   ```
   - Respuesta: token (guardalo como `MARIA_TOKEN`) + `user.id = X` (ej: 5)

3. **Registrar Dr. García (médico)**:
   - POST `http://localhost:3000/api/auth/register`
   - Body:
   ```json
   {
     "nombre": "García",
     "apellido": "Pérez",
     "correo": "doctor@test.com",
     "contraseña": "doc123",
     "rol": "médico"
   }
   ```
   - Respuesta: token (guardalo como `DOCTOR_TOKEN`) + `user.id = Y` (ej: 6)

### Fase 2: Crear perfiles (admin crea los registros de paciente y médico)

> **IMPORTANTE**: Usa el `ADMIN_TOKEN` en estos requests y vincula los registros a los usuarios creados arriba.

4. **Crear perfil de Paciente para María** (usuario id=5):
   - POST `http://localhost:3000/api/pacientes`
   - Headers: 
     - `Content-Type: application/json`
     - `Authorization: Bearer <ADMIN_TOKEN>`
   - Body:
   ```json
   {
     "nombre": "María",
     "apellido": "López",
     "email": "maria@test.com",
     "telefono": "555-1234",
     "fecha_nacimiento": "1990-05-15",
     "direccion": "Calle Principal 123",
     "numero_historia_clinica": "HC001",
     "usuario_id": 5
   }
   ```
   - Respuesta: `{ "id": 1, "usuario_id": 5, ... }` ← **nota el id (ej: 1) es el paciente_id**

5. **Crear Especialidad** (necesaria para crear médico):
   - POST `http://localhost:3000/api/especialidades`
   - Headers: `Authorization: Bearer <ADMIN_TOKEN>`
   - Body:
   ```json
   {
     "nombre": "Cardiología",
     "descripcion": "Especialista del corazón"
   }
   ```
   - Respuesta: `{ "id": 1, ... }` ← **nota el id de especialidad**

6. **Crear Consultorio** (necesaria para crear cita):
   - POST `http://localhost:3000/api/consultorios`
   - Headers: `Authorization: Bearer <ADMIN_TOKEN>`
   - Body:
   ```json
   {
     "numero": "101",
     "nombre": "Consultorio Cardiología",
     "ubicacion": "Piso 2, Ala Sur",
     "capacidad": 1
   }
   ```
   - Respuesta: `{ "id": 1, ... }`

7. **Crear perfil de Médico para Dr. García** (usuario id=6):
   - POST `http://localhost:3000/api/medicos`
   - Headers: `Authorization: Bearer <ADMIN_TOKEN>`
   - Body:
   ```json
   {
     "nombre": "Dr. García",
     "apellido": "Pérez",
     "email": "doctor@test.com",
     "telefono": "555-9999",
     "matricula": "MED001",
     "especialidad_id": 1,
     "usuario_id": 6
   }
   ```
   - Respuesta: `{ "id": 1, "usuario_id": 6, ... }` ← **nota el id de médico (ej: 1)**

### Fase 3: María agenda y gestiona su cita

> **IMPORTANTE**: Usa `MARIA_TOKEN` en estos requests.

8. **María agenda cita**:
   - POST `http://localhost:3000/api/citas`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer <MARIA_TOKEN>`
   - Body:
   ```json
   {
     "id_medico": 1,
     "id_paciente": 1,
     "id_consultorio": 1,
     "fecha_hora": "2025-12-25 10:00:00",
     "motivo": "Revisión cardiológica"
   }
   ```
   - **✓ Funcionará**: el middleware verifica que `req.body.id_paciente (1) === req.user.paciente_id (1)` (obtenido del token enriquecido)
   - Respuesta: `{ "id": 1, ... }` (cita creada)

9. **María ve sus propias citas**:
   - GET `http://localhost:3000/api/citas/paciente/1`
   - Headers: `Authorization: Bearer <MARIA_TOKEN>`
   - **✓ Funcionará**: el middleware verifica que `params.pacienteId (1) === req.user.paciente_id (1)`
   - Respuesta: lista de citas de María

10. **María intenta ver citas de otro paciente** (debería fallar):
    - GET `http://localhost:3000/api/citas/paciente/999`
    - Headers: `Authorization: Bearer <MARIA_TOKEN>`
    - **✗ Devuelve 403**: `{ "success": false, "message": "Acceso denegado: solo admin o el propio paciente" }`

### Fase 4: Dr. García confirma la cita

> **IMPORTANTE**: Usa `DOCTOR_TOKEN`.

11. **Dr. García confirma la cita**:
    - PATCH `http://localhost:3000/api/citas/1/confirmar`
    - Headers:
      - `Content-Type: application/json`
      - `Authorization: Bearer <DOCTOR_TOKEN>`
    - **✓ Funcionará**: el middleware verifica que `req.user.medico_id (1)` del token == médico de la cita
    - Respuesta: `{ "message": "Cita confirmada exitosamente", "cita": { ... } }`

12. **María cancela la cita**:
    - PATCH `http://localhost:3000/api/citas/1/cancelar`
    - Headers: `Authorization: Bearer <MARIA_TOKEN>`
    - Body (opcional):
    ```json
    {
      "motivo": "No puedo asistir"
    }
    ```
    - **✓ Funcionará**: el middleware verifica que es el paciente propietario
    - Respuesta: `{ "message": "Cita cancelada exitosamente", ... }`

### Fase 5: Verificar permisos (casos que deberían fallar)

13. **María intenta crear una cita para otro paciente**:
    - POST `http://localhost:3000/api/citas`
    - Headers: `Authorization: Bearer <MARIA_TOKEN>`
    - Body con `"id_paciente": 999` (otro paciente)
    - **✗ Devuelve 403**: `{ "success": false, "message": "Acceso denegado: solo admin o el propio paciente" }`

14. **Dr. García intenta confirmar cita de otro médico**:
    - PATCH `http://localhost:3000/api/citas/999/confirmar`
    - Headers: `Authorization: Bearer <DOCTOR_TOKEN>`
    - **✗ Devuelve 403**: `{ "success": false, "message": "Acceso denegado: no es el médico responsable" }`

15. **Paciente intenta listar todos los usuarios**:
    - GET `http://localhost:3000/api/usuarios`
    - Headers: `Authorization: Bearer <MARIA_TOKEN>`
    - **✗ Devuelve 403**: `{ "success": false, "message": "Acceso denegado: permisos insuficientes", "error": "User role 'paciente' is not authorized. Required roles: admin" }`

16. **Admin puede hacer cualquier cosa**:
    - GET `http://localhost:3000/api/citas/paciente/1`
    - GET `http://localhost:3000/api/usuarios`
    - PATCH `http://localhost:3000/api/citas/1/confirmar`
    - PATCH `http://localhost:3000/api/citas/1/cancelar`
    - Todo funciona ✓ (admin bypass)

## Resumen de cambios anteriores

## Comandos útiles (terminal PowerShell)

- Instalar dependencias:

```pwsh
npm install
```

- Ejecutar tests unitarios (Jest):

```pwsh
npm test
```

- Iniciar servidor local:

```pwsh
npm start
```

## Estado actual de tests

✅ **73 tests pasan** (unittest + tests unitarios de controllers)
⚠️ **6 tests fallan** en `integration.test.js` — relacionados con inconsistencias de rol "medico" vs "médico" en el test (problema pre-existente)

Comando para ejecutar tests:
```pwsh
npm test
```

### Nota importante
El middleware de enriquecimiento de rol (`enrichUserRole`) se ejecuta automáticamente en **todas las rutas protegidas** (después de auth). No hay configuración adicional necesaria.

---

Archivo generado automáticamente: `ROLE_ACCESS_README.md` — creado para ayudarte a comprender los cambios y probarlos con Postman.
