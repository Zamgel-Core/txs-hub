import { supabase } from "@/src/lib/supabase";

export type EvaluationGroup = {
  id: string;
  name: string;
  instructor: string | null;
  schedule: string | null;
  level: string | null;
  is_active: boolean;
  sort_order: number | null;
};

export type EvaluationStudent = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  group_id: string | null;
  membership_type: string | null;
  membership_status: string | null;
  annual_fee_status: string | null;
  annual_fee_paid_at: string | null;
  annual_fee_expires_at: string | null;
  annual_fee_amount: number | null;
  is_active: boolean;
  attendance_percentage: number | null;
  attendance_present: number;
  attendance_total: number;
};

export type StudentEvaluation = {
  id: string;
  student_id: string;
  group_id: string | null;
  week_start_date: string;
  technique_score: number | null;
  discipline_score: number | null;
  attitude_score: number | null;
  average_score: number | null;
  evaluation_status: "completed" | "not_applicable";
  na_reason: string | null;
  comments: string | null;
  recommendations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveEvaluationRow = {
  student_id: string;
  group_id: string | null;
  week_start_date: string;
  evaluation_status: "completed" | "not_applicable";
  technique_score: number | null;
  discipline_score: number | null;
  attitude_score: number | null;
  average_score: number | null;
  na_reason?: string | null;
  comments?: string | null;
  recommendations?: string | null;
};

export type StudentEvaluationWithStudent = StudentEvaluation & {
  students?: {
    full_name: string;
    email: string;
  } | null;
  groups?: {
    name: string;
    schedule: string | null;
    level: string | null;
  } | null;
};

type AttendanceSummary = {
  percentage: number | null;
  present: number;
  total: number;
};

export function getCurrentWeekStart(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday.toISOString().slice(0, 10);
}

export function calculateAverageScore(
  techniqueScore: number,
  disciplineScore: number,
  attitudeScore: number,
) {
  return Number(
    ((techniqueScore + disciplineScore + attitudeScore) / 3).toFixed(1),
  );
}

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

async function getAttendanceSummaryByStudents(studentIds: string[]) {
  const emptySummary = studentIds.reduce<Record<string, AttendanceSummary>>(
    (accumulator, studentId) => {
      accumulator[studentId] = {
        percentage: null,
        present: 0,
        total: 0,
      };
      return accumulator;
    },
    {},
  );

  if (studentIds.length === 0) return emptySummary;

  const { data, error } = await supabase
    .from("attendance")
    .select("student_id, status, attendance_date")
    .in("student_id", studentIds)
    .gte("attendance_date", getDateDaysAgo(90));

  if (error) {
    console.error("Error cargando resumen de asistencia:", error);
    return emptySummary;
  }

  const summary = { ...emptySummary };

  (data || []).forEach((record) => {
    const studentId = String(record.student_id || "");

    if (!summary[studentId]) {
      summary[studentId] = {
        percentage: null,
        present: 0,
        total: 0,
      };
    }

    summary[studentId].total += 1;

    if (record.status === "presente" || record.status === "retardo") {
      summary[studentId].present += 1;
    }
  });

  Object.keys(summary).forEach((studentId) => {
    const item = summary[studentId];

    item.percentage =
      item.total > 0 ? Math.round((item.present / item.total) * 100) : null;
  });

  return summary;
}

export async function getEvaluationGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, instructor, schedule, level, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as EvaluationGroup[];
}

export async function getEvaluationStudentsByGroup(groupId: string) {
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, group_id, membership_type, membership_status, annual_fee_status, annual_fee_paid_at, annual_fee_expires_at, annual_fee_amount, is_active",
    )
    .eq("group_id", groupId)
    .eq("is_active", true)
    .eq("is_deleted", false)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const students = (data || []) as Omit<
    EvaluationStudent,
    "attendance_percentage" | "attendance_present" | "attendance_total"
  >[];

  const attendanceSummary = await getAttendanceSummaryByStudents(
    students.map((student) => student.id),
  );

  return students.map((student) => {
    const summary = attendanceSummary[student.id] || {
      percentage: null,
      present: 0,
      total: 0,
    };

    return {
      ...student,
      attendance_percentage: summary.percentage,
      attendance_present: summary.present,
      attendance_total: summary.total,
    };
  }) as EvaluationStudent[];
}

export async function getEvaluationsByGroupAndWeek(
  groupId: string,
  weekStartDate: string,
) {
  const { data, error } = await supabase
    .from("student_evaluations")
    .select(
      "id, student_id, group_id, week_start_date, technique_score, discipline_score, attitude_score, average_score, evaluation_status, na_reason, comments, recommendations, created_by, created_at, updated_at",
    )
    .eq("group_id", groupId)
    .eq("week_start_date", weekStartDate);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as StudentEvaluation[];
}

export async function saveStudentEvaluations(rows: SaveEvaluationRow[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (rows.length === 0) return;

  const { error } = await supabase.from("student_evaluations").upsert(
    rows.map((row) => ({
      student_id: row.student_id,
      group_id: row.group_id,
      week_start_date: row.week_start_date,
      evaluation_status: row.evaluation_status,
      technique_score: row.technique_score,
      discipline_score: row.discipline_score,
      attitude_score: row.attitude_score,
      average_score: row.average_score,
      na_reason: row.na_reason || null,
      comments: row.comments || null,
      recommendations: row.recommendations || null,
      created_by: user?.id || null,
      updated_at: new Date().toISOString(),
    })),
    {
      onConflict: "student_id,week_start_date",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getStudentEvaluations(studentId: string) {
  const { data, error } = await supabase
    .from("student_evaluations")
    .select(
      "id, student_id, group_id, week_start_date, technique_score, discipline_score, attitude_score, average_score, evaluation_status, na_reason, comments, recommendations, created_by, created_at, updated_at, groups(name, schedule, level)",
    )
    .eq("student_id", studentId)
    .order("week_start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as StudentEvaluationWithStudent[];
}

export async function getRecentEvaluations(limit = 20) {
  const { data, error } = await supabase
    .from("student_evaluations")
    .select(
      "id, student_id, group_id, week_start_date, technique_score, discipline_score, attitude_score, average_score, evaluation_status, na_reason, comments, recommendations, created_by, created_at, updated_at, students(full_name, email), groups(name, schedule, level)",
    )
    .order("week_start_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as StudentEvaluationWithStudent[];
}
