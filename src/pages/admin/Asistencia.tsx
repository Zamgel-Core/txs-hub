// 📍 Ruta del archivo: src/pages/admin/Asistencia.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Loader2,
  RefreshCcw,
  Save,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { supabase } from "@/src/lib/supabase";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import {
  AttendanceGroup,
  AttendanceStatus,
  AttendanceStudent,
  getAttendanceByGroupAndDate,
  getAttendanceGroups,
  getStudentsByGroup,
  saveGroupAttendance,
} from "@/src/services/attendanceService";

const today = new Date().toISOString().slice(0, 10);

function statusClasses(
  current: AttendanceStatus | undefined,
  target: AttendanceStatus,
) {
  if (current !== target) {
    return "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800";
  }

  if (target === "presente") {
    return "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700";
  }

  if (target === "falta") {
    return "border-red-600 bg-red-600 text-white hover:bg-red-700";
  }

  return "border-amber-600 bg-amber-600 text-white hover:bg-amber-700";
}

function getGroupLabel(group: AttendanceGroup) {
  return `${group.name} • ${group.schedule || "Sin horario"} (${group.level || "Sin nivel"})`;
}

function AttendanceButtons({
  currentStatus,
  onChange,
  showLabels = false,
}: {
  currentStatus: AttendanceStatus | undefined;
  onChange: (status: AttendanceStatus) => void;
  showLabels?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
      <Button
        size="sm"
        onClick={() => onChange("presente")}
        className={`h-10 gap-2 rounded-xl border px-3 ${statusClasses(
          currentStatus,
          "presente",
        )}`}
        variant="outline"
      >
        <Check className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Presente</span>}
      </Button>

      <Button
        size="sm"
        onClick={() => onChange("falta")}
        className={`h-10 gap-2 rounded-xl border px-3 ${statusClasses(
          currentStatus,
          "falta",
        )}`}
        variant="outline"
      >
        <X className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Falta</span>}
      </Button>

      <Button
        size="sm"
        onClick={() => onChange("retardo")}
        className={`h-10 gap-2 rounded-xl border px-3 ${statusClasses(
          currentStatus,
          "retardo",
        )}`}
        variant="outline"
      >
        <Clock3 className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Retardo</span>}
      </Button>
    </div>
  );
}

export function Asistencia() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<AttendanceGroup[]>([]);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedGroupData = useMemo(() => {
    return groups.find((group) => group.id === selectedGroup) || null;
  }, [groups, selectedGroup]);

  const stats = useMemo(() => {
    const values = students.map((student) => attendance[student.id] || null);

    return {
      total: students.length,
      presentes: values.filter((status) => status === "presente").length,
      faltas: values.filter((status) => status === "falta").length,
      retardos: values.filter((status) => status === "retardo").length,
      sinMarcar: values.filter((status) => status === null).length,
    };
  }, [attendance, students]);

  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);

      const data = await getAttendanceGroups();

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

  const loadAttendanceData = useCallback(async () => {
    if (!selectedGroup) {
      setStudents([]);
      setAttendance({});
      return;
    }

    try {
      setLoadingStudents(true);

      const [studentsData, attendanceData] = await Promise.all([
        getStudentsByGroup(selectedGroup),
        getAttendanceByGroupAndDate(selectedGroup, selectedDate),
      ]);

      const existingAttendance: Record<string, AttendanceStatus> = {};

      attendanceData.forEach((item) => {
        existingAttendance[item.student_id] = item.status;
      });

      setStudents(studentsData);
      setAttendance(existingAttendance);
    } catch (error) {
      console.error("Error cargando asistencia:", error);
      alert("No se pudo cargar la asistencia.");
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedDate, selectedGroup]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  useEffect(() => {
    if (!selectedGroup) return;

    const channel = supabase
      .channel(`admin-attendance-realtime-${selectedGroup}-${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `group_id=eq.${selectedGroup}`,
        },
        () => {
          loadAttendanceData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAttendanceData, selectedDate, selectedGroup]);

  function handleMarkAttendance(studentId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  }

  async function handleSaveAttendance() {
    if (!selectedGroup) {
      alert("Selecciona un grupo.");
      return;
    }

    if (students.length === 0) {
      alert("No hay alumnos para guardar asistencia.");
      return;
    }

    const markedAttendance = students
      .filter((student) => Boolean(attendance[student.id]))
      .map((student) => ({
        student_id: student.id,
        group_id: selectedGroup,
        attendance_date: selectedDate,
        status: attendance[student.id],
      }));

    if (markedAttendance.length === 0) {
      alert("Marca al menos una asistencia antes de guardar.");
      return;
    }

    try {
      setSaving(true);

      await saveGroupAttendance(markedAttendance);

      await loadAttendanceData();

      alert("Asistencia guardada correctamente.");
    } catch (error) {
      console.error("Error guardando asistencia:", error);
      alert("No se pudo guardar la asistencia.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingGroups) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando grupos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Asistencia
              </h1>

              <p className="mt-2 text-zinc-500">
                Control real de asistencia por grupo y fecha.
              </p>
            </div>

            <Button
              onClick={() => navigate("/admin/escaner")}
              variant="gold"
              className="h-11 gap-2 px-5"
            >
              <QrCode className="h-4 w-4" />
              Escáner QR
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Presentes</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.presentes}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Faltas</p>
            <p className="text-2xl font-bold text-red-400">{stats.faltas}</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Retardos</p>
            <p className="text-2xl font-bold text-amber-400">
              {stats.retardos}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-3">
            <p className="text-xs text-zinc-500">Sin marcar</p>
            <p className="text-2xl font-bold text-zinc-300">
              {stats.sinMarcar}
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
              <label className="mb-2 block text-sm text-zinc-400">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
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
                Elige un grupo para comenzar a pasar asistencia.
              </p>
            </div>
          ) : loadingStudents ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          ) : (
            <div>
              <table className="hidden w-full text-left lg:table">
                <thead className="border-b border-zinc-800 bg-zinc-900/40">
                  <tr>
                    <th className="px-6 py-4 text-sm text-zinc-400">Alumno</th>

                    <th className="px-6 py-4 text-right text-sm text-zinc-400">
                      Asistencia
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {students.map((student) => {
                    const currentStatus = attendance[student.id];

                    return (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-zinc-900/20"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 font-bold text-white">
                              {student.full_name.charAt(0)}
                            </div>

                            <div>
                              <p className="font-medium text-white">
                                {student.full_name}
                              </p>

                              <p className="text-sm capitalize text-zinc-500">
                                {student.membership_type || "Sin membresía"} •{" "}
                                {student.membership_status || "Sin estado"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <AttendanceButtons
                            currentStatus={currentStatus}
                            onChange={(status) =>
                              handleMarkAttendance(student.id, status)
                            }
                            showLabels
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {students.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-16 text-center text-zinc-500"
                      >
                        No hay alumnos registrados en este grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="divide-y divide-zinc-800 lg:hidden">
                {students.map((student) => {
                  const currentStatus = attendance[student.id];

                  return (
                    <div key={student.id} className="p-4">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-white">
                          {student.full_name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-tight text-white">
                            {student.full_name}
                          </p>

                          <p className="mt-1 text-sm capitalize text-zinc-500">
                            {student.membership_type || "Sin membresía"} •{" "}
                            {student.membership_status || "Sin estado"}
                          </p>
                        </div>
                      </div>

                      <AttendanceButtons
                        currentStatus={currentStatus}
                        onChange={(status) =>
                          handleMarkAttendance(student.id, status)
                        }
                      />
                    </div>
                  );
                })}

                {students.length === 0 && (
                  <div className="px-6 py-16 text-center text-zinc-500">
                    No hay alumnos registrados en este grupo.
                  </div>
                )}
              </div>

              {students.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-zinc-800 bg-zinc-900/20 p-5 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={loadAttendanceData}
                    disabled={loadingStudents || saving}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Actualizar
                  </Button>

                  <Button
                    variant="gold"
                    className="h-11 gap-2 px-6"
                    onClick={handleSaveAttendance}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Guardando..." : "Guardar asistencia"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
