// 📍 Ruta: src/pages/admin/Grupos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock,
  Download,
  Edit,
  FileSpreadsheet,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { supabase } from "../../lib/supabase";
import {
  exportGroupsExcel,
  getGroupsReportData,
  getGroupsReportPreview,
  GroupsReportPreview,
} from "@/src/services/groupsReportService";

type GroupLevel = "principiante" | "intermedio" | "avanzado";

type Group = {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  level: GroupLevel;
  days: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
};

type Student = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  group_id: string | null;
  is_active: boolean;
};

type GroupForm = {
  name: string;
  instructor: string;
  days: string;
  schedule: string;
  level: GroupLevel;
  sort_order: string;
};

const emptyForm: GroupForm = {
  name: "",
  instructor: "H Franco",
  days: "",
  schedule: "",
  level: "principiante",
  sort_order: "1",
};

type ExportFilters = {
  startDate: string;
  endDate: string;
  groupId: string;
  level: "all" | GroupLevel;
  includeStudents: boolean;
  includeAttendance: boolean;
  includePayments: boolean;
  includeInactiveStudents: boolean;
  includePendingPayments: boolean;
  reportType: "complete" | "attendance_payments";
};

function getDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getTodayDate() {
  return getDateInputValue(new Date());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getMondayOfWeek(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getWeekRange(date = new Date()) {
  const start = getMondayOfWeek(date);
  const end = addDays(start, 6);
  return {
    startDate: getDateInputValue(start),
    endDate: getDateInputValue(end),
  };
}

function getWeekNumber(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
}

function getCurrentMonthStart() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return getDateInputValue(date);
}

function getDefaultExportFilters(): ExportFilters {
  const currentWeek = getWeekRange();

  return {
    startDate: currentWeek.startDate,
    endDate: currentWeek.endDate,
    groupId: "",
    level: "all",
    includeStudents: true,
    includeAttendance: true,
    includePayments: true,
    includeInactiveStudents: false,
    includePendingPayments: false,
    reportType: "attendance_payments",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);
}

function formatShortDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getLevelLabel(level: GroupLevel) {
  if (level === "principiante") return "Principiante";
  if (level === "intermedio") return "Intermedio";
  return "Avanzado";
}

function getLevelBadgeClass(level: GroupLevel) {
  if (level === "principiante") {
    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  }

  if (level === "intermedio") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-300";
  }

  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
}

function mapGroupToForm(group: Group): GroupForm {
  return {
    name: group.name,
    instructor: group.instructor,
    days: group.days || "",
    schedule: group.schedule,
    level: group.level,
    sort_order: String(group.sort_order || 1),
  };
}

export function Grupos() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState<GroupForm>(emptyForm);

  const [studentsModalGroup, setStudentsModalGroup] = useState<Group | null>(
    null,
  );

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>(
    getDefaultExportFilters(),
  );
  const [exportPreview, setExportPreview] =
    useState<GroupsReportPreview | null>(null);
  const [loadingExportPreview, setLoadingExportPreview] = useState(false);
  const [exportingGroups, setExportingGroups] = useState(false);

  useEffect(() => {
    loadGroupsData();
  }, []);

  async function loadGroupsData() {
    setLoading(true);

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("id, full_name, email, phone, group_id, is_active")
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (groupsError) {
      console.error("Error cargando grupos:", groupsError);
      alert("No se pudieron cargar los grupos.");
    }

    if (studentsError) {
      console.error("Error cargando alumnos:", studentsError);
      alert("No se pudieron cargar los alumnos del grupo.");
    }

    setGroups((groupsData as Group[]) || []);
    setStudents((studentsData as Student[]) || []);
    setLoading(false);
  }

  const studentsByGroup = useMemo(() => {
    return students.reduce<Record<string, Student[]>>((acc, student) => {
      if (!student.group_id) return acc;

      if (!acc[student.group_id]) {
        acc[student.group_id] = [];
      }

      acc[student.group_id].push(student);

      return acc;
    }, {});
  }, [students]);

  function openCreateModal() {
    setEditingGroup(null);
    setForm({
      ...emptyForm,
      sort_order: String((groups[groups.length - 1]?.sort_order || 0) + 1),
    });
    setIsFormOpen(true);
  }

  function openEditModal(group: Group) {
    setEditingGroup(group);
    setForm(mapGroupToForm(group));
    setIsFormOpen(true);
  }

  function closeFormModal() {
    if (saving) return;

    setIsFormOpen(false);
    setEditingGroup(null);
    setForm(emptyForm);
  }

  function buildExportOptions(filters = exportFilters) {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
      groupId: filters.groupId || undefined,
      level: filters.level,
      includeStudents: filters.includeStudents,
      includeAttendance: filters.includeAttendance,
      includePayments: filters.includePayments,
      includeInactiveStudents: filters.includeInactiveStudents,
      includePendingPayments: filters.includePendingPayments,
      reportType: filters.reportType,
    };
  }

  async function loadExportPreview(filters = exportFilters) {
    try {
      setLoadingExportPreview(true);

      const data = await getGroupsReportData(buildExportOptions(filters));
      setExportPreview(getGroupsReportPreview(data));
    } catch (error) {
      console.error("Error cargando vista previa del reporte:", error);
      alert("No se pudo cargar la vista previa del reporte.");
    } finally {
      setLoadingExportPreview(false);
    }
  }

  async function openExportModal() {
    const initialFilters = getDefaultExportFilters();

    setExportFilters(initialFilters);
    setIsExportModalOpen(true);
    await loadExportPreview(initialFilters);
  }

  async function handleExportGroupsExcel() {
    if (!exportFilters.startDate || !exportFilters.endDate) {
      alert("Selecciona fecha inicial y fecha final.");
      return;
    }

    if (exportFilters.startDate > exportFilters.endDate) {
      alert("La fecha inicial no puede ser mayor a la fecha final.");
      return;
    }

    try {
      setExportingGroups(true);
      await exportGroupsExcel(buildExportOptions());
    } catch (error) {
      console.error("Error exportando reporte de grupos:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo exportar el reporte de grupos.",
      );
    } finally {
      setExportingGroups(false);
    }
  }

  function updateExportFilters(nextFilters: Partial<ExportFilters>) {
    setExportFilters((current) => ({
      ...current,
      ...nextFilters,
    }));
  }

  function applyTodayRange() {
    const today = getTodayDate();
    const nextFilters = {
      ...exportFilters,
      startDate: today,
      endDate: today,
    };

    setExportFilters(nextFilters);
    loadExportPreview(nextFilters);
  }

  function applyMonthRange() {
    const nextFilters = {
      ...exportFilters,
      startDate: getCurrentMonthStart(),
      endDate: getTodayDate(),
    };

    setExportFilters(nextFilters);
    loadExportPreview(nextFilters);
  }

  function applyCurrentWeekRange() {
    const currentWeek = getWeekRange();
    const nextFilters = {
      ...exportFilters,
      startDate: currentWeek.startDate,
      endDate: currentWeek.endDate,
    };

    setExportFilters(nextFilters);
    loadExportPreview(nextFilters);
  }

  function moveWeek(direction: -1 | 1) {
    const baseDate = new Date(`${exportFilters.startDate}T00:00:00`);
    const targetDate = addDays(baseDate, direction * 7);
    const week = getWeekRange(targetDate);
    const nextFilters = {
      ...exportFilters,
      startDate: week.startDate,
      endDate: week.endDate,
    };

    setExportFilters(nextFilters);
    loadExportPreview(nextFilters);
  }

  async function handleSaveGroup() {
    const cleanName = form.name.trim();
    const cleanInstructor = form.instructor.trim();
    const cleanSchedule = form.schedule.trim();
    const cleanDays = form.days.trim();
    const sortOrder = Number(form.sort_order);

    if (!cleanName || !cleanInstructor || !cleanSchedule || !cleanDays) {
      alert("Completa nombre, instructor, días y horario.");
      return;
    }

    if (!Number.isFinite(sortOrder) || sortOrder <= 0) {
      alert("El orden debe ser un número válido mayor a 0.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: cleanName,
        instructor: cleanInstructor,
        days: cleanDays,
        schedule: cleanSchedule,
        level: form.level,
        sort_order: sortOrder,
        is_active: true,
      };

      if (editingGroup) {
        const { error } = await supabase
          .from("groups")
          .update(payload)
          .eq("id", editingGroup.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("groups").insert(payload);

        if (error) throw error;
      }

      await loadGroupsData();
      closeFormModal();
    } catch (error) {
      console.error("Error guardando grupo:", error);
      alert("No se pudo guardar el grupo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-yellow-400" />

          <p className="text-sm uppercase tracking-widest text-zinc-400">
            Cargando grupos reales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Grupos</h1>

          <p className="mt-2 text-zinc-500">
            Horarios reales de TXS Academy conectados a Supabase.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="gap-2" onClick={openExportModal}>
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>

          <Button variant="gold" className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Agregar Grupo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const groupStudents = studentsByGroup[group.id] || [];
          const alumnosCount = groupStudents.length;

          return (
            <Card
              key={group.id}
              className="overflow-hidden transition-colors hover:border-gold-500/50"
            >
              <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/30 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl leading-tight text-white">
                      {group.name}
                    </CardTitle>

                    <p className="mt-2 text-sm text-zinc-500">
                      Orden #{group.sort_order || "-"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getLevelBadgeClass(
                      group.level,
                    )}`}
                  >
                    {getLevelLabel(group.level)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-5">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <UserCheck className="h-4 w-4 text-gold-500" />

                  <span>
                    Instructor:{" "}
                    <strong className="text-zinc-200">
                      {group.instructor}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <CalendarDays className="h-4 w-4 text-gold-500" />

                  <span>
                    Días:{" "}
                    <strong className="text-zinc-200">
                      {group.days || "Sin días asignados"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Clock className="h-4 w-4 text-gold-500" />

                  <span>
                    Horario:{" "}
                    <strong className="text-zinc-200">{group.schedule}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Users className="h-4 w-4 text-gold-500" />

                  <span>
                    Alumnos inscritos:{" "}
                    <strong className="text-zinc-200">{alumnosCount}</strong>
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/50 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-white"
                    onClick={() => setStudentsModalGroup(group)}
                  >
                    Ver alumnos
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-zinc-700 text-zinc-300"
                    onClick={() => openEditModal(group)}
                  >
                    <Edit className="h-4 w-4" />
                    Editar grupo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-zinc-500">
              No hay grupos activos registrados todavía.
            </p>
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#090909] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingGroup ? "Editar grupo" : "Agregar grupo"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Guarda horarios reales conectados a Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-zinc-600 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Nombre del grupo
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="TXS Academy - Intermedios"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Instructor
                  </label>
                  <input
                    value={form.instructor}
                    onChange={(event) =>
                      setForm({ ...form, instructor: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                    placeholder="H Franco"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Nivel
                  </label>
                  <select
                    value={form.level}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        level: event.target.value as GroupLevel,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Días
                  </label>
                  <input
                    value={form.days}
                    onChange={(event) =>
                      setForm({ ...form, days: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                    placeholder="Lunes, Martes y Miércoles"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Horario
                  </label>
                  <input
                    value={form.schedule}
                    onChange={(event) =>
                      setForm({ ...form, schedule: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                    placeholder="7:00 PM - 8:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Orden
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm({ ...form, sort_order: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-5">
              <Button
                variant="ghost"
                onClick={closeFormModal}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                variant="gold"
                className="gap-2"
                onClick={handleSaveGroup}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Guardando..." : "Guardar grupo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-yellow-500/20 bg-[#090909] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Exportar grupos
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Genera el reporte completo de grupos o el reporte de pagos con asistencia semanal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-zinc-600 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-zinc-950 to-black p-5 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
                    <FileSpreadsheet className="h-7 w-7 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">TXS HUB</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                    Reporte de grupos
                  </p>
                  <p className="mt-3 text-sm text-zinc-500">
                    {formatShortDate(exportFilters.startDate)} -{" "}
                    {formatShortDate(exportFilters.endDate)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Grupos
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {loadingExportPreview
                        ? "..."
                        : (exportPreview?.groupsCount ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Alumnos
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-400">
                      {loadingExportPreview
                        ? "..."
                        : (exportPreview?.studentsCount ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Asistencias
                    </p>
                    <p className="mt-2 text-2xl font-bold text-sky-400">
                      {loadingExportPreview
                        ? "..."
                        : (exportPreview?.attendanceCount ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Pagos
                    </p>
                    <p className="mt-2 text-xl font-bold text-yellow-400">
                      {loadingExportPreview
                        ? "..."
                        : formatCurrency(exportPreview?.paymentsTotal || 0)}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
                  <h3 className="mb-4 font-bold text-white">Tipo de reporte</h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => updateExportFilters({ reportType: "complete" })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        exportFilters.reportType === "complete"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                      }`}
                    >
                      <span className="block font-semibold text-white">
                        Completo por grupos
                      </span>
                      <span className="mt-1 block text-sm text-zinc-500">
                        Reporte completo de la academia organizado por hojas: dashboard, grupos, alumnos, asistencia y pagos.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateExportFilters({ reportType: "attendance_payments" })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        exportFilters.reportType === "attendance_payments"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                      }`}
                    >
                      <span className="block font-semibold text-white">
                        Pagos + asistencia semanal
                      </span>
                      <span className="mt-1 block text-sm text-zinc-500">
                        Un solo Excel con 2 hojas: Pagos y Asistencia semanal con Lun-Dom y códigos A, F y R.
                      </span>
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">
                        Rango del reporte
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {exportFilters.reportType === "attendance_payments"
                          ? `Semana ${getWeekNumber(exportFilters.startDate)} · ${formatShortDate(exportFilters.startDate)} - ${formatShortDate(exportFilters.endDate)}`
                          : "Las asistencias y pagos se filtran por fecha."}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => loadExportPreview()}
                      disabled={loadingExportPreview}
                    >
                      {loadingExportPreview ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4" />
                      )}
                      Vista previa
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Desde
                      </span>
                      <input
                        type="date"
                        value={exportFilters.startDate}
                        onChange={(event) =>
                          updateExportFilters({ startDate: event.target.value })
                        }
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-white outline-none [color-scheme:dark] focus:border-yellow-500"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Hasta
                      </span>
                      <input
                        type="date"
                        value={exportFilters.endDate}
                        onChange={(event) =>
                          updateExportFilters({ endDate: event.target.value })
                        }
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-white outline-none [color-scheme:dark] focus:border-yellow-500"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={applyTodayRange}>
                      Hoy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyMonthRange}>
                      Este mes
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyCurrentWeekRange}>
                      Semana actual
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveWeek(-1)}>
                      Semana anterior
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveWeek(1)}>
                      Semana siguiente
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
                  <h3 className="mb-4 font-bold text-white">Filtros</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Grupo
                      </span>
                      <select
                        value={exportFilters.groupId}
                        onChange={(event) =>
                          updateExportFilters({
                            groupId: event.target.value,
                            level: "all",
                          })
                        }
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-white outline-none focus:border-yellow-500"
                      >
                        <option value="">Todos los grupos</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name} · {group.schedule}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Nivel
                      </span>
                      <select
                        value={exportFilters.level}
                        onChange={(event) =>
                          updateExportFilters({
                            level: event.target.value as ExportFilters["level"],
                            groupId: "",
                          })
                        }
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-white outline-none focus:border-yellow-500"
                      >
                        <option value="all">Todos los niveles</option>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10">
                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      El archivo incluirá
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {exportFilters.reportType === "complete"
                        ? "Puedes activar o desactivar secciones."
                        : "El reporte seleccionado se exporta con las columnas necesarias."}
                    </p>
                  </div>
                </div>

                {exportFilters.reportType === "attendance_payments" ? (
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Hoja 1: Pagos
                        </span>
                        <span className="text-sm text-zinc-500">
                          Horario, alumno, fecha, estado, monto, método, comprobante y nota.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Hoja 2: Asistencia semanal
                        </span>
                        <span className="text-sm text-zinc-500">
                          Semana completa de lunes a domingo con códigos A, F y R.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includePendingPayments}
                        onChange={(event) =>
                          updateExportFilters({
                            includePendingPayments: event.target.checked,
                          })
                        }
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Incluir no pagados / pendientes
                        </span>
                        <span className="text-sm text-zinc-500">
                          Agrega a los alumnos sin pago registrado en el rango como “Pendiente de pago”.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includeInactiveStudents}
                        onChange={(event) =>
                          updateExportFilters({
                            includeInactiveStudents: event.target.checked,
                          })
                        }
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Incluir alumnos inactivos
                        </span>
                        <span className="text-sm text-zinc-500">
                          Útil si el reporte requiere historial completo.
                        </span>
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Dashboard
                        </span>
                        <span className="text-sm text-zinc-500">
                          Resumen ejecutivo con métricas del rango.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Grupos
                        </span>
                        <span className="text-sm text-zinc-500">
                          Horarios, instructor, alumnos y resumen por grupo.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includeStudents}
                        onChange={(event) =>
                          updateExportFilters({
                            includeStudents: event.target.checked,
                          })
                        }
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Alumnos por grupo
                        </span>
                        <span className="text-sm text-zinc-500">
                          Contacto, membresía, anualidad y grupo asignado.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includeAttendance}
                        onChange={(event) =>
                          updateExportFilters({
                            includeAttendance: event.target.checked,
                          })
                        }
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Asistencia
                        </span>
                        <span className="text-sm text-zinc-500">
                          Presentes, faltas y retardos dentro del rango.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includePayments}
                        onChange={(event) =>
                          updateExportFilters({
                            includePayments: event.target.checked,
                          })
                        }
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Pagos
                        </span>
                        <span className="text-sm text-zinc-500">
                          Pagos del rango y total en MXN.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includePendingPayments}
                        onChange={(event) =>
                          updateExportFilters({
                            includePendingPayments: event.target.checked,
                          })
                        }
                        disabled={!exportFilters.includePayments}
                        className="mt-1 accent-yellow-500 disabled:opacity-40"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Incluir no pagados / pendientes
                        </span>
                        <span className="text-sm text-zinc-500">
                          Agrega alumnos sin pago registrado al reporte de pagos.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <input
                        type="checkbox"
                        checked={exportFilters.includeInactiveStudents}
                        onChange={(event) =>
                          updateExportFilters({
                            includeInactiveStudents: event.target.checked,
                          })
                        }
                        className="mt-1 accent-yellow-500"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          Incluir alumnos inactivos
                        </span>
                        <span className="text-sm text-zinc-500">
                          Útil para auditorías o reportes históricos.
                        </span>
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsExportModalOpen(false)}
                disabled={exportingGroups}
              >
                Cancelar
              </Button>

              <Button
                variant="gold"
                className="gap-2"
                onClick={handleExportGroupsExcel}
                disabled={exportingGroups || loadingExportPreview}
              >
                {exportingGroups ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exportingGroups
                  ? "Generando..."
                  : exportFilters.reportType === "attendance_payments"
                    ? "Descargar pagos + asistencia"
                    : "Descargar reporte completo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {studentsModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#090909] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Alumnos del grupo
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {studentsModalGroup.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStudentsModalGroup(null)}
                className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-zinc-600 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-6">
              {(studentsByGroup[studentsModalGroup.id] || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                  <p className="text-zinc-500">
                    Este grupo todavía no tiene alumnos inscritos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(studentsByGroup[studentsModalGroup.id] || []).map(
                    (student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-white">
                          {student.full_name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-white">
                            {student.full_name}
                          </p>
                          <p className="truncate text-sm text-zinc-500">
                            {student.email || "Sin correo"} •{" "}
                            {student.phone || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
