const { sequelize } = require('../../config/database');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const CONFIG = {
  USUARIOS: 50,
  ESPECIALIDADES: 10,
  CONSULTORIOS: 15,
  MEDICOS: 20,
  PACIENTES: 100,
  MEDICAMENTOS: 30,
  DISPONIBILIDADES: 50,
  CITAS: 80,
  HISTORIALES: 60,
  RECETAS: 40,
  PAGOS: 70,
  NOTIFICACIONES: 90
};
try {
  faker.setLocale('es');
} catch (e) {
  console.log('ℹ️  Usando locale por defecto para Faker');
}
class DatabaseSeeder {
  constructor(config = CONFIG) {
    this.config = config;
    this.createdData = {
      usuarios: [],
      especialidades: [],
      consultorios: [],
      medicos: [],
      pacientes: [],
      medicamentos: [],
      disponibilidades: [],
      citas: [],
      historiales: [],
      recetas: [],
      pagos: [],
      notificaciones: []
    };
  }
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  getRandomDate(start = new Date(2023, 0, 1), end = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  getRandomTime() {
    const hour = Math.floor(Math.random() * 12) + 8; 
    const minute = Math.random() < 0.5 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}:00`;
  }
  async createUsuarios() {
    console.log(`🔄 Creando ${this.config.USUARIOS} usuarios...`);
    const roles = ['admin', 'médico', 'paciente'];
    const Usuario = sequelize.models.Usuario;
    for (let i = 0; i < this.config.USUARIOS; i++) {
      try {
        const plainPassword = faker.internet.password();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const usuario = await Usuario.create({
          nombre: faker.person.firstName(),
          apellido: faker.person.lastName(),
          correo: faker.internet.email(),
          contraseña: hashedPassword,
          rol: this.getRandomElement(roles),
          telefono: faker.phone.number(),
          fecha_nacimiento: this.getRandomDate(new Date(1950, 0, 1), new Date(2000, 11, 31)),
          direccion: faker.location.streetAddress(),
          fecha_registro: this.getRandomDate()
        });
        this.createdData.usuarios.push(usuario);
      } catch (error) {
        console.warn(`⚠️  Error creando usuario ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Usuarios creados: ${this.createdData.usuarios.length}`);
  }
  async createEspecialidades() {
    console.log(`🔄 Creando ${this.config.ESPECIALIDADES} especialidades...`);
    const especialidadesNombres = [
      'Cardiología', 'Dermatología', 'Neurología', 'Pediatría', 'Ginecología',
      'Traumatología', 'Oftalmología', 'Otorrinolaringología', 'Psiquiatría', 'Urología',
      'Endocrinología', 'Gastroenterología', 'Neumología', 'Oncología', 'Reumatología'
    ];
    const Especialidad = sequelize.models.Especialidad;
    for (let i = 0; i < Math.min(this.config.ESPECIALIDADES, especialidadesNombres.length); i++) {
      try {
        const especialidad = await Especialidad.create({
          nombre: especialidadesNombres[i],
          descripcion: faker.lorem.paragraph()
        });
        this.createdData.especialidades.push(especialidad);
      } catch (error) {
        console.warn(`⚠️  Error creando especialidad ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Especialidades creadas: ${this.createdData.especialidades.length}`);
  }
  async createConsultorios() {
    console.log(`🔄 Creando ${this.config.CONSULTORIOS} consultorios...`);
    const Consultorio = sequelize.models.Consultorio;
    for (let i = 0; i < this.config.CONSULTORIOS; i++) {
      try {
        const consultorio = await Consultorio.create({
          numero: (i + 1).toString().padStart(3, '0'),
          piso: Math.floor(Math.random() * 5) + 1,
          ubicacion: `${faker.location.street()} - Piso ${Math.floor(Math.random() * 5) + 1}`,
          capacidad: Math.floor(Math.random() * 8) + 3,
          equipamiento: faker.lorem.words(5),
          esta_disponible: Math.random() > 0.2 
        });
        this.createdData.consultorios.push(consultorio);
      } catch (error) {
        console.warn(`⚠️  Error creando consultorio ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Consultorios creados: ${this.createdData.consultorios.length}`);
  }
  async createMedicos() {
    console.log(`🔄 Creando ${this.config.MEDICOS} médicos...`);
    const Medico = sequelize.models.Medico;
    const usuariosMedicos = this.createdData.usuarios.filter(u => u.rol === 'médico');
    for (let i = 0; i < Math.min(this.config.MEDICOS, usuariosMedicos.length, this.createdData.especialidades.length); i++) {
      try {
        const especialidad = this.getRandomElement(this.createdData.especialidades);
        const usuario = usuariosMedicos[i] || this.getRandomElement(usuariosMedicos);
        const medico = await Medico.create({
          nombre: usuario.nombre + ' ' + usuario.apellido,
          matricula: faker.number.int({ min: 10000, max: 99999 }).toString(),
          id_usuario: usuario.id,
          id_especialidad: especialidad.id,
          horario_inicio: this.getRandomTime(),
          horario_fin: this.getRandomTime(),
          dias_trabajo: JSON.stringify(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].slice(0, Math.floor(Math.random() * 3) + 3)),
          estado: Math.random() > 0.1, 
          creado: this.getRandomDate(),
          actualizado: new Date()
        });
        this.createdData.medicos.push(medico);
      } catch (error) {
        console.warn(`⚠️  Error creando médico ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Médicos creados: ${this.createdData.medicos.length}`);
  }
  async createPacientes() {
    console.log(`🔄 Creando ${this.config.PACIENTES} pacientes...`);
    const Paciente = sequelize.models.Paciente;
    const usuariosPacientes = this.createdData.usuarios.filter(u => u.rol === 'paciente');
    for (let i = 0; i < Math.min(this.config.PACIENTES, usuariosPacientes.length * 2); i++) {
      try {
        const usuario = this.getRandomElement(usuariosPacientes);
        const paciente = await Paciente.create({
          numero_historia_clinica: faker.number.int({ min: 100000, max: 999999 }).toString(),
          fecha_nacimiento: this.getRandomDate(new Date(1940, 0, 1), new Date(2020, 11, 31)),
          genero: this.getRandomElement(['Masculino', 'Femenino', 'Otro']),
          telefono: faker.phone.number(),
          direccion: faker.location.streetAddress(),
          grupo_sanguineo: this.getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
          alergias: Math.random() > 0.7 ? faker.lorem.words(3) : null,
          antecedentes: Math.random() > 0.6 ? faker.lorem.sentence() : null,
          id_usuario: usuario.id,
          creado: this.getRandomDate(),
          actualizado: new Date()
        });
        this.createdData.pacientes.push(paciente);
      } catch (error) {
        console.warn(`⚠️  Error creando paciente ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Pacientes creados: ${this.createdData.pacientes.length}`);
  }
  async createMedicamentos() {
    console.log(`🔄 Creando ${this.config.MEDICAMENTOS} medicamentos...`);
    const Medicamento = sequelize.models.Medicamento;
    const medicamentosNombres = [
      'Paracetamol', 'Ibuprofeno', 'Aspirina', 'Amoxicilina', 'Omeprazol',
      'Metformina', 'Atorvastatina', 'Losartán', 'Diclofenaco', 'Cetirizina',
      'Captopril', 'Ranitidina', 'Clonazepam', 'Fluoxetina', 'Prednisona'
    ];
    for (let i = 0; i < this.config.MEDICAMENTOS; i++) {
      try {
        const medicamento = await Medicamento.create({
          nombre: medicamentosNombres[i % medicamentosNombres.length] + (i >= medicamentosNombres.length ? ` ${Math.floor(i / medicamentosNombres.length) + 1}` : ''),
          descripcion: faker.lorem.sentence(),
          dosis: `${Math.floor(Math.random() * 500) + 50}mg`,
          presentacion: this.getRandomElement(['Tabletas', 'Cápsulas', 'Jarabe', 'Inyectable', 'Crema'])
        });
        this.createdData.medicamentos.push(medicamento);
      } catch (error) {
        console.warn(`⚠️  Error creando medicamento ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Medicamentos creados: ${this.createdData.medicamentos.length}`);
  }
  async createDisponibilidades() {
    console.log(`🔄 Creando ${this.config.DISPONIBILIDADES} disponibilidades...`);
    const DisponibilidadMedico = sequelize.models.DisponibilidadMedico;
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    for (let i = 0; i < this.config.DISPONIBILIDADES; i++) {
      try {
        const medico = this.getRandomElement(this.createdData.medicos);
        const disponibilidad = await DisponibilidadMedico.create({
          id_medico: medico.id,
          dia_semana: this.getRandomElement(diasSemana),
          hora_inicio: this.getRandomTime(),
          hora_fin: this.getRandomTime()
        });
        this.createdData.disponibilidades.push(disponibilidad);
      } catch (error) {
        console.warn(`⚠️  Error creando disponibilidad ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Disponibilidades creadas: ${this.createdData.disponibilidades.length}`);
  }
  async createCitas() {
    console.log(`🔄 Creando ${this.config.CITAS} citas...`);
    const Cita = sequelize.models.Cita;
    const estados = ['programada', 'completada', 'cancelada', 'no_asistio'];
    for (let i = 0; i < this.config.CITAS; i++) {
      try {
        const medico = this.getRandomElement(this.createdData.medicos);
        const paciente = this.getRandomElement(this.createdData.pacientes);
        const consultorio = this.getRandomElement(this.createdData.consultorios);
        const cita = await Cita.create({
          id_medico: medico.id,
          id_paciente: paciente.id,
          id_consultorio: consultorio.id,
          fecha: this.getRandomDate(),
          estado: this.getRandomElement(estados),
          motivo: faker.lorem.sentence(),
          notas_medico: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
          costo: faker.number.int({ min: 500, max: 3000 }),
          creado: this.getRandomDate(),
          actualizado: new Date()
        });
        this.createdData.citas.push(cita);
      } catch (error) {
        console.warn(`⚠️  Error creando cita ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Citas creadas: ${this.createdData.citas.length}`);
  }
  async createHistoriales() {
    console.log(`🔄 Creando ${this.config.HISTORIALES} historiales...`);
    const HistorialPaciente = sequelize.models.HistorialPaciente;
    const tipos = ['consulta', 'diagnostico', 'tratamiento', 'seguimiento'];
    for (let i = 0; i < this.config.HISTORIALES; i++) {
      try {
        const paciente = this.getRandomElement(this.createdData.pacientes);
        const medico = this.getRandomElement(this.createdData.medicos);
        const historial = await HistorialPaciente.create({
          id_paciente: paciente.id,
          id_medico: medico.id,
          fecha: this.getRandomDate(),
          descripcion: faker.lorem.paragraph(),
          tipo: this.getRandomElement(tipos)
        });
        this.createdData.historiales.push(historial);
      } catch (error) {
        console.warn(`⚠️  Error creando historial ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Historiales creados: ${this.createdData.historiales.length}`);
  }
  async createRecetas() {
    console.log(`🔄 Creando ${this.config.RECETAS} recetas...`);
    const Receta = sequelize.models.Receta;
    for (let i = 0; i < this.config.RECETAS; i++) {
      try {
        const cita = this.getRandomElement(this.createdData.citas);
        const historial = this.getRandomElement(this.createdData.historiales);
        const receta = await Receta.create({
          id_cita: cita.id,
          id_medico: cita.id_medico,
          id_paciente: cita.id_paciente,
          fecha: this.getRandomDate(),
          indicaciones: faker.lorem.paragraph(),
          historial_paciente_id: historial.id
        });
        this.createdData.recetas.push(receta);
      } catch (error) {
        console.warn(`⚠️  Error creando receta ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Recetas creadas: ${this.createdData.recetas.length}`);
  }
  async createPagos() {
    console.log(`🔄 Creando ${this.config.PAGOS} pagos...`);
    const Pago = sequelize.models.Pago;
    const metodos = ['efectivo', 'tarjeta', 'transferencia'];
    const estados = ['pendiente', 'pagado', 'cancelado'];
    for (let i = 0; i < this.config.PAGOS; i++) {
      try {
        const cita = this.getRandomElement(this.createdData.citas);
        const pago = await Pago.create({
          id_cita: cita.id,
          monto: faker.number.int({ min: 500, max: 5000 }),
          metodo: this.getRandomElement(metodos),
          estado: this.getRandomElement(estados),
          fecha: this.getRandomDate()
        });
        this.createdData.pagos.push(pago);
      } catch (error) {
        console.warn(`⚠️  Error creando pago ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Pagos creados: ${this.createdData.pagos.length}`);
  }
  async createNotificaciones() {
    console.log(`🔄 Creando ${this.config.NOTIFICACIONES} notificaciones...`);
    const Notificacion = sequelize.models.Notificacion;
    const tipos = ['recordatorio', 'cancelación', 'nueva_cita'];
    for (let i = 0; i < this.config.NOTIFICACIONES; i++) {
      try {
        const usuario = this.getRandomElement(this.createdData.usuarios);
        const notificacion = await Notificacion.create({
          id_usuario: usuario.id,
          mensaje: faker.lorem.sentence(),
          tipo: this.getRandomElement(tipos),
          leido: Math.random() > 0.3, 
          fecha_envio: this.getRandomDate()
        });
        this.createdData.notificaciones.push(notificacion);
      } catch (error) {
        console.warn(`⚠️  Error creando notificación ${i + 1}:`, error.message);
      }
    }
    console.log(`✅ Notificaciones creadas: ${this.createdData.notificaciones.length}`);
  }
  async createRecetaMedicamentos() {
    console.log(`🔄 Creando relaciones receta-medicamentos...`);
    const RecetaMedicamento = sequelize.models.RecetaMedicamento;
    let count = 0;
    for (const receta of this.createdData.recetas) {
      try {
        const numMedicamentos = Math.floor(Math.random() * 3) + 1; 
        for (let i = 0; i < numMedicamentos; i++) {
          const medicamento = this.getRandomElement(this.createdData.medicamentos);
          await RecetaMedicamento.create({
            id_receta: receta.id,
            id_medicamento: medicamento.id,
            cantidad: Math.floor(Math.random() * 30) + 1,
            frecuencia: this.getRandomElement(['Cada 8 horas', 'Cada 12 horas', 'Una vez al día', 'Dos veces al día']),
            duracion: `${Math.floor(Math.random() * 30) + 1} días`
          });
          count++;
        }
      } catch (error) {
        console.warn(`⚠️  Error creando receta-medicamento:`, error.message);
      }
    }
    console.log(`✅ Relaciones receta-medicamentos creadas: ${count}`);
  }
  async run() {
    console.log('🚀 ========================================');
    console.log('🚀 INICIANDO POBLAR BASE DE DATOS');
    console.log('🚀 ========================================');
    console.log(`📊 Configuración actual:`, this.config);
    console.log('🚀 ========================================\n');
    try {
      await sequelize.sync({ force: false });
      console.log('✅ Base de datos sincronizada\n');
      await this.createUsuarios();
      await this.createEspecialidades();
      await this.createConsultorios();
      await this.createMedicos();
      await this.createPacientes();
      await this.createMedicamentos();
      await this.createDisponibilidades();
      await this.createCitas();
      await this.createHistoriales();
      await this.createRecetas();
      await this.createPagos();
      await this.createNotificaciones();
      await this.createRecetaMedicamentos();
      console.log('\n🎉 ========================================');
      console.log('🎉 POBLADO COMPLETADO EXITOSAMENTE');
      console.log('🎉 ========================================');
      console.log('📈 RESUMEN FINAL:');
      console.log(`   👥 Usuarios: ${this.createdData.usuarios.length}`);
      console.log(`   🏥 Especialidades: ${this.createdData.especialidades.length}`);
      console.log(`   🏢 Consultorios: ${this.createdData.consultorios.length}`);
      console.log(`   👨‍⚕️ Médicos: ${this.createdData.medicos.length}`);
      console.log(`   🤒 Pacientes: ${this.createdData.pacientes.length}`);
      console.log(`   💊 Medicamentos: ${this.createdData.medicamentos.length}`);
      console.log(`   📅 Disponibilidades: ${this.createdData.disponibilidades.length}`);
      console.log(`   📋 Citas: ${this.createdData.citas.length}`);
      console.log(`   📄 Historiales: ${this.createdData.historiales.length}`);
      console.log(`   📝 Recetas: ${this.createdData.recetas.length}`);
      console.log(`   💰 Pagos: ${this.createdData.pagos.length}`);
      console.log(`   🔔 Notificaciones: ${this.createdData.notificaciones.length}`);
      console.log('🎉 ========================================\n');
    } catch (error) {
      console.error('❌ Error durante el poblado:', error);
      throw error;
    }
  }
}
async function main() {
  const customConfig = {
    USUARIOS: process.env.SEED_USUARIOS || 30,
    ESPECIALIDADES: process.env.SEED_ESPECIALIDADES || 8,
    CONSULTORIOS: process.env.SEED_CONSULTORIOS || 12,
    MEDICOS: process.env.SEED_MEDICOS || 15,
    PACIENTES: process.env.SEED_PACIENTES || 60,
    MEDICAMENTOS: process.env.SEED_MEDICAMENTOS || 25,
    DISPONIBILIDADES: process.env.SEED_DISPONIBILIDADES || 40,
    CITAS: process.env.SEED_CITAS || 50,
    HISTORIALES: process.env.SEED_HISTORIALES || 45,
    RECETAS: process.env.SEED_RECETAS || 30,
    PAGOS: process.env.SEED_PAGOS || 40,
    NOTIFICACIONES: process.env.SEED_NOTIFICACIONES || 70
  };
  const seeder = new DatabaseSeeder(customConfig);
  try {
    await seeder.run();
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  }
}
if (require.main === module) {
  main();
}
module.exports = { DatabaseSeeder, CONFIG };