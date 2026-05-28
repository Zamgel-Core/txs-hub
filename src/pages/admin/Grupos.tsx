// 📍 Ruta: src/pages/admin/Grupos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Edit,
  Loader2,
  Plus,
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

        <Button variant="gold" className="gap-2" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Agregar Grupo
        </Button>
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
