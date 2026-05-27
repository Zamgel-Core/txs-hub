import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Save, X } from "lucide-react";

import { Button } from "../../components/ui/Button";

import { Card, CardContent } from "../../components/ui/Card";

import { supabase } from "../../lib/supabase";

type Group = {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  level: string;
};

type Student = {
  id: string;
  full_name: string;
  membership_type: string | null;
  group_id: string | null;
};

type AttendanceStatus = "presente" | "falta" | "retardo";

export function Asistencia() {
  const [groups, setGroups] = useState<Group[]>([]);

  const [students, setStudents] = useState<Student[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadStudents(selectedGroup);
    }
  }, [selectedDate]);

  async function loadGroups() {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error cargando grupos:", error);
      return;
    }

    setGroups(data || []);
  }

  async function loadStudents(groupId: string) {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("group_id", groupId)
      .eq("is_active", true)
      .order("full_name");

    if (error) {
      console.error("Error cargando alumnos:", error);

      setLoading(false);
      return;
    }

    const studentsData = data || [];

    setStudents(studentsData);

    // ✅ CARGAR ASISTENCIA EXISTENTE
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .eq("attendance_date", selectedDate);

    if (attendanceData) {
      const existingAttendance: Record<string, AttendanceStatus> = {};

      attendanceData.forEach((item) => {
        existingAttendance[item.student_id] = item.status;
      });

      setAttendance(existingAttendance);
    }

    setLoading(false);
  }

  function handleSelectGroup(groupId: string) {
    setSelectedGroup(groupId);
    setAttendance({});

    if (groupId) {
      loadStudents(groupId);
    } else {
      setStudents([]);
    }
  }

  function handleMarkAttendance(studentId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  }

  async function handleSaveAttendance() {
    if (!selectedGroup) return;

    setSaving(true);

    try {
      const attendanceRows = students.map((student) => ({
        student_id: student.id,
        attendance_date: selectedDate,
        status: attendance[student.id] || "presente",
      }));

      const { error } = await supabase
        .from("attendance")
        .insert(attendanceRows);

      if (error) {
        console.error("Error guardando asistencia:", error);

        alert("Ocurrió un error al guardar la asistencia.");

        setSaving(false);
        return;
      }

      alert("Asistencia guardada correctamente.");
    } catch (error) {
      console.error(error);

      alert("Ocurrió un error inesperado.");
    }

    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Asistencia</h1>

        <p className="text-zinc-500 mt-2">
          Control de asistencia en tiempo real.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-sm text-zinc-400 mb-2">
                Grupo de Clase
              </label>

              <select
                value={selectedGroup}
                onChange={(e) => handleSelectGroup(e.target.value)}
                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/40"
              >
                <option value="">Selecciona un grupo...</option>

                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} • {group.schedule} ({group.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Fecha</label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/40"
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {!selectedGroup ? (
            <div className="py-24 px-6 text-center">
              <div className="w-20 h-20 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                <img
                  src="/branding/sombrero_TSX.png"
                  alt=""
                  className="w-10 opacity-40"
                />
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Selecciona un grupo
              </h2>

              <p className="text-zinc-500 mt-3 max-w-md mx-auto">
                Elige un grupo para comenzar a pasar asistencia.
              </p>
            </div>
          ) : loading ? (
            <div className="py-24 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/40 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-zinc-400 text-sm">Alumno</th>

                    <th className="px-6 py-4 text-right text-zinc-400 text-sm">
                      Asistencia
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                            {student.full_name.charAt(0)}
                          </div>

                          <div>
                            <p className="text-white font-medium">
                              {student.full_name}
                            </p>

                            <p className="text-zinc-500 text-sm capitalize">
                              {student.membership_type || "Sin membresía"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleMarkAttendance(student.id, "presente")
                            }
                            className={`${
                              attendance[student.id] === "presente"
                                ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                                : ""
                            }`}
                            variant={
                              attendance[student.id] === "presente"
                                ? "default"
                                : "outline"
                            }
                          >
                            <Check className="w-4 h-4 sm:mr-2" />

                            <span className="hidden sm:inline">Presente</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() =>
                              handleMarkAttendance(student.id, "falta")
                            }
                            className={`${
                              attendance[student.id] === "falta"
                                ? "bg-red-600 hover:bg-red-700 border-red-600"
                                : ""
                            }`}
                            variant={
                              attendance[student.id] === "falta"
                                ? "default"
                                : "outline"
                            }
                          >
                            <X className="w-4 h-4 sm:mr-2" />

                            <span className="hidden sm:inline">Falta</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() =>
                              handleMarkAttendance(student.id, "retardo")
                            }
                            className={`${
                              attendance[student.id] === "retardo"
                                ? "bg-amber-600 hover:bg-amber-700 border-amber-600"
                                : ""
                            }`}
                            variant={
                              attendance[student.id] === "retardo"
                                ? "default"
                                : "outline"
                            }
                          >
                            <AlertCircle className="w-4 h-4 sm:mr-2" />

                            <span className="hidden sm:inline">Retardo</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

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

              {students.length > 0 && (
                <div className="p-5 border-t border-zinc-800 bg-zinc-900/20 flex justify-end">
                  <Button
                    variant="gold"
                    className="h-11 px-6"
                    onClick={handleSaveAttendance}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar asistencia
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
