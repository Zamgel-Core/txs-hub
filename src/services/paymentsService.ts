// 📍 Ruta del archivo: src/services/paymentsService.ts

import { supabase } from "@/src/lib/supabase";

export type MembershipStatus = "activa" | "vencida" | "pendiente";
export type MembershipType = "semanal" | "quincenal" | "mensual";
export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";

export type PaymentStudent = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  membership_status: MembershipStatus;
  membership_type: MembershipType | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  last_payment_date: string | null;
  payment_notes: string | null;
  is_active: boolean;
};

export type RegisterPaymentPayload = {
  studentId: string;
  membershipType: MembershipType;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  notes: string;
};

export async function getPaymentStudents() {
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, membership_status, membership_type, membership_start_date, membership_end_date, last_payment_date, payment_notes, is_active",
    )
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as PaymentStudent[];
}

export async function registerAdminPayment(payload: RegisterPaymentPayload) {
  const { error } = await supabase.rpc("register_admin_payment", {
    p_student_id: payload.studentId,
    p_membership_type: payload.membershipType,
    p_method: payload.method,
    p_amount: payload.amount,
    p_payment_date: payload.paymentDate,
    p_notes: payload.notes || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
