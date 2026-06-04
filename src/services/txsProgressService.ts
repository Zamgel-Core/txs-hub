// 📍 Ruta del archivo: src/services/txsProgressService.ts

import { supabase } from "@/src/lib/supabase";

export type TXSProgressSummary = {
  student_id: string;
  full_name: string;
  email: string;
  group_id: string | null;
  total_points: number;
  current_level: number;
  current_level_name: string;
  badge_label: string | null;
  color: string | null;
  next_level: number | null;
  next_level_name: string | null;
  next_level_min_points: number | null;
  points_to_next_level: number;
};

export type TXSPointSourceType =
  | "attendance"
  | "evaluation"
  | "recognition"
  | "payment"
  | "annual_fee"
  | "manual_adjustment"
  | "system_bonus";

export type TXSPointsLedgerItem = {
  id: string;
  student_id: string;
  source_type: TXSPointSourceType;
  source_id: string | null;
  points: number;
  reason: string;
  created_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function getStudentProgress(studentId: string) {
  const { data, error } = await supabase
    .from("student_txs_progress_summary")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as TXSProgressSummary | null;
}

export async function getCurrentStudentProgress() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user?.email) {
    return null;
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .ilike("email", user.email)
    .eq("is_deleted", false)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (!student?.id) {
    return null;
  }

  return getStudentProgress(student.id);
}

export async function getStudentPointsHistory(studentId: string, limit = 25) {
  const { data, error } = await supabase
    .from("student_points_ledger")
    .select(
      "id, student_id, source_type, source_id, points, reason, created_by, metadata, created_at",
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as TXSPointsLedgerItem[];
}

export async function getAdminStudentsProgress() {
  const { data, error } = await supabase
    .from("student_txs_progress_summary")
    .select("*")
    .order("total_points", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as TXSProgressSummary[];
}

export function getTXSProgressPercentage(progress: TXSProgressSummary | null) {
  if (!progress) return 0;

  if (!progress.next_level_min_points) {
    return 100;
  }

  const currentLevelStart = Math.max(
    progress.next_level_min_points - progress.points_to_next_level,
    0,
  );

  const nextLevelTarget = progress.next_level_min_points;

  if (nextLevelTarget <= 0) return 0;

  return Math.min(100, Math.round((currentLevelStart / nextLevelTarget) * 100));
}

export function getTXSSourceLabel(sourceType: TXSPointSourceType) {
  const labels: Record<TXSPointSourceType, string> = {
    attendance: "Asistencia",
    evaluation: "Evaluación",
    recognition: "Reconocimiento",
    payment: "Pago puntual",
    annual_fee: "Anualidad",
    manual_adjustment: "Ajuste manual",
    system_bonus: "Bonus TXS",
  };

  return labels[sourceType] || "Movimiento TXS";
}
