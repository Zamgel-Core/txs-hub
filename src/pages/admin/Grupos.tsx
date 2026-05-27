// 📍 Ruta: src/pages/admin/Grupos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Loader2,
  Plus,
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "../../components/ui/Button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

import { supabase } from "../../lib/supabase";

type Group = {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  level: "principiante" | "intermedio" | "avanzado";
  days: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
};

type Student = {
  id: string;
  full_name: string;
  group_id: string | null;
  is_active: boolean;
};

function getLevelLabel(level: Group["level"]) {
  if (level === "principiante") return "Principiante";
  if (level === "intermedio") return "Intermedio";
  return "Avanzado";
}

function getLevelBadgeClass(level: Group["level"]) {
  if (level === "principiante") {
    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  }

  if (level === "intermedio") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-300";
  }

  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
}

export function Grupos() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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
      .select("id, full_name, group_id, is_active")
      .eq("is_active", true);

    if (groupsError) {
      console.error("Error cargando grupos:", groupsError);
    }

    if (studentsError) {
      console.error("Error cargando alumnos:", studentsError);
    }

    setGroups((groupsData as Group[]) || []);
    setStudents((studentsData as Student[]) || []);
    setLoading(false);
  }

  const studentsByGroup = useMemo(() => {
    return students.reduce<Record<string, number>>((acc, student) => {
      if (!student.group_id) return acc;

      acc[student.group_id] = (acc[student.group_id] || 0) + 1;

      return acc;
    }, {});
  }, [students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mx-auto mb-4" />

          <p className="text-zinc-400 text-sm uppercase tracking-widest">
            Cargando grupos reales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Grupos</h1>

          <p className="text-zinc-500 mt-2">
            Horarios reales de TXS Academy conectados a Supabase.
          </p>
        </div>

        <Button variant="gold" className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups.map((group) => {
          const alumnosCount = studentsByGroup[group.id] || 0;

          return (
            <Card
              key={group.id}
              className="hover:border-gold-500/50 transition-colors overflow-hidden"
            >
              <CardHeader className="bg-zinc-900/30 border-b border-zinc-800/50 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-white leading-tight">
                      {group.name}
                    </CardTitle>

                    <p className="text-zinc-500 text-sm mt-2">
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

              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <UserCheck className="w-4 h-4 text-gold-500" />

                  <span>
                    Instructor:{" "}
                    <strong className="text-zinc-200">
                      {group.instructor}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <CalendarDays className="w-4 h-4 text-gold-500" />

                  <span>
                    Días:{" "}
                    <strong className="text-zinc-200">
                      {group.days || "Sin días asignados"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Clock className="w-4 h-4 text-gold-500" />

                  <span>
                    Horario:{" "}
                    <strong className="text-zinc-200">{group.schedule}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Users className="w-4 h-4 text-gold-500" />

                  <span>
                    Alumnos inscritos:{" "}
                    <strong className="text-zinc-200">{alumnosCount}</strong>
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/50 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-white"
                  >
                    Ver alumnos
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300"
                  >
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
    </div>
  );
}
