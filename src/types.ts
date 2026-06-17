export type Role = "admin" | "moderator" | "staff" | "alumno";

export type EstadoAlumno = "Pagado" | "Pendiente" | "Vencido" | "Inactivo";

export interface Alumno {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  grupoId: string;
  plan: string;
  estado: EstadoAlumno;
  fechaVencimiento: string;
  ultimoPagoDate?: string;
  adeudo: number;
}

export interface Grupo {
  id: string;
  nombre: string;
  instructor: string;
  horario: string;
}

export interface Pago {
  id: string;
  alumnoId: string;
  plan: string;
  monto: number;
  metodo: "Efectivo" | "Transferencia" | "Mercado Pago" | "Tarjeta";
  fecha: string;
}

export interface Asistencia {
  id: string;
  alumnoId: string;
  grupoId: string;
  fecha: string;
  estado: "Presente" | "Ausente" | "Justificado";
}

export interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  lugar: string;
  imagen?: string;
  descripcion: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  fecha: string;
  contenido: string;
}
