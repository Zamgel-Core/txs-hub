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

export type PaymentRecord = {
  id: string;
  student_id: string;
  payment_date: string;
  concept: string;
  method: PaymentMethod | string;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  students?: {
    full_name: string;
    email: string;
  } | null;
};

export type RegisterPaymentPayload = {
  studentId: string;
  membershipType: MembershipType;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  notes: string;
};

export type StudentPaymentPortalData = {
  student: {
    id: string;
    full_name: string;
    email: string;
    membership_status: MembershipStatus | null;
    membership_type: MembershipType | null;
    membership_end_date: string | null;
    last_payment_date: string | null;
  } | null;
  payments: PaymentRecord[];
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

export async function getRecentPayments(limit = 50) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, student_id, payment_date, concept, method, amount, status, notes, created_at, students(full_name, email)",
    )
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as PaymentRecord[];
}

export async function getPaymentsAdminData() {
  const [students, recentPayments] = await Promise.all([
    getPaymentStudents(),
    getRecentPayments(80),
  ]);

  return {
    students,
    recentPayments,
  };
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

export async function getStudentPaymentPortalData(
  email: string,
): Promise<StudentPaymentPortalData> {
  const { data: studentData, error: studentError } = await supabase
    .from("students")
    .select(
      "id, full_name, email, membership_status, membership_type, membership_end_date, last_payment_date",
    )
    .ilike("email", email)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (!studentData) {
    return {
      student: null,
      payments: [],
    };
  }

  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("id, student_id, payment_date, concept, method, amount, status, notes, created_at")
    .eq("student_id", studentData.id)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  return {
    student: studentData as StudentPaymentPortalData["student"],
    payments: (paymentsData || []) as PaymentRecord[],
  };
}
