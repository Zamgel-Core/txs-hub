// 📍 Ruta del archivo: src/services/dashboardService.ts

import { supabase } from "@/src/lib/supabase";

export type DashboardStudent = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  group_level: string;
  is_active: boolean;
  created_at: string;
  membership_status: "activa" | "vencida" | "pendiente";
  membership_type: "semanal" | "quincenal" | "mensual" | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  last_payment_date: string | null;
};

export type DashboardPayment = {
  id: string;
  student_id: string;
  payment_date: string;
  concept: string;
  method: string;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export async function getDashboardData() {
  const [studentsResponse, paymentsResponse] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, email, phone, group_level, is_active, created_at, membership_status, membership_type, membership_start_date, membership_end_date, last_payment_date",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("payments")
      .select(
        "id, student_id, payment_date, concept, method, amount, status, notes, created_at",
      )
      .order("payment_date", { ascending: false })
      .limit(50),
  ]);

  if (studentsResponse.error) {
    throw new Error(studentsResponse.error.message);
  }

  if (paymentsResponse.error) {
    throw new Error(paymentsResponse.error.message);
  }

  return {
    students: (studentsResponse.data || []) as DashboardStudent[],
    payments: (paymentsResponse.data || []) as DashboardPayment[],
  };
}
