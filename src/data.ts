import { Alumno, Grupo, Pago, Evento, Aviso } from './types';

export const mockGrupos: Grupo[] = [
  { id: 'g1', nombre: 'Principiantes Lunes/Miércoles', instructor: 'Juan Pérez', horario: '19:00 - 20:30' },
  { id: 'g2', nombre: 'Intermedios Martes/Jueves', instructor: 'María González', horario: '20:00 - 21:30' },
  { id: 'g3', nombre: 'Avanzados Sábados', instructor: 'Carlos Ruiz', horario: '10:00 - 13:00' },
];

export const mockAlumnos: Alumno[] = [
  { id: 'a1', nombre: 'Alejandro Martínez', telefono: '8123456789', email: 'alex@example.com', grupoId: 'g1', plan: 'Mensualidad', estado: 'Pagado', fechaVencimiento: '2026-06-15', adeudo: 0, ultimoPagoDate: '2026-05-15' },
  { id: 'a2', nombre: 'Sofía Herrera', telefono: '8198765432', email: 'sofia@example.com', grupoId: 'g2', plan: 'Semanal', estado: 'Vencido', fechaVencimiento: '2026-05-20', adeudo: 150, ultimoPagoDate: '2026-05-13' },
  { id: 'a3', nombre: 'Luis Cantú', telefono: '8111223344', email: 'luis@example.com', grupoId: 'g1', plan: 'Quincenal', estado: 'Pendiente', fechaVencimiento: '2026-05-25', adeudo: 0, ultimoPagoDate: '2026-05-10' },
  { id: 'a4', nombre: 'Daniela Garza', telefono: '8144556677', email: 'dani@example.com', grupoId: 'g3', plan: 'Mensualidad', estado: 'Pagado', fechaVencimiento: '2026-06-01', adeudo: 0, ultimoPagoDate: '2026-05-01' },
  { id: 'a5', nombre: 'Roberto Soto', telefono: '8177889900', email: 'roberto@example.com', grupoId: 'g2', plan: 'Semanal', estado: 'Inactivo', fechaVencimiento: '2026-04-10', adeudo: 450, ultimoPagoDate: '2026-04-03' },
];

export const mockPagos: Pago[] = [
  { id: 'p1', alumnoId: 'a1', plan: 'Mensualidad', monto: 500, metodo: 'Transferencia', fecha: '2026-05-15T14:30:00Z' },
  { id: 'p2', alumnoId: 'a4', plan: 'Mensualidad', monto: 500, metodo: 'Mercado Pago', fecha: '2026-05-01T10:15:00Z' },
  { id: 'p3', alumnoId: 'a2', plan: 'Semanal', monto: 150, metodo: 'Efectivo', fecha: '2026-05-13T19:00:00Z' },
  { id: 'p4', alumnoId: 'a3', plan: 'Quincenal', monto: 280, metodo: 'Tarjeta', fecha: '2026-05-10T18:45:00Z' },
];

export const mockEventos: Evento[] = [
  { id: 'e1', titulo: 'Noche Tejana: Gran Cierre', fecha: '2026-06-20', lugar: 'Palapa Tecolotes', descripcion: 'El gran cierre de temporada de nuestra academia con bandas en vivo y exhibiciones de baile.' },
  { id: 'e2', titulo: 'Bootcamp Intensivo', fecha: '2026-07-05', lugar: 'Estudios TXS', descripcion: 'Aprende los pasos más avanzados en este bootcamp de un día.' },
];

export const mockAvisos: Aviso[] = [
  { id: 'av1', titulo: 'Cambio de horario grupo Intermedio', fecha: '2026-05-22', contenido: 'Les recordamos que la clase de este jueves se mueve a las 20:30.' },
  { id: 'av2', titulo: 'Pagos mensuales', fecha: '2026-05-20', contenido: 'Aprovechen el descuento del 10% si pagan su mensualidad antes del día 5 del próximo mes.' }
];
