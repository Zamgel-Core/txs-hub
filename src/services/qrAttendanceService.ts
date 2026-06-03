// 📍 Ruta del archivo: src/services/qrAttendanceService.ts

import { supabase } from "@/src/lib/supabase";

export type QrAttendanceStudent = {
  id: string;
  full_name: string;
  group_id: string | null;
  membership_status: string | null;
  groups?: {
    name: string;
    schedule: string | null;
    level: string | null;
  } | null;
};

export function extractQrToken(rawValue: string) {
  const cleanValue = rawValue.trim();

  try {
    const url = new URL(cleanValue);
    return url.searchParams.get("token") || cleanValue;
  } catch {
    return cleanValue;
  }
}

export async function registerAttendanceByQr(rawToken: string) {
  const qrToken = extractQrToken(rawToken);
  const today = new Date().toISOString().slice(0, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      `
      id,
      full_name,
      group_id,
      membership_status,
      groups:group_id (
        name,
        schedule,
        level
      )
    `,
    )
    .eq("qr_token", qrToken)
    .single();

  if (studentError || !student) {
    throw new Error("Alumno no encontrado con este QR.");
  }

  const { error: attendanceError } = await supabase.from("attendance").upsert(
    {
      student_id: student.id,
      group_id: student.group_id,
      attendance_date: today,
      status: "presente",
      notes: "Registrado por escáner QR",
      created_by: user?.id || null,
    },
    {
      onConflict: "student_id,attendance_date",
    },
  );

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  return student as unknown as QrAttendanceStudent;
}
