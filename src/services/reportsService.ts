// 📍 Ruta del archivo: src/services/reportsService.ts

import { supabase } from "@/src/lib/supabase";

export type ReportStudent = {
  id: string;
  created_at: string;
  is_active: boolean;
  membership_status: "activa" | "vencida" | "pendiente";
};

export type ReportPayment = {
  id: string;
  amount: number;
  payment_date: string;
  status: string;
};

export type ReportAttendance = {
  id: string;
  attendance_date: string;
  status: "presente" | "falta" | "retardo";
};

export async function getReportsData() {
  const [studentsResponse, paymentsResponse, attendanceResponse] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, created_at, is_active, membership_status"),

      supabase
        .from("payments")
        .select("id, amount, payment_date, status")
        .order("payment_date", { ascending: true }),

      supabase
        .from("attendance")
        .select("id, attendance_date, status")
        .order("attendance_date", { ascending: true }),
    ]);

  if (studentsResponse.error) throw new Error(studentsResponse.error.message);
  if (paymentsResponse.error) throw new Error(paymentsResponse.error.message);
  if (attendanceResponse.error)
    throw new Error(attendanceResponse.error.message);

  return {
    students: (studentsResponse.data || []) as ReportStudent[],
    payments: (paymentsResponse.data || []) as ReportPayment[],
    attendance: (attendanceResponse.data || []) as ReportAttendance[],
  };
}
