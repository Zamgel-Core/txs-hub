// 📍 Ruta del archivo: src/services/attendanceService.ts

import { supabase } from "@/src/lib/supabase";

export type AttendanceStatus = "presente" | "falta" | "retardo";

export type AttendanceGroup = {
  id: string;
  name: string;
  instructor: string | null;
  schedule: string | null;
  level: string | null;
  is_active: boolean;
  sort_order: number | null;
};

export type AttendanceStudent = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  membership_type: string | null;
  membership_status: string | null;
  group_id: string | null;
  is_active: boolean;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  group_id: string | null;
  attendance_date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveAttendanceRow = {
  student_id: string;
  group_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  notes?: string | null;
};

export async function getAttendanceGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, instructor, schedule, level, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AttendanceGroup[];
}

export async function getStudentsByGroup(groupId: string) {
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, membership_type, membership_status, group_id, is_active",
    )
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AttendanceStudent[];
}

export async function getAttendanceByGroupAndDate(
  groupId: string,
  attendanceDate: string,
) {
  const { data, error } = await supabase
    .from("attendance")
    .select("id, student_id, group_id, attendance_date, status, notes, created_at, updated_at")
    .eq("group_id", groupId)
    .eq("attendance_date", attendanceDate);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AttendanceRecord[];
}

export async function saveGroupAttendance(rows: SaveAttendanceRow[]) {
  const { error } = await supabase.from("attendance").upsert(
    rows.map((row) => ({
      student_id: row.student_id,
      group_id: row.group_id,
      attendance_date: row.attendance_date,
      status: row.status,
      notes: row.notes || null,
    })),
    {
      onConflict: "student_id,attendance_date",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
