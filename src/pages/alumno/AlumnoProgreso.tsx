// 📍 Ruta del archivo: src/pages/alumno/AlumnoProgreso.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Loader2,
  MessageSquareText,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Card, CardContent } from "@/src/components/ui/Card";
import { supabase } from "@/src/lib/supabase";
import {
  getStudentEvaluations,
  StudentEvaluationWithStudent,
} from "@/src/services/evaluationsService";

type Student = {
  id: string;
  full_name: string;
  email: string;
  group_id: string | null;
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getScoreMeta(score: number) {
  if (score >= 9) {
    return {
      label: "Excelente",
      variant: "success" as const,
      textClass: "text-emerald-400",
      borderClass: "border-emerald-500/20 bg-emerald-500/10",
    };
  }

  if (score >= 8) {
    return {
      label: "Muy bien",
      variant: "neutral" as const,
      textClass: "text-sky-400",
      borderClass: "border-sky-500/20 bg-sky-500/10",
    };
  }

  if (score >= 7) {
    return {
      label: "Buen progreso",
      variant: "warning" as const,
      textClass: "text-yellow-400",
      borderClass: "border-yellow-500/20 bg-yellow-500/10",
    };
  }

  if (score >= 5) {
    return {
      label: "Mejorable",
      variant: "warning" as const,
      textClass: "text-orange-400",
      borderClass: "border-orange-500/20 bg-orange-500/10",
    };
  }

  return {
    label: "Área a reforzar",
    variant: "danger" as const,
    textClass: "text-red-400",
    borderClass: "border-red-500/20 bg-red-500/10",
  };
}

function getScoreBadge(score: number) {
  const meta = getScoreMeta(score);
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function getTrend(evaluations: StudentEvaluationWithStudent[]) {
  if (evaluations.length < 2) {
    return {
      label: "Sin tendencia todavía",
      description: "Se necesitan al menos 2 evaluaciones para medir avance.",
      className: "text-zinc-400",
    };
  }

  const latest = evaluations[0].average_score;
  const previous = evaluations[1].average_score;
  const difference = Number((latest - previous).toFixed(1));

  if (difference >= 0.4) {
    return {
      label: "⬆ Mejorando",
      description: `Subiste ${difference} puntos vs. la evaluación anterior.`,
      className: "text-emerald-400",
    };
  }

  if (difference <= -0.4) {
    return {
      label: "⬇ Bajando",
      description: `Bajaste ${Math.abs(difference)} puntos vs. la evaluación anterior.`,
      className: "text-red-400",
    };
  }

  return {
    label: "➡ Estable",
    description: "Tu progreso se mantiene constante.",
    className: "text-yellow-400",
  };
}

function getScoreMessage(score: number) {
  if (score >= 9) {
    return "Vas excelente. Mantén la constancia y sigue puliendo detalles finos.";
  }

  if (score >= 7) {
    return "Buen avance. Con práctica constante puedes subir tu promedio rápido.";
  }

  return "Esta semana toca reforzar bases. Enfócate en las recomendaciones del instructor.";
}

export function AlumnoProgreso() {
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<
    StudentEvaluationWithStudent[]
  >([]);
  const [loading, setLoading] = useState(true);

  const latestEvaluation = evaluations[0] || null;
  const trend = useMemo(() => getTrend(evaluations), [evaluations]);

  const stats = useMemo(() => {
    if (evaluations.length === 0) {
      return {
        average: 0,
        technique: 0,
        discipline: 0,
        attitude: 0,
      };
    }

    const total = evaluations.length;

    return {
      average: Number(
        (
          evaluations.reduce(
            (sum, evaluation) => sum + evaluation.average_score,
            0,
          ) / total
        ).toFixed(1),
      ),
      technique: Number(
        (
          evaluations.reduce(
            (sum, evaluation) => sum + evaluation.technique_score,
            0,
          ) / total
        ).toFixed(1),
      ),
      discipline: Number(
        (
          evaluations.reduce(
            (sum, evaluation) => sum + evaluation.discipline_score,
            0,
          ) / total
        ).toFixed(1),
      ),
      attitude: Number(
        (
          evaluations.reduce(
            (sum, evaluation) => sum + evaluation.attitude_score,
            0,
          ) / total
        ).toFixed(1),
      ),
    };
  }, [evaluations]);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (!student?.id) return;

    const channel = supabase
      .channel(`student-progress-${student.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_evaluations",
          filter: `student_id=eq.${student.id}`,
        },
        () => {
          loadEvaluations(student.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id]);

  async function loadEvaluations(studentId: string) {
    const data = await getStudentEvaluations(studentId);
    setEvaluations(data);
  }

  async function loadProgress() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setStudent(null);
        setEvaluations([]);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, email, group_id")
        .ilike("email", user.email)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      const currentStudent = data as Student | null;
      setStudent(currentStudent);

      if (currentStudent?.id) {
        await loadEvaluations(currentStudent.id);
      }
    } catch (error) {
      console.error("Error cargando progreso del alumno:", error);
      alert("No se pudo cargar tu progreso.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 shadow-2xl sm:p-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
          <Sparkles className="h-3.5 w-3.5" />
          Progreso TXS
        </div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Mi progreso
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Aquí verás tus evaluaciones semanales, comentarios del instructor y
          recomendaciones para seguir mejorando.
        </p>
      </div>

      {!student ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">
              No encontramos tu perfil de alumno
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Revisa que tu correo de acceso coincida con el correo registrado
              en la academia.
            </p>
          </CardContent>
        </Card>
      ) : evaluations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
            <h2 className="text-xl font-bold text-white">
              Todavía no tienes evaluaciones
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Cuando tu maestro registre tu evaluación semanal aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">Promedio general</p>
                <p className="mt-2 text-3xl font-bold text-yellow-400">
                  {stats.average}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">Técnica</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.technique}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">Disciplina</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.discipline}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">Actitud</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.attitude}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Tendencia</p>
                    <p className={`mt-2 text-2xl font-bold ${trend.className}`}>
                      {trend.label}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {trend.description}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">Nivel TXS</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  Próximamente
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Se activará cuando definamos la fórmula oficial.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">Puntos TXS</p>
                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  Próximamente
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Asistencia, evaluación y constancia sumarán puntos.
                </p>
              </CardContent>
            </Card>
          </div>

          {latestEvaluation && (
            <Card className="overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <h2 className="text-2xl font-bold text-white">
                        Última evaluación
                      </h2>
                    </div>

                    <p className="text-sm text-zinc-500">
                      Semana del {formatDate(latestEvaluation.week_start_date)}
                    </p>
                  </div>

                  {(() => {
                    const scoreMeta = getScoreMeta(
                      latestEvaluation.average_score,
                    );

                    return (
                      <div
                        className={`rounded-2xl border px-5 py-4 text-center ${scoreMeta.borderClass}`}
                      >
                        <p className="text-xs text-zinc-500">Calificación</p>
                        <p
                          className={`text-4xl font-bold ${scoreMeta.textClass}`}
                        >
                          {latestEvaluation.average_score}
                        </p>
                        <div className="mt-2">
                          {getScoreBadge(latestEvaluation.average_score)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <p className="text-xs text-zinc-500">Técnica</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {latestEvaluation.technique_score}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <p className="text-xs text-zinc-500">Disciplina</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {latestEvaluation.discipline_score}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <p className="text-xs text-zinc-500">Actitud</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {latestEvaluation.attitude_score}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">
                      Comentarios del instructor
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-zinc-300">
                    {latestEvaluation.comments ||
                      getScoreMessage(latestEvaluation.average_score)}
                  </p>

                  {latestEvaluation.recommendations && (
                    <div className="mt-5 border-t border-zinc-800 pt-5">
                      <p className="mb-2 text-sm font-semibold text-yellow-400">
                        Recomendaciones
                      </p>
                      <p className="text-sm leading-6 text-zinc-300">
                        {latestEvaluation.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">
                  Historial de evaluaciones
                </h2>
              </div>

              <div className="space-y-3">
                {evaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          Semana del {formatDate(evaluation.week_start_date)}
                        </p>
                        <p className="text-sm text-zinc-500">
                          Técnica {evaluation.technique_score} • Disciplina{" "}
                          {evaluation.discipline_score} • Actitud{" "}
                          {evaluation.attitude_score}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-yellow-400">
                          {evaluation.average_score}
                        </span>
                        {getScoreBadge(evaluation.average_score)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
