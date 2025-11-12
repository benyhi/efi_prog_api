#!/usr/bin/env node
const { sequelize } = require('../../config/database');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
class QuickSeeder {
  async run() {
    console.log('⚡ POBLADO RÁPIDO - DATOS MÍNIMOS PARA DESARROLLO');
    console.log('=================================================\n');
    try {
      await sequelize.sync({ force: false });
      const Usuario = sequelize.models.Usuario;
      // Hash known passwords for the quick-seed users
      const adminPass = await bcrypt.hash('admin123', 10);
      const medicoPass = await bcrypt.hash('medico123', 10);
      const pacientePass = await bcrypt.hash('paciente123', 10);

      const usuarios = await Usuario.bulkCreate([
        {
          nombre: 'Admin',
          apellido: 'Sistema',
          correo: 'admin@hospital.com',
          contraseña: adminPass,
          rol: 'admin',
          telefono: '555-0001',
          direccion: 'Dirección Admin',
          fecha_nacimiento: new Date('1980-01-01'),
          fecha_registro: new Date()
        },
        {
          nombre: 'Dr. Juan',
          apellido: 'Pérez',
          correo: 'dr.perez@hospital.com',
          contraseña: medicoPass,
          rol: 'médico',
          telefono: '555-0002',
          direccion: 'Dirección Médico',
          fecha_nacimiento: new Date('1975-05-15'),
          fecha_registro: new Date()
        },
        {
          nombre: 'María',
          apellido: 'González',
          correo: 'maria@email.com',
          contraseña: pacientePass,
          rol: 'paciente',
          telefono: '555-0003',
          direccion: 'Dirección Paciente',
          fecha_nacimiento: new Date('1990-08-20'),
          fecha_registro: new Date()
        }
      ], { ignoreDuplicates: true });
      const Especialidad = sequelize.models.Especialidad;
      const especialidades = await Especialidad.bulkCreate([
        { nombre: 'Medicina General', descripcion: 'Atención médica general' },
        { nombre: 'Cardiología', descripcion: 'Especialidad del corazón' },
        { nombre: 'Pediatría', descripcion: 'Atención infantil' }
      ], { ignoreDuplicates: true });
      const Consultorio = sequelize.models.Consultorio;
      const consultorios = await Consultorio.bulkCreate([
        { numero: '001', piso: 1, ubicacion: 'Planta Baja - Ala Norte', capacidad: 4, equipamiento: 'Básico', esta_disponible: true },
        { numero: '002', piso: 1, ubicacion: 'Planta Baja - Ala Sur', capacidad: 6, equipamiento: 'Completo', esta_disponible: true },
        { numero: '101', piso: 2, ubicacion: 'Primer Piso - Centro', capacidad: 8, equipamiento: 'Avanzado', esta_disponible: true }
      ], { ignoreDuplicates: true });
      const Medico = sequelize.models.Medico;
      const medicos = await Medico.bulkCreate([
        {
          nombre: 'Dr. Juan Pérez',
          matricula: '12345',
          id_usuario: usuarios[1].id,
          id_especialidad: especialidades[0].id,
          horario_inicio: '08:00:00',
          horario_fin: '16:00:00',
          dias_trabajo: JSON.stringify(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']),
          estado: true,
          creado: new Date(),
          actualizado: new Date()
        }
      ], { ignoreDuplicates: true });
      const Paciente = sequelize.models.Paciente;
      const pacientes = await Paciente.bulkCreate([
        {
          numero_historia_clinica: '000001',
          fecha_nacimiento: new Date('1990-08-20'),
          genero: 'Femenino',
          telefono: '555-0003',
          direccion: 'Dirección Paciente',
          grupo_sanguineo: 'O+',
          alergias: null,
          antecedentes: null,
          id_usuario: usuarios[2].id,
          creado: new Date(),
          actualizado: new Date()
        }
      ], { ignoreDuplicates: true });
      const Medicamento = sequelize.models.Medicamento;
      const medicamentos = await Medicamento.bulkCreate([
        { nombre: 'Paracetamol', descripcion: 'Analgésico y antipirético', dosis: '500mg', presentacion: 'Tabletas' },
        { nombre: 'Ibuprofeno', descripcion: 'Antiinflamatorio', dosis: '400mg', presentacion: 'Tabletas' },
        { nombre: 'Amoxicilina', descripcion: 'Antibiótico', dosis: '250mg', presentacion: 'Cápsulas' }
      ], { ignoreDuplicates: true });
      const Cita = sequelize.models.Cita;
      const citas = await Cita.bulkCreate([
        {
          id_medico: medicos[0].id,
          id_paciente: pacientes[0].id,
          id_consultorio: consultorios[0].id,
          fecha: new Date(Date.now() + 24 * 60 * 60 * 1000), 
          estado: 'programada',
          motivo: 'Consulta general',
          notas_medico: null,
          costo: 1500,
          creado: new Date(),
          actualizado: new Date()
        }
      ], { ignoreDuplicates: true });
      console.log('✅ DATOS MÍNIMOS CREADOS EXITOSAMENTE');
      console.log('=====================================');
      console.log('👥 Usuarios: 3 (admin, médico, paciente)');
      console.log('🏥 Especialidades: 3');
      console.log('🏢 Consultorios: 3');
      console.log('👨‍⚕️ Médicos: 1');
      console.log('🤒 Pacientes: 1');
      console.log('💊 Medicamentos: 3');
      console.log('📋 Citas: 1');
      console.log('=====================================');
      console.log('🎯 CREDENCIALES DE PRUEBA:');
      console.log('   Admin: admin@hospital.com / admin123');
      console.log('   Médico: dr.perez@hospital.com / medico123');
      console.log('   Paciente: maria@email.com / paciente123');
      console.log('=====================================\n');
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}
async function main() {
  const seeder = new QuickSeeder();
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
module.exports = QuickSeeder;