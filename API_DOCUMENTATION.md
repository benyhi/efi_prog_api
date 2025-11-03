# 📋 Documentación Completa de la API - Sistema Médico

**Base URL:** `http://localhost:3000/api`

## 📑 Índice

- [👥 Usuarios](#-usuarios)
- [🏥 Especialidades](#-especialidades)
- [👨‍⚕️ Médicos](#-médicos)
- [🤒 Pacientes](#-pacientes)
- [🏢 Consultorios](#-consultorios)
- [📋 Citas](#-citas)
- [📄 Historiales de Pacientes](#-historiales-de-pacientes)
- [📅 Disponibilidades de Médicos](#-disponibilidades-de-médicos)
- [📝 Recetas](#-recetas)
- [💊 Medicamentos](#-medicamentos)
- [💰 Pagos](#-pagos)
- [🔔 Notificaciones](#-notificaciones)

---

## 👥 Usuarios

### GET `/api/usuarios`
Obtener todos los usuarios con paginación y filtros.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Límite por página (default: 10)
- `search` (opcional): Buscar por nombre o correo
- `rol` (opcional): Filtrar por rol (`admin`, `médico`, `paciente`)

**Request:**
```http
GET /api/usuarios?page=1&limit=10&rol=médico&search=juan
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Dr. Juan",
    "apellido": "Pérez",
    "correo": "dr.perez@hospital.com",
    "rol": "médico",
    "telefono": "555-0002",
    "direccion": "Calle Médica 123",
    "fecha_nacimiento": "1975-05-15",
    "esta_activo": true,
    "creado": "2025-11-03T10:00:00.000Z",
    "medico": {
      "id": 1,
      "matricula": "MED123",
      "especialidad_id": 1
    },
    "paciente": null
  }
]
```

### GET `/api/usuarios/:id`
Obtener un usuario específico por ID.

**Request:**
```http
GET /api/usuarios/1
```

**Response:**
```json
{
  "id": 1,
  "nombre": "Dr. Juan",
  "apellido": "Pérez",
  "correo": "dr.perez@hospital.com",
  "rol": "médico",
  "telefono": "555-0002",
  "direccion": "Calle Médica 123",
  "fecha_nacimiento": "1975-05-15",
  "esta_activo": true,
  "creado": "2025-11-03T10:00:00.000Z",
  "medico": {
    "id": 1,
    "matricula": "MED123",
    "especialidad_id": 1,
    "especialidad": {
      "nombre": "Cardiología"
    }
  }
}
```

### POST `/api/usuarios`
Crear un nuevo usuario.

**Request:**
```http
POST /api/usuarios
Content-Type: application/json

{
  "nombre": "Ana",
  "apellido": "García",
  "correo": "ana.garcia@email.com",
  "contraseña": "segura123",
  "rol": "paciente",
  "telefono": "555-0123",
  "direccion": "Av. Principal 456",
  "fecha_nacimiento": "1990-03-20"
}
```

**Response:**
```json
{
  "id": 15,
  "nombre": "Ana",
  "apellido": "García",
  "correo": "ana.garcia@email.com",
  "rol": "paciente",
  "telefono": "555-0123",
  "direccion": "Av. Principal 456",
  "fecha_nacimiento": "1990-03-20",
  "esta_activo": true,
  "creado": "2025-11-03T15:30:00.000Z"
}
```

### PUT `/api/usuarios/:id`
Actualizar un usuario existente.

**Request:**
```http
PUT /api/usuarios/15
Content-Type: application/json

{
  "telefono": "555-9999",
  "direccion": "Nueva Dirección 789"
}
```

**Response:**
```json
{
  "id": 15,
  "nombre": "Ana",
  "apellido": "García",
  "correo": "ana.garcia@email.com",
  "telefono": "555-9999",
  "direccion": "Nueva Dirección 789",
  "fecha_nacimiento": "1990-03-20"
}
```

### DELETE `/api/usuarios/:id`
Eliminar (desactivar) un usuario.

**Request:**
```http
DELETE /api/usuarios/15
```

**Response:**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

---

## 🏥 Especialidades

### GET `/api/especialidades`
Obtener todas las especialidades.

**Request:**
```http
GET /api/especialidades
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Cardiología",
    "descripcion": "Especialidad enfocada en el corazón y sistema cardiovascular",
    "activa": true,
    "fecha_creacion": "2025-11-03T10:00:00.000Z"
  },
  {
    "id": 2,
    "nombre": "Dermatología",
    "descripcion": "Especialidad enfocada en la piel y sus enfermedades",
    "activa": true,
    "fecha_creacion": "2025-11-03T10:00:00.000Z"
  }
]
```

### POST `/api/especialidades`
Crear una nueva especialidad.

**Request:**
```http
POST /api/especialidades
Content-Type: application/json

{
  "nombre": "Neurología",
  "descripcion": "Especialidad enfocada en el sistema nervioso"
}
```

**Response:**
```json
{
  "id": 8,
  "nombre": "Neurología",
  "descripcion": "Especialidad enfocada en el sistema nervioso",
  "activa": true,
  "fecha_creacion": "2025-11-03T16:00:00.000Z"
}
```

---

## 👨‍⚕️ Médicos

### GET `/api/medicos`
Obtener todos los médicos con filtros.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `especialidad_id`: Filtrar por especialidad
- `activo`: Filtrar por estado (true/false)

**Request:**
```http
GET /api/medicos?especialidad_id=1&page=1&limit=5
```

**Response:**
```json
[
  {
    "id": 1,
    "matricula": "MED123",
    "anos_experiencia": 10,
    "usuario_id": 2,
    "especialidad_id": 1,
    "activo": true,
    "fecha_registro": "2025-11-03T10:00:00.000Z",
    "usuario": {
      "nombre": "Dr. Juan",
      "apellido": "Pérez",
      "correo": "dr.perez@hospital.com",
      "telefono": "555-0002"
    },
    "especialidad": {
      "nombre": "Cardiología",
      "descripcion": "Especialidad enfocada en el corazón"
    }
  }
]
```

### GET `/api/medicos/:id`
Obtener un médico específico.

**Request:**
```http
GET /api/medicos/1
```

**Response:**
```json
{
  "id": 1,
  "matricula": "MED123",
  "anos_experiencia": 10,
  "usuario_id": 2,
  "especialidad_id": 1,
  "activo": true,
  "fecha_registro": "2025-11-03T10:00:00.000Z",
  "usuario": {
    "nombre": "Dr. Juan",
    "apellido": "Pérez",
    "correo": "dr.perez@hospital.com",
    "telefono": "555-0002",
    "direccion": "Calle Médica 123"
  },
  "especialidad": {
    "nombre": "Cardiología",
    "descripcion": "Especialidad enfocada en el corazón"
  },
  "disponibilidades": [
    {
      "id": 1,
      "dia_semana": "lunes",
      "hora_inicio": "08:00",
      "hora_fin": "12:00",
      "activa": true
    }
  ]
}
```

### POST `/api/medicos`
Crear un nuevo médico.

**Request:**
```http
POST /api/medicos
Content-Type: application/json

{
  "usuario_id": 15,
  "especialidad_id": 2,
  "matricula": "MED456",
  "anos_experiencia": 5
}
```

**Response:**
```json
{
  "id": 8,
  "matricula": "MED456",
  "anos_experiencia": 5,
  "usuario_id": 15,
  "especialidad_id": 2,
  "activo": true,
  "fecha_registro": "2025-11-03T16:30:00.000Z"
}
```

---

## 🤒 Pacientes

### GET `/api/pacientes`
Obtener todos los pacientes.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `search`: Buscar por nombre o historia clínica

**Request:**
```http
GET /api/pacientes?search=maria&page=1&limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "historia_clinica": "HC001",
    "tipo_sangre": "O+",
    "alergias": "Penicilina",
    "contacto_emergencia": "Juan González - 555-0123",
    "usuario_id": 3,
    "activo": true,
    "fecha_registro": "2025-11-03T10:00:00.000Z",
    "usuario": {
      "nombre": "María",
      "apellido": "González",
      "correo": "maria@email.com",
      "telefono": "555-0003",
      "fecha_nacimiento": "1985-08-12"
    }
  }
]
```

### GET `/api/pacientes/:id`
Obtener un paciente específico.

**Request:**
```http
GET /api/pacientes/1
```

**Response:**
```json
{
  "id": 1,
  "historia_clinica": "HC001",
  "tipo_sangre": "O+",
  "alergias": "Penicilina",
  "contacto_emergencia": "Juan González - 555-0123",
  "usuario_id": 3,
  "activo": true,
  "fecha_registro": "2025-11-03T10:00:00.000Z",
  "usuario": {
    "nombre": "María",
    "apellido": "González",
    "correo": "maria@email.com",
    "telefono": "555-0003",
    "direccion": "Calle Paciente 789",
    "fecha_nacimiento": "1985-08-12"
  },
  "citas": [
    {
      "id": 1,
      "fecha_hora": "2025-11-10T09:00:00.000Z",
      "estado": "programada",
      "motivo": "Consulta de rutina"
    }
  ],
  "historiales": [
    {
      "id": 1,
      "fecha_consulta": "2025-11-01T10:00:00.000Z",
      "diagnostico": "Hipertensión leve",
      "tratamiento": "Dieta baja en sodio"
    }
  ]
}
```

---

## 🏢 Consultorios

### GET `/api/consultorios`
Obtener todos los consultorios.

**Request:**
```http
GET /api/consultorios
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Consultorio A",
    "ubicacion": "Primer Piso - Ala Norte",
    "capacidad": 1,
    "equipamiento": "Básico: Camilla, escritorio, sillas",
    "activo": true,
    "fecha_creacion": "2025-11-03T10:00:00.000Z"
  },
  {
    "id": 2,
    "nombre": "Consultorio B",
    "ubicacion": "Primer Piso - Ala Sur",
    "capacidad": 1,
    "equipamiento": "Avanzado: Electrocardiograma, monitor",
    "activo": true,
    "fecha_creacion": "2025-11-03T10:00:00.000Z"
  }
]
```

### POST `/api/consultorios`
Crear un nuevo consultorio.

**Request:**
```http
POST /api/consultorios
Content-Type: application/json

{
  "nombre": "Consultorio C",
  "ubicacion": "Segundo Piso - Ala Este",
  "capacidad": 2,
  "equipamiento": "Especializado: Dermatoscopio, lámpara UV"
}
```

**Response:**
```json
{
  "id": 15,
  "nombre": "Consultorio C",
  "ubicacion": "Segundo Piso - Ala Este",
  "capacidad": 2,
  "equipamiento": "Especializado: Dermatoscopio, lámpara UV",
  "activo": true,
  "fecha_creacion": "2025-11-03T16:45:00.000Z"
}
```

---

## 📋 Citas

### GET `/api/citas`
Obtener todas las citas con filtros.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `fecha_inicio`: Filtrar desde fecha (YYYY-MM-DD)
- `fecha_fin`: Filtrar hasta fecha (YYYY-MM-DD)
- `estado`: Filtrar por estado (`programada`, `completada`, `cancelada`)
- `id_medico`: Filtrar por médico
- `id_paciente`: Filtrar por paciente

**Request:**
```http
GET /api/citas?fecha_inicio=2025-11-01&fecha_fin=2025-11-30&estado=programada&page=1
```

**Response:**
```json
[
  {
    "id": 1,
    "fecha_hora": "2025-11-10T09:00:00.000Z",
    "estado": "programada",
    "motivo": "Consulta de rutina",
    "notas": null,
    "id_medico": 1,
    "id_paciente": 1,
    "id_consultorio": 1,
    "fecha_creacion": "2025-11-03T10:00:00.000Z",
    "medico": {
      "id": 1,
      "nombre": "Dr. Juan",
      "matricula": "MED123",
      "usuario": {
        "nombre": "Dr. Juan",
        "correo": "dr.perez@hospital.com"
      }
    },
    "paciente": {
      "id": 1,
      "usuario": {
        "nombre": "María González",
        "correo": "maria@email.com",
        "telefono": "555-0003"
      }
    },
    "consultorio": {
      "id": 1,
      "nombre": "Consultorio A",
      "ubicacion": "Primer Piso - Ala Norte"
    }
  }
]
```

### GET `/api/citas/:id`
Obtener una cita específica.

**Request:**
```http
GET /api/citas/1
```

**Response:**
```json
{
  "id": 1,
  "fecha_hora": "2025-11-10T09:00:00.000Z",
  "estado": "programada",
  "motivo": "Consulta de rutina",
  "notas": null,
  "id_medico": 1,
  "id_paciente": 1,
  "id_consultorio": 1,
  "fecha_creacion": "2025-11-03T10:00:00.000Z",
  "medico": {
    "id": 1,
    "matricula": "MED123",
    "usuario": {
      "nombre": "Dr. Juan",
      "apellido": "Pérez",
      "correo": "dr.perez@hospital.com"
    },
    "especialidad": {
      "nombre": "Cardiología"
    }
  },
  "paciente": {
    "id": 1,
    "historia_clinica": "HC001",
    "usuario": {
      "nombre": "María",
      "apellido": "González",
      "correo": "maria@email.com",
      "telefono": "555-0003"
    }
  },
  "consultorio": {
    "id": 1,
    "nombre": "Consultorio A",
    "ubicacion": "Primer Piso - Ala Norte",
    "equipamiento": "Básico: Camilla, escritorio, sillas"
  }
}
```

### GET `/api/citas/paciente/:pacienteId`
Obtener citas de un paciente específico.

**Request:**
```http
GET /api/citas/paciente/1
```

**Response:**
```json
[
  {
    "id": 1,
    "fecha_hora": "2025-11-10T09:00:00.000Z",
    "estado": "programada",
    "motivo": "Consulta de rutina",
    "medico": {
      "usuario": {
        "nombre": "Dr. Juan Pérez"
      },
      "especialidad": {
        "nombre": "Cardiología"
      }
    },
    "consultorio": {
      "nombre": "Consultorio A"
    }
  }
]
```

### GET `/api/citas/medico/:medicoId`
Obtener citas de un médico específico.

**Request:**
```http
GET /api/citas/medico/1
```

**Response:**
```json
[
  {
    "id": 1,
    "fecha_hora": "2025-11-10T09:00:00.000Z",
    "estado": "programada",
    "motivo": "Consulta de rutina",
    "paciente": {
      "usuario": {
        "nombre": "María González",
        "telefono": "555-0003"
      }
    },
    "consultorio": {
      "nombre": "Consultorio A",
      "ubicacion": "Primer Piso - Ala Norte"
    }
  }
]
```

### POST `/api/citas`
Crear una nueva cita.

**Request:**
```http
POST /api/citas
Content-Type: application/json

{
  "medico_id": 1,
  "paciente_id": 1,
  "consultorio_id": 1,
  "fecha_hora": "2025-11-15T14:00:00.000Z",
  "motivo": "Consulta cardiológica",
  "notas": "Primera consulta del paciente"
}
```

**Response:**
```json
{
  "id": 52,
  "fecha_hora": "2025-11-15T14:00:00.000Z",
  "estado": "programada",
  "motivo": "Consulta cardiológica",
  "notas": "Primera consulta del paciente",
  "id_medico": 1,
  "id_paciente": 1,
  "id_consultorio": 1,
  "fecha_creacion": "2025-11-03T17:00:00.000Z",
  "medico": {
    "usuario": {
      "nombre": "Dr. Juan Pérez"
    }
  },
  "paciente": {
    "usuario": {
      "nombre": "María González"
    }
  },
  "consultorio": {
    "nombre": "Consultorio A"
  }
}
```

### PUT `/api/citas/:id`
Actualizar una cita existente.

**Request:**
```http
PUT /api/citas/52
Content-Type: application/json

{
  "fecha_hora": "2025-11-15T15:00:00.000Z",
  "motivo": "Consulta cardiológica - Seguimiento",
  "notas": "Cambio de horario solicitado por paciente"
}
```

**Response:**
```json
{
  "id": 52,
  "fecha_hora": "2025-11-15T15:00:00.000Z",
  "estado": "programada",
  "motivo": "Consulta cardiológica - Seguimiento",
  "notas": "Cambio de horario solicitado por paciente",
  "id_medico": 1,
  "id_paciente": 1,
  "id_consultorio": 1
}
```

### PATCH `/api/citas/:id/cancelar`
Cancelar una cita.

**Request:**
```http
PATCH /api/citas/52/cancelar
Content-Type: application/json

{
  "motivo_cancelacion": "Enfermedad del paciente"
}
```

**Response:**
```json
{
  "message": "Cita cancelada exitosamente",
  "cita": {
    "id": 52,
    "estado": "cancelada",
    "fecha_cancelacion": "2025-11-03T17:15:00.000Z",
    "motivo_cancelacion": "Enfermedad del paciente"
  }
}
```

### PATCH `/api/citas/:id/confirmar`
Confirmar una cita.

**Request:**
```http
PATCH /api/citas/1/confirmar
```

**Response:**
```json
{
  "message": "Cita confirmada exitosamente",
  "cita": {
    "id": 1,
    "estado": "confirmada",
    "fecha_confirmacion": "2025-11-03T17:20:00.000Z"
  }
}
```

### PATCH `/api/citas/:id/completar`
Marcar una cita como completada.

**Request:**
```http
PATCH /api/citas/1/completar
```

**Response:**
```json
{
  "message": "Cita completada exitosamente",
  "cita": {
    "id": 1,
    "estado": "completada",
    "fecha_completada": "2025-11-03T17:25:00.000Z"
  }
}
```

---

## 📄 Historiales de Pacientes

### GET `/api/historiales`
Obtener historiales con filtros.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `paciente_id`: Filtrar por paciente
- `medico_id`: Filtrar por médico
- `fecha_desde`: Filtrar desde fecha
- `fecha_hasta`: Filtrar hasta fecha

**Request:**
```http
GET /api/historiales?paciente_id=1&page=1&limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "fecha_consulta": "2025-11-01T10:00:00.000Z",
    "motivo_consulta": "Dolor en el pecho",
    "sintomas": "Dolor punzante en lado izquierdo del pecho",
    "diagnostico": "Hipertensión arterial leve",
    "tratamiento": "Dieta baja en sodio, ejercicio moderado",
    "observaciones": "Paciente colaborador, seguir evolución",
    "paciente_id": 1,
    "medico_id": 1,
    "fecha_creacion": "2025-11-01T10:30:00.000Z",
    "paciente": {
      "historia_clinica": "HC001",
      "usuario": {
        "nombre": "María",
        "apellido": "González"
      }
    },
    "medico": {
      "matricula": "MED123",
      "usuario": {
        "nombre": "Dr. Juan",
        "apellido": "Pérez"
      },
      "especialidad": {
        "nombre": "Cardiología"
      }
    }
  }
]
```

### POST `/api/historiales`
Crear un nuevo historial médico.

**Request:**
```http
POST /api/historiales
Content-Type: application/json

{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_consulta": "2025-11-03T16:00:00.000Z",
  "motivo_consulta": "Control de rutina",
  "sintomas": "Sin síntomas particulares",
  "diagnostico": "Estado general bueno",
  "tratamiento": "Continuar con medicación actual",
  "observaciones": "Paciente estable, próximo control en 3 meses"
}
```

**Response:**
```json
{
  "id": 46,
  "fecha_consulta": "2025-11-03T16:00:00.000Z",
  "motivo_consulta": "Control de rutina",
  "sintomas": "Sin síntomas particulares",
  "diagnostico": "Estado general bueno",
  "tratamiento": "Continuar con medicación actual",
  "observaciones": "Paciente estable, próximo control en 3 meses",
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_creacion": "2025-11-03T17:30:00.000Z"
}
```

---

## 📅 Disponibilidades de Médicos

### GET `/api/disponibilidades`
Obtener disponibilidades con filtros.

**Query Parameters:**
- `medico_id`: Filtrar por médico
- `dia_semana`: Filtrar por día (lunes, martes, etc.)
- `activa`: Filtrar por estado (true/false)

**Request:**
```http
GET /api/disponibilidades?medico_id=1&activa=true
```

**Response:**
```json
[
  {
    "id": 1,
    "dia_semana": "lunes",
    "hora_inicio": "08:00:00",
    "hora_fin": "12:00:00",
    "activa": true,
    "medico_id": 1,
    "fecha_creacion": "2025-11-03T10:00:00.000Z",
    "medico": {
      "matricula": "MED123",
      "usuario": {
        "nombre": "Dr. Juan",
        "apellido": "Pérez"
      },
      "especialidad": {
        "nombre": "Cardiología"
      }
    }
  },
  {
    "id": 2,
    "dia_semana": "miércoles",
    "hora_inicio": "14:00:00",
    "hora_fin": "18:00:00",
    "activa": true,
    "medico_id": 1,
    "fecha_creacion": "2025-11-03T10:00:00.000Z",
    "medico": {
      "matricula": "MED123",
      "usuario": {
        "nombre": "Dr. Juan",
        "apellido": "Pérez"
      },
      "especialidad": {
        "nombre": "Cardiología"
      }
    }
  }
]
```

### POST `/api/disponibilidades`
Crear nueva disponibilidad para un médico.

**Request:**
```http
POST /api/disponibilidades
Content-Type: application/json

{
  "medico_id": 1,
  "dia_semana": "viernes",
  "hora_inicio": "09:00:00",
  "hora_fin": "13:00:00"
}
```

**Response:**
```json
{
  "id": 41,
  "dia_semana": "viernes",
  "hora_inicio": "09:00:00",
  "hora_fin": "13:00:00",
  "activa": true,
  "medico_id": 1,
  "fecha_creacion": "2025-11-03T17:45:00.000Z"
}
```

---

## 📝 Recetas

### GET `/api/recetas`
Obtener recetas con filtros.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `paciente_id`: Filtrar por paciente
- `medico_id`: Filtrar por médico
- `vigente`: Filtrar por vigencia (true/false)

**Request:**
```http
GET /api/recetas?paciente_id=1&vigente=true&page=1
```

**Response:**
```json
[
  {
    "id": 1,
    "fecha_emision": "2025-11-01T10:30:00.000Z",
    "fecha_vencimiento": "2025-12-01T10:30:00.000Z",
    "instrucciones": "Tomar 1 comprimido cada 12 horas",
    "vigente": true,
    "historial_paciente_id": 1,
    "fecha_creacion": "2025-11-01T10:30:00.000Z",
    "historial": {
      "fecha_consulta": "2025-11-01T10:00:00.000Z",
      "diagnostico": "Hipertensión arterial leve",
      "paciente": {
        "historia_clinica": "HC001",
        "usuario": {
          "nombre": "María",
          "apellido": "González"
        }
      },
      "medico": {
        "matricula": "MED123",
        "usuario": {
          "nombre": "Dr. Juan",
          "apellido": "Pérez"
        },
        "especialidad": {
          "nombre": "Cardiología"
        }
      }
    },
    "medicamentos": [
      {
        "id": 1,
        "nombre": "Enalapril",
        "principio_activo": "Enalapril maleato",
        "dosis": "10mg",
        "RecetaMedicamento": {
          "cantidad": 30,
          "dosis_prescrita": "10mg cada 12 horas",
          "duracion_tratamiento": "30 días"
        }
      }
    ]
  }
]
```

### GET `/api/recetas/:id`
Obtener una receta específica.

**Request:**
```http
GET /api/recetas/1
```

**Response:**
```json
{
  "id": 1,
  "fecha_emision": "2025-11-01T10:30:00.000Z",
  "fecha_vencimiento": "2025-12-01T10:30:00.000Z",
  "instrucciones": "Tomar 1 comprimido cada 12 horas",
  "vigente": true,
  "historial_paciente_id": 1,
  "fecha_creacion": "2025-11-01T10:30:00.000Z",
  "historial": {
    "id": 1,
    "fecha_consulta": "2025-11-01T10:00:00.000Z",
    "motivo_consulta": "Dolor en el pecho",
    "diagnostico": "Hipertensión arterial leve",
    "tratamiento": "Dieta baja en sodio, ejercicio moderado",
    "paciente": {
      "id": 1,
      "historia_clinica": "HC001",
      "usuario": {
        "nombre": "María",
        "apellido": "González",
        "correo": "maria@email.com"
      }
    },
    "medico": {
      "id": 1,
      "matricula": "MED123",
      "usuario": {
        "nombre": "Dr. Juan",
        "apellido": "Pérez",
        "correo": "dr.perez@hospital.com"
      },
      "especialidad": {
        "nombre": "Cardiología"
      }
    }
  },
  "medicamentos": [
    {
      "id": 1,
      "nombre": "Enalapril",
      "principio_activo": "Enalapril maleato",
      "dosis": "10mg",
      "forma_farmaceutica": "Comprimido",
      "laboratorio": "Laboratorio ABC",
      "RecetaMedicamento": {
        "cantidad": 30,
        "dosis_prescrita": "10mg cada 12 horas",
        "duracion_tratamiento": "30 días"
      }
    }
  ]
}
```

### POST `/api/recetas`
Crear una nueva receta.

**Request:**
```http
POST /api/recetas
Content-Type: application/json

{
  "historial_paciente_id": 1,
  "fecha_vencimiento": "2025-12-15T00:00:00.000Z",
  "instrucciones": "Tomar con abundante agua, preferiblemente en ayunas",
  "medicamentos": [
    {
      "medicamento_id": 2,
      "cantidad": 20,
      "dosis_prescrita": "5mg cada 24 horas",
      "duracion_tratamiento": "20 días"
    }
  ]
}
```

**Response:**
```json
{
  "id": 31,
  "fecha_emision": "2025-11-03T18:00:00.000Z",
  "fecha_vencimiento": "2025-12-15T00:00:00.000Z",
  "instrucciones": "Tomar con abundante agua, preferiblemente en ayunas",
  "vigente": true,
  "historial_paciente_id": 1,
  "fecha_creacion": "2025-11-03T18:00:00.000Z",
  "medicamentos": [
    {
      "id": 2,
      "nombre": "Amlodipino",
      "principio_activo": "Amlodipino besilato",
      "RecetaMedicamento": {
        "cantidad": 20,
        "dosis_prescrita": "5mg cada 24 horas",
        "duracion_tratamiento": "20 días"
      }
    }
  ]
}
```

---

## 💊 Medicamentos

### GET `/api/medicamentos`
Obtener todos los medicamentos.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `search`: Buscar por nombre o principio activo
- `activo`: Filtrar por estado (true/false)

**Request:**
```http
GET /api/medicamentos?search=enalapril&activo=true
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Enalapril",
    "principio_activo": "Enalapril maleato",
    "dosis": "10mg",
    "forma_farmaceutica": "Comprimido",
    "laboratorio": "Laboratorio ABC",
    "codigo_barras": "7891234567890",
    "precio": 15.50,
    "stock": 100,
    "fecha_vencimiento": "2026-06-30",
    "activo": true,
    "fecha_creacion": "2025-11-03T10:00:00.000Z"
  }
]
```

### GET `/api/medicamentos/:id`
Obtener un medicamento específico.

**Request:**
```http
GET /api/medicamentos/1
```

**Response:**
```json
{
  "id": 1,
  "nombre": "Enalapril",
  "principio_activo": "Enalapril maleato",
  "dosis": "10mg",
  "forma_farmaceutica": "Comprimido",
  "laboratorio": "Laboratorio ABC",
  "codigo_barras": "7891234567890",
  "precio": 15.50,
  "stock": 100,
  "fecha_vencimiento": "2026-06-30",
  "activo": true,
  "fecha_creacion": "2025-11-03T10:00:00.000Z",
  "recetas": [
    {
      "id": 1,
      "fecha_emision": "2025-11-01T10:30:00.000Z",
      "vigente": true,
      "RecetaMedicamento": {
        "cantidad": 30,
        "dosis_prescrita": "10mg cada 12 horas"
      }
    }
  ]
}
```

### POST `/api/medicamentos`
Crear un nuevo medicamento.

**Request:**
```http
POST /api/medicamentos
Content-Type: application/json

{
  "nombre": "Losartán",
  "principio_activo": "Losartán potásico",
  "dosis": "50mg",
  "forma_farmaceutica": "Comprimido",
  "laboratorio": "Laboratorio XYZ",
  "codigo_barras": "7891234567891",
  "precio": 22.75,
  "stock": 50,
  "fecha_vencimiento": "2027-03-15"
}
```

**Response:**
```json
{
  "id": 29,
  "nombre": "Losartán",
  "principio_activo": "Losartán potásico",
  "dosis": "50mg",
  "forma_farmaceutica": "Comprimido",
  "laboratorio": "Laboratorio XYZ",
  "codigo_barras": "7891234567891",
  "precio": 22.75,
  "stock": 50,
  "fecha_vencimiento": "2027-03-15",
  "activo": true,
  "fecha_creacion": "2025-11-03T18:15:00.000Z"
}
```

---

## 💰 Pagos

### GET `/api/pagos`
Obtener pagos con filtros.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `paciente_id`: Filtrar por paciente
- `estado`: Filtrar por estado (`pendiente`, `pagado`, `cancelado`)
- `fecha_desde`: Filtrar desde fecha
- `fecha_hasta`: Filtrar hasta fecha

**Request:**
```http
GET /api/pagos?estado=pagado&page=1&limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "monto": 150.00,
    "fecha_vencimiento": "2025-11-15T00:00:00.000Z",
    "fecha_pago": "2025-11-02T14:30:00.000Z",
    "estado": "pagado",
    "metodo_pago": "tarjeta_credito",
    "descripcion": "Consulta cardiológica - Dr. Juan Pérez",
    "paciente_id": 1,
    "cita_id": 1,
    "fecha_creacion": "2025-11-01T11:00:00.000Z",
    "paciente": {
      "historia_clinica": "HC001",
      "usuario": {
        "nombre": "María",
        "apellido": "González",
        "correo": "maria@email.com"
      }
    },
    "cita": {
      "fecha_hora": "2025-11-01T10:00:00.000Z",
      "motivo": "Consulta de rutina"
    }
  }
]
```

### POST `/api/pagos`
Crear un nuevo pago.

**Request:**
```http
POST /api/pagos
Content-Type: application/json

{
  "paciente_id": 1,
  "cita_id": 52,
  "monto": 200.00,
  "fecha_vencimiento": "2025-11-20T00:00:00.000Z",
  "descripcion": "Consulta especializada - Seguimiento cardiológico",
  "metodo_pago": "efectivo"
}
```

**Response:**
```json
{
  "id": 41,
  "monto": 200.00,
  "fecha_vencimiento": "2025-11-20T00:00:00.000Z",
  "fecha_pago": null,
  "estado": "pendiente",
  "metodo_pago": "efectivo",
  "descripcion": "Consulta especializada - Seguimiento cardiológico",
  "paciente_id": 1,
  "cita_id": 52,
  "fecha_creacion": "2025-11-03T18:30:00.000Z"
}
```

---

## 🔔 Notificaciones

### GET `/api/notificaciones`
Obtener notificaciones con filtros.

**Query Parameters:**
- `page`: Número de página
- `limit`: Límite por página
- `usuario_id`: Filtrar por usuario
- `tipo`: Filtrar por tipo (`cita`, `receta`, `pago`, `sistema`)
- `leida`: Filtrar por estado (true/false)

**Request:**
```http
GET /api/notificaciones?usuario_id=1&leida=false&page=1
```

**Response:**
```json
[
  {
    "id": 1,
    "titulo": "Cita programada",
    "mensaje": "Su cita con Dr. Juan Pérez ha sido programada para el 10/11/2025 a las 09:00",
    "tipo": "cita",
    "leida": false,
    "fecha_envio": "2025-11-03T10:00:00.000Z",
    "usuario_id": 3,
    "fecha_creacion": "2025-11-03T10:00:00.000Z",
    "usuario": {
      "nombre": "María",
      "apellido": "González",
      "correo": "maria@email.com"
    }
  },
  {
    "id": 2,
    "titulo": "Receta vencida",
    "mensaje": "Su receta #1 vencerá en 7 días. Consulte a su médico para renovarla.",
    "tipo": "receta",
    "leida": false,
    "fecha_envio": "2025-11-03T12:00:00.000Z",
    "usuario_id": 3,
    "fecha_creacion": "2025-11-03T12:00:00.000Z",
    "usuario": {
      "nombre": "María",
      "apellido": "González",
      "correo": "maria@email.com"
    }
  }
]
```

### POST `/api/notificaciones`
Crear una nueva notificación.

**Request:**
```http
POST /api/notificaciones
Content-Type: application/json

{
  "usuario_id": 3,
  "titulo": "Recordatorio de pago",
  "mensaje": "Tiene un pago pendiente por $200.00. Vence el 20/11/2025.",
  "tipo": "pago"
}
```

**Response:**
```json
{
  "id": 71,
  "titulo": "Recordatorio de pago",
  "mensaje": "Tiene un pago pendiente por $200.00. Vence el 20/11/2025.",
  "tipo": "pago",
  "leida": false,
  "fecha_envio": "2025-11-03T18:45:00.000Z",
  "usuario_id": 3,
  "fecha_creacion": "2025-11-03T18:45:00.000Z"
}
```

### PATCH `/api/notificaciones/:id/marcar-leida`
Marcar una notificación como leída.

**Request:**
```http
PATCH /api/notificaciones/1/marcar-leida
```

**Response:**
```json
{
  "message": "Notificación marcada como leída",
  "notificacion": {
    "id": 1,
    "leida": true,
    "fecha_lectura": "2025-11-03T18:50:00.000Z"
  }
}
```

---

## 🚨 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Error en los datos enviados |
| `404` | Not Found - Recurso no encontrado |
| `500` | Internal Server Error - Error interno del servidor |

## 📝 Notas Importantes

1. **Fechas**: Todas las fechas están en formato ISO 8601 (UTC)
2. **Paginación**: Los endpoints que soportan paginación retornan arrays
3. **Filtros**: Los query parameters son opcionales
4. **Validaciones**: Campos requeridos varían según el endpoint
5. **Seguridad**: ⚠️ **Actualmente no hay autenticación implementada**

## 🔗 Enlaces Útiles

- **Repositorio**: [GitHub - efi_prog_api](https://github.com/benyhi/efi_prog_api)
- **Scripts de Base de Datos**: Ver `/scripts/SEEDING.md`
- **Tests**: Ejecutar `npm test` para probar endpoints
- **Postman Collection**: Importar `postman_collection.json` en Postman para probar la API

## 📮 Cómo usar con Postman

1. **Importar la colección**:
   - Abrir Postman
   - Clic en "Import" 
   - Seleccionar el archivo `postman_collection.json`
   
2. **Configurar variable de entorno**:
   - La colección usa la variable `{{base_url}}`
   - Por defecto: `http://localhost:3000/api`
   - Cambiar si usas otro puerto

3. **Poblar base de datos**:
   ```bash
   npm run seed:quick  # Para datos de prueba
   ```

4. **Iniciar servidor**:
   ```bash
   npm start
   ```

5. **Probar endpoints**: Los endpoints están organizados por categorías en la colección

---

**📍 Base URL de Desarrollo**: `http://localhost:3000/api`

**⚡ Credenciales de Prueba** (después de `npm run seed:quick`):
- **Admin**: admin@hospital.com / admin123
- **Médico**: dr.perez@hospital.com / medico123  
- **Paciente**: maria@email.com / paciente123