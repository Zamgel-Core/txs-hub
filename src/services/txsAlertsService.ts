// 📍 Ruta del archivo: src/services/txsAlertsService.ts

import { supabase } from "@/src/lib/supabase";

export type TXSNearLevelStudent = {
  student_id: string;
  full_name: string;
  total_points: number;
  current_level_name: string;
  next_level_name: string | null;
  points_to_next_level: number;
};

export type TXSMissingEvaluationStudent = {
  id: string;
  full_name: string;
  group_id: string | null;
};

export type TXSMonthlyHighlightStudent = {
  student_id: string;
  full_name: string;
  monthly_points: number;
  current_level_name: string;
};

export type TXSIntelligentAlerts = {
  nearLevelUp: TXSNearLevelStudent[];
  missingWeeklyEvaluation: TXSMissingEvaluationStudent[];
  monthlyHighlights: TXSMonthlyHighlightStudent[];
};

function getCurrentWeekStart(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday.toISOString().slice(0, 10);
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getTXSIntelligentAlerts(): Promise<TXSIntelligentAlerts> {
  const weekStart = getCurrentWeekStart();
  const { start, end } = getCurrentMonthRange();

  const [
    progressResponse,
    studentsResponse,
    weeklyEvaluationsResponse,
    monthlyLedgerResponse,
  ] = await Promise.all([
    supabase
      .from("student_txs_progress_summary")
      .select(
        "student_id, full_name, total_points, current_level_name, next_level_name, points_to_next_level",
      ),

    supabase
      .from("students")
      .select("id, full_name, group_id")
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("full_name", { ascending: true }),

    supabase
      .from("student_evaluations")
      .select("student_id")
      .eq("week_start_date", weekStart),

    supabase
      .from("student_points_ledger")
      .select("student_id, points")
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  if (progressResponse.error) {
    throw new Error(progressResponse.error.message);
  }

  if (studentsResponse.error) {
    throw new Error(studentsResponse.error.message);
  }

  if (weeklyEvaluationsResponse.error) {
    throw new Error(weeklyEvaluationsResponse.error.message);
  }

  if (monthlyLedgerResponse.error) {
    throw new Error(monthlyLedgerResponse.error.message);
  }

  const progress = (progressResponse.data || []) as TXSNearLevelStudent[];

  const nearLevelUp = progress
    .filter(
      (student) =>
        Number(student.points_to_next_level || 0) > 0 &&
        Number(student.points_to_next_level || 0) <= 5,
    )
    .sort((a, b) => a.points_to_next_level - b.points_to_next_level)
    .slice(0, 8);

  const evaluatedStudentIds = new Set(
    (weeklyEvaluationsResponse.data || []).map((row) => row.student_id),
  );

  const missingWeeklyEvaluation = ((studentsResponse.data || []) as TXSMissingEvaluationStudent[])
    .filter((student) => !evaluatedStudentIds.has(student.id))
    .slice(0, 8);

  const monthlyPointsByStudent = new Map<string, number>();

  for (const item of monthlyLedgerResponse.data || []) {
    const currentPoints = monthlyPointsByStudent.get(item.student_id) || 0;
    monthlyPointsByStudent.set(
      item.student_id,
      currentPoints + Number(item.points || 0),
    );
  }

  const progressByStudent = new Map(
    progress.map((student) => [student.student_id, student]),
  );

  const monthlyHighlights = [...monthlyPointsByStudent.entries()]
    .map(([studentId, monthlyPoints]) => {
      const student = progressByStudent.get(studentId);

      if (!student) return null;

      return {
        student_id: studentId,
        full_name: student.full_name,
        monthly_points: monthlyPoints,
        current_level_name: student.current_level_name,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b?.monthly_points || 0) - Number(a?.monthly_points || 0))
    .slice(0, 5) as TXSMonthlyHighlightStudent[];

  return {
    nearLevelUp,
    missingWeeklyEvaluation,
    monthlyHighlights,
  };
}
