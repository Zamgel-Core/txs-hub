import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  RefreshCcw,
  Save,
  Star,
  Users,
  XCircle,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { supabase } from "@/src/lib/supabase";
import {
  calculateAverageScore,
  EvaluationGroup,
  EvaluationStudent,
  getCurrentWeekStart,
  getEvaluationGroups,
  getEvaluationsByGroupAndWeek,
  getEvaluationStudentsByGroup,
  getRecentEvaluations,
  saveStudentEvaluations,
  StudentEvaluation,
  StudentEvaluationWithStudent,
} from "@/src/services/evaluationsService";

type EvaluationStatus = "pending" | "completed" | "not_applicable";

type EvaluationDraft = {
  evaluation_status: EvaluationStatus;
  technique_score: number;
  discipline_score: number;
  attitude_score: number;
  na_reason: string;
  comments: string;
  recommendations: string;
};

function getGroupLabel(group: EvaluationGroup) {
  return `${group.name} • ${group.schedule || "Sin horario"} (${group.level || "Sin nivel"})`;
}

function getScoreBadge(score: number | null) {
  if (score === null) return <Badge variant="neutral">N/A</Badge>;
  if (score >= 9) return <Badge variant="success">Excelente</Badge>;
  if (score >= 7) return <Badge variant="warning">Bien</Badge>;
  return <Badge variant="danger">Reforzar</Badge>;
}

function createDefaultDraft(): EvaluationDraft {
  return {
    evaluation_status: "pending",
    technique_score: 8,
    discipline_score: 8,
    attitude_score: 8,
    na_reason: "",
    comments: "",
    recommendations: "",
  };
}

function ScoreSelect({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-white outline-none focus:border-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
          <option key={score} value={score}>
            {score}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Evaluaciones() {
  const [groups, setGroups] = useState<EvaluationGroup[]>([]);
  const [students, setStudents] = useState<EvaluationStudent[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<
    StudentEvaluationWithStudent[]
  >([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekStart());
  const [drafts, setDrafts] = useState<Record<string, EvaluationDraft>>({});

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const selectedGroupData = useMemo(() => {
    return groups.find((group) => group.id === selectedGroup) || null;
  }, [groups, selectedGroup]);

  const stats = useMemo(() => {
    const allDrafts = students.map(
      (student) => drafts[student.id] || createDefaultDraft(),
    );

    const completedDrafts = allDrafts.filter(
      (draft) => draft.evaluation_status === "completed",
    );

    const naDrafts = allDrafts.filter(
      (draft) => draft.evaluation_status === "not_applicable",
    );

    const pendingDrafts = allDrafts.filter(
      (draft) => draft.evaluation_status === "pending",
    );

    const averages = completedDrafts.map((draft) =>
      calculateAverageScore(
        draft.technique_score,
        draft.discipline_score,
        draft.attitude_score,
      ),
    );

    const groupAverage =
      averages.length > 0
        ? Number(
            (
              averages.reduce((total, current) => total + current, 0) /
              averages.length
            ).toFixed(1),
          )
        : 0;

    return {
      total: students.length,
      groupAverage,
      completed: completedDrafts.length,
      notApplicable: naDrafts.length,
      pending: pendingDrafts.length,
      excellent: averages.filter((score) => score >= 9).length,
      needsWork: averages.filter((score) => score < 7).length,
    };
  }, [drafts, students]);

  const loadRecentEvaluations = useCallback(async () => {
    try {
      const data = await getRecentEvaluations(8);
      setRecentEvaluations(data);
    } catch (error) {
      console.error("Error cargando evaluaciones recientes:", error);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const data = await getEvaluationGroups();
      setGroups(data);

      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando grupos:", error);
      alert("No se pudieron cargar los grupos.");
    } finally {
      setLoadingGroups(false);
    }
  }, [selectedGroup]);

  const loadEvaluationData = useCallback(async () => {
    if (!selectedGroup) {
      setStudents([]);
      setDrafts({});
      return;
    }

    try {
      setLoadingStudents(true);

      const [studentsData, evaluationsData] = await Promise.all([
        getEvaluationStudentsByGroup(selectedGroup),
        getEvaluationsByGroupAndWeek(selectedGroup, selectedWeek),
      ]);

      const evaluationsByStudent = evaluationsData.reduce<
        Record<string, StudentEvaluation>
      >((accumulator, evaluation) => {
        accumulator[evaluation.student_id] = evaluation;
        return accumulator;
      }, {});

      const nextDrafts = studentsData.reduce<Record<string, EvaluationDraft>>(
        (accumulator, student) => {
          const existing = evaluationsByStudent[student.id];

          accumulator[student.id] = existing
            ? {
                evaluation_status:
                  existing.evaluation_status === "not_applicable"
                    ? "not_applicable"
                    : "completed",
                technique_score: existing.technique_score ?? 8,
                discipline_score: existing.discipline_score ?? 8,
                attitude_score: existing.attitude_score ?? 8,
                na_reason: existing.na_reason || "",
                comments: existing.comments || "",
                recommendations: existing.recommendations || "",
              }
            : createDefaultDraft();

          return accumulator;
        },
        {},
      );

      setStudents(studentsData);
      setDrafts(nextDrafts);
      setHasUnsavedChanges(false);
      setSaveMessage("");
    } catch (error) {
      console.error("Error cargando evaluaciones:", error);
      alert("No se pudieron cargar las evaluaciones.");
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedGroup, selectedWeek]);

  useEffect(() => {
    loadGroups();
    loadRecentEvaluations();
  }, [loadGroups, loadRecentEvaluations]);

  useEffect(() => {
    loadEvaluationData();
  }, [loadEvaluationData]);

  useEffect(() => {
    if (!selectedGroup) return;

    const channel = supabase
      .channel(`admin-evaluations-${selectedGroup}-${selectedWeek}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_evaluations",
          filter: `group_id=eq.${selectedGroup}`,
        },
        () => {
          loadEvaluationData();
          loadRecentEvaluations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup, selectedWeek, loadEvaluationData, loadRecentEvaluations]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  function updateDraft(
    studentId: string,
    field: keyof EvaluationDraft,
    value: string | number,
  ) {
    setDrafts((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] || createDefaultDraft()),
        [field]: value,
      },
    }));

    setHasUnsavedChanges(true);
    setSaveMessage("");
  }

  function updateDraftStatus(studentId: string, status: EvaluationStatus) {
    setDrafts((current) => {
      const currentDraft = current[studentId] || createDefaultDraft();

      return {
        ...current,
        [studentId]: {
          ...currentDraft,
          evaluation_status: status,
          na_reason:
            status === "not_applicable"
              ? currentDraft.na_reason ||
                "No aplica para evaluación esta semana."
              : currentDraft.na_reason,
        },
      };
    });

    setHasUnsavedChanges(true);
    setSaveMessage("");
  }

  async function handleSaveEvaluations() {
    if (!selectedGroup) {
      alert("Selecciona un grupo.");
      return;
    }

    if (students.length === 0) {
      alert("No hay alumnos para evaluar.");
      return;
    }

    const rowsToSave = students
      .map((student) => {
        const draft = drafts[student.id] || createDefaultDraft();

        if (draft.evaluation_status === "pending") {
          return null;
        }

        if (draft.evaluation_status === "not_applicable") {
          return {
            student_id: student.id,
            group_id: selectedGroup,
            week_start_date: selectedWeek,
            evaluation_status: "not_applicable" as const,
            technique_score: null,
            discipline_score: null,
            attitude_score: null,
            average_score: null,
            na_reason:
              draft.na_reason.trim() ||
              "No aplica para evaluación esta semana.",
            comments: null,
            recommendations: null,
          };
        }

        return {
          student_id: student.id,
          group_id: selectedGroup,
          week_start_date: selectedWeek,
          evaluation_status: "completed" as const,
          technique_score: draft.technique_score,
          discipline_score: draft.discipline_score,
          attitude_score: draft.attitude_score,
          average_score: calculateAverageScore(
            draft.technique_score,
            draft.discipline_score,
            draft.attitude_score,
          ),
          na_reason: null,
          comments: draft.comments.trim() || null,
          recommendations: draft.recommendations.trim() || null,
        };
      })
      .filter(Boolean);

    if (rowsToSave.length === 0) {
      alert(
        "No hay evaluaciones para guardar. Marca al menos un alumno como Evaluado o N/A.",
      );
      return;
    }

    try {
      setSaving(true);

      await saveStudentEvaluations(rowsToSave);

      await Promise.all([loadEvaluationData(), loadRecentEvaluations()]);

      setHasUnsavedChanges(false);
      setSaveMessage("Evaluaciones guardadas correctamente.");
    } catch (error) {
      console.error("Error guardando evaluaciones:", error);
      alert("No se pudieron guardar las evaluaciones.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-5 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Progreso TXS
            </div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Evaluaciones semanales
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Califica técnica, disciplina y actitud, o marca N/A cuando el
              alumno no alcance evaluación semanal.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                loadEvaluationData();
                loadRecentEvaluations();
              }}
              disabled={loadingStudents || saving}
            >
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </Button>

            <Button
              variant="gold"
              className="gap-2 px-6"
              onClick={handleSaveEvaluations}
              disabled={saving || loadingStudents || students.length === 0}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Guardando..." : "Guardar evaluaciones"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
            <p className="text-xs text-zinc-500">Alumnos</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Promedio grupo</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.groupAverage || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Evaluados</p>
            <p className="text-2xl font-bold text-sky-400">{stats.completed}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Excelente</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.excellent}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Reforzar</p>
            <p className="text-2xl font-bold text-red-400">{stats.needsWork}</p>
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-950/60 px-4 py-3">
            <p className="text-xs text-zinc-500">Pendiente / N/A</p>
            <p className="text-2xl font-bold text-white">
              {stats.pending} / {stats.notApplicable}
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-zinc-800 bg-zinc-900/30 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm text-zinc-400">
                Grupo de clase
              </label>

              <select
                value={selectedGroup}
                onChange={(event) => setSelectedGroup(event.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/40"
                disabled={loadingGroups}
              >
                <option value="">Selecciona un grupo...</option>

                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {getGroupLabel(group)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Semana</label>
              <input
                type="date"
                value={selectedWeek}
                onChange={(event) => setSelectedWeek(event.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition [color-scheme:dark] focus:border-yellow-500"
              />
            </div>
          </div>

          {selectedGroupData && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-yellow-400">
                {selectedGroupData.instructor || "Sin instructor"}
              </span>

              <span>{selectedGroupData.schedule || "Sin horario"}</span>
              <span className="hidden sm:inline">•</span>
              <span>{selectedGroupData.level || "Sin nivel"}</span>
            </div>
          )}
        </div>

        <CardContent className="p-0">
          {!selectedGroup ? (
            <div className="px-6 py-24 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <Users className="h-9 w-9 text-zinc-600" />
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Selecciona un grupo
              </h2>

              <p className="mx-auto mt-3 max-w-md text-zinc-500">
                Elige un grupo para capturar la evaluación semanal.
              </p>
            </div>
          ) : loadingStudents ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          ) : students.length === 0 ? (
            <div className="px-6 py-20 text-center text-zinc-500">
              No hay alumnos activos en este grupo.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {students.map((student) => {
                const draft = drafts[student.id] || createDefaultDraft();
                const isCompleted = draft.evaluation_status === "completed";
                const isNA = draft.evaluation_status === "not_applicable";
                const isPending = draft.evaluation_status === "pending";
                const average = isCompleted
                  ? calculateAverageScore(
                      draft.technique_score,
                      draft.discipline_score,
                      draft.attitude_score,
                    )
                  : null;

                return (
                  <div key={student.id} className="p-4 sm:p-6">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 font-bold text-white">
                          {student.full_name.charAt(0)}
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {student.email} •{" "}
                            {student.membership_status || "Sin estado"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                        <BarChart3 className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-xs text-zinc-500">Promedio</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-white">
                              {average ?? "—"}
                            </p>
                            {getScoreBadge(average)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => updateDraftStatus(student.id, "pending")}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isPending
                            ? "border-zinc-500 bg-zinc-500/10"
                            : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 font-bold text-white">
                          <Clock3 className="h-4 w-4 text-zinc-400" />
                          Pendiente
                        </div>
                        <p className="text-xs text-zinc-500">
                          Aún no se captura evaluación.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateDraftStatus(student.id, "completed")
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          isCompleted
                            ? "border-yellow-500/60 bg-yellow-500/10"
                            : "border-zinc-800 bg-zinc-950/50 hover:border-yellow-500/40"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 font-bold text-white">
                          <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                          Evaluado
                        </div>
                        <p className="text-xs text-zinc-500">
                          Capturar calificación semanal.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateDraftStatus(student.id, "not_applicable")
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          isNA
                            ? "border-red-500/50 bg-red-500/10"
                            : "border-zinc-800 bg-zinc-950/50 hover:border-red-500/40"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 font-bold text-white">
                          <XCircle className="h-4 w-4 text-red-400" />
                          N/A
                        </div>
                        <p className="text-xs text-zinc-500">
                          No aplica para esta semana.
                        </p>
                      </button>
                    </div>

                    {isCompleted && (
                      <>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                          <ScoreSelect
                            label="Técnica"
                            value={draft.technique_score}
                            onChange={(value) =>
                              updateDraft(student.id, "technique_score", value)
                            }
                          />

                          <ScoreSelect
                            label="Disciplina"
                            value={draft.discipline_score}
                            onChange={(value) =>
                              updateDraft(student.id, "discipline_score", value)
                            }
                          />

                          <ScoreSelect
                            label="Actitud"
                            value={draft.attitude_score}
                            onChange={(value) =>
                              updateDraft(student.id, "attitude_score", value)
                            }
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <label>
                            <span className="mb-2 block text-xs font-medium text-zinc-500">
                              Comentarios del instructor
                            </span>
                            <textarea
                              value={draft.comments}
                              onChange={(event) =>
                                updateDraft(
                                  student.id,
                                  "comments",
                                  event.target.value,
                                )
                              }
                              rows={3}
                              placeholder="Ej. Excelente avance esta semana..."
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500/50"
                            />
                          </label>

                          <label>
                            <span className="mb-2 block text-xs font-medium text-zinc-500">
                              Recomendaciones
                            </span>
                            <textarea
                              value={draft.recommendations}
                              onChange={(event) =>
                                updateDraft(
                                  student.id,
                                  "recommendations",
                                  event.target.value,
                                )
                              }
                              rows={3}
                              placeholder="Ej. Trabajar postura, coordinación, vueltas..."
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500/50"
                            />
                          </label>
                        </div>
                      </>
                    )}

                    {isNA && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                        <label>
                          <span className="mb-2 flex items-center gap-2 text-xs font-medium text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            Motivo N/A
                          </span>
                          <textarea
                            value={draft.na_reason}
                            onChange={(event) =>
                              updateDraft(
                                student.id,
                                "na_reason",
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Ej. No asistió suficientes clases esta semana."
                            className="w-full rounded-xl border border-red-500/20 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroup && students.length > 0 && (
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  ¿Terminaste de capturar?
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Guarda únicamente los alumnos marcados como Evaluado o N/A.
                  Los pendientes no se registran todavía.
                </p>

                <p
                  className={`mt-3 text-sm font-semibold ${
                    hasUnsavedChanges ? "text-yellow-400" : "text-emerald-400"
                  }`}
                >
                  {hasUnsavedChanges
                    ? "⚠ Cambios pendientes por guardar"
                    : saveMessage
                      ? `✅ ${saveMessage}`
                      : "Todo está listo"}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    loadEvaluationData();
                    loadRecentEvaluations();
                  }}
                  disabled={loadingStudents || saving}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Actualizar
                </Button>

                <Button
                  variant="gold"
                  className="gap-2 px-6"
                  onClick={handleSaveEvaluations}
                  disabled={saving || loadingStudents}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Guardando..." : "Guardar evaluaciones"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasUnsavedChanges && selectedGroup && students.length > 0 && (
        <div className="fixed bottom-5 right-5 z-40 hidden sm:block">
          <Button
            variant="gold"
            className="gap-2 px-5 shadow-2xl shadow-yellow-500/20"
            onClick={handleSaveEvaluations}
            disabled={saving || loadingStudents}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Historial reciente
              </h2>
              <p className="text-sm text-zinc-500">
                Últimas evaluaciones registradas en la academia.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recentEvaluations.map((evaluation) => {
              const isNA = evaluation.evaluation_status === "not_applicable";

              return (
                <div
                  key={evaluation.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {evaluation.students?.full_name || "Alumno TXS"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Semana {evaluation.week_start_date} •{" "}
                        {evaluation.groups?.name || "Sin grupo"}
                      </p>

                      {isNA && evaluation.na_reason && (
                        <p className="mt-1 text-xs text-red-300">
                          N/A: {evaluation.na_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-yellow-400">
                        {isNA ? "N/A" : evaluation.average_score}
                      </span>
                      {getScoreBadge(isNA ? null : evaluation.average_score)}
                    </div>
                  </div>
                </div>
              );
            })}

            {recentEvaluations.length === 0 && (
              <p className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-center text-zinc-500">
                Todavía no hay evaluaciones registradas.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
