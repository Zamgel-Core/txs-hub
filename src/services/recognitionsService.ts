// 📍 Ruta del archivo: src/services/recognitionsService.ts

import { supabase } from "@/src/lib/supabase";

export type RecognitionType =
  | "good_teammate"
  | "effort"
  | "discipline"
  | "positive_attitude"
  | "leadership";

export interface RecognitionOption {
  type: RecognitionType;
  label: string;
  description: string;
  emoji: string;
}

export interface StudentRecognition {
  id: string;
  student_id: string;
  recognition_type: RecognitionType;
  notes?: string | null;
  awarded_by?: string | null;
  created_at: string;
}

export const recognitionOptions: RecognitionOption[] = [
  {
    type: "good_teammate",
    label: "Buen compañero",
    description: "Ayuda, respeta y convive bien con el grupo.",
    emoji: "🤝",
  },
  {
    type: "effort",
    label: "Gran esfuerzo",
    description: "Muestra constancia y ganas de mejorar.",
    emoji: "💪",
  },
  {
    type: "discipline",
    label: "Disciplina",
    description: "Mantiene enfoque, orden y compromiso.",
    emoji: "🎯",
  },
  {
    type: "positive_attitude",
    label: "Actitud positiva",
    description: "Aporta buena energía y disposición en clase.",
    emoji: "⭐",
  },
  {
    type: "leadership",
    label: "Liderazgo",
    description: "Inspira, apoya y motiva a otros alumnos.",
    emoji: "👑",
  },
];

export function getRecognitionOption(type: RecognitionType) {
  return recognitionOptions.find((option) => option.type === type);
}

export async function createStudentRecognition(params: {
  studentId: string;
  recognitionType: RecognitionType;
  notes?: string;
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No hay usuario autenticado.");

  const { data, error } = await supabase
    .from("student_recognitions")
    .insert({
      student_id: params.studentId,
      recognition_type: params.recognitionType,
      notes: params.notes?.trim() || null,
      awarded_by: user.id,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as StudentRecognition;
}

export async function getStudentRecognitionSummary(studentId: string) {
  const { data, error } = await supabase
    .from("student_recognitions")
    .select("recognition_type")
    .eq("student_id", studentId);

  if (error) throw error;

  const summary = recognitionOptions.map((option) => ({
    ...option,
    count: (data || []).filter(
      (recognition) => recognition.recognition_type === option.type,
    ).length,
  }));

  return summary;
}
