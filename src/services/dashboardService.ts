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
      .limit(1000),
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

export type TXSTopStudent = {
  student_id: string;
  full_name: string;
  total_points: number;
  current_level: number;
  current_level_name: string;
  badge_label: string | null;
};

export type TXSMonthlyStudent = {
  student_id: string;
  full_name: string;
  monthly_points: number;
  current_level_name: string;
};

export type TXSDashboardStats = {
  topStudents: TXSTopStudent[];
  studentOfMonth: TXSMonthlyStudent | null;
  monthlyTopStudents: TXSMonthlyStudent[];
  totalGeneratedPoints: number;
  monthlyGeneratedPoints: number;
};

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getTXSDashboardStats(): Promise<TXSDashboardStats> {
  const { start, end } = getCurrentMonthRange();

  const [progressResponse, monthlyLedgerResponse] = await Promise.all([
    supabase
      .from("student_txs_progress_summary")
      .select(
        "student_id, full_name, total_points, current_level, current_level_name, badge_label",
      )
      .order("total_points", { ascending: false })
      .limit(10),

    supabase
      .from("student_points_ledger")
      .select("student_id, points, created_at")
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  if (progressResponse.error) {
    throw new Error(progressResponse.error.message);
  }

  if (monthlyLedgerResponse.error) {
    throw new Error(monthlyLedgerResponse.error.message);
  }

  const topStudents = (progressResponse.data || []) as TXSTopStudent[];
  const progressByStudent = new Map(
    topStudents.map((student) => [student.student_id, student]),
  );
  const monthlyPointsByStudent = new Map<string, number>();

  for (const item of monthlyLedgerResponse.data || []) {
    monthlyPointsByStudent.set(
      item.student_id,
      (monthlyPointsByStudent.get(item.student_id) || 0) +
        Number(item.points || 0),
    );
  }

  const missingStudentIds = [...monthlyPointsByStudent.keys()].filter(
    (studentId) => !progressByStudent.has(studentId),
  );

  if (missingStudentIds.length > 0) {
    const { data, error } = await supabase
      .from("student_txs_progress_summary")
      .select(
        "student_id, full_name, total_points, current_level, current_level_name, badge_label",
      )
      .in("student_id", missingStudentIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const student of data || []) {
      progressByStudent.set(student.student_id, student as TXSTopStudent);
    }
  }

  const monthlyTopStudents = [...monthlyPointsByStudent.entries()]
    .map(([studentId, monthlyPoints]) => {
      const student = progressByStudent.get(studentId);

      return {
        student_id: studentId,
        full_name: student?.full_name || "Alumno sin nombre",
        monthly_points: monthlyPoints,
        current_level_name: student?.current_level_name || "Nivel 1",
      };
    })
    .sort((a, b) => b.monthly_points - a.monthly_points)
    .slice(0, 10);

  return {
    topStudents,
    studentOfMonth: monthlyTopStudents[0] || null,
    monthlyTopStudents,
    totalGeneratedPoints: topStudents.reduce(
      (sum, student) => sum + Number(student.total_points || 0),
      0,
    ),
    monthlyGeneratedPoints: [...monthlyPointsByStudent.values()].reduce(
      (sum, points) => sum + points,
      0,
    ),
  };
}
