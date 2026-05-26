// 📍 Ruta: src/pages/admin/AdminDashboard.tsx

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";
import { supabase } from "@/src/lib/supabase";

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  group_level: "principiante" | "avanzado";
  is_active: boolean;
  created_at: string;
};

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  }

  const totalStudents = students.length;

  const activeStudents = students.filter((s) => s.is_active).length;

  const inactiveStudents = students.filter((s) => !s.is_active).length;

  const principiantes = students.filter(
    (s) => s.group_level === "principiante",
  ).length;

  const avanzados = students.filter((s) => s.group_level === "avanzado").length;

  const recentStudents = students.slice(0, 5);

  if (loading) {
    return (
      <div className="text-center text-gold-400 py-20">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">Resumen general de TXS HUB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-6 h-6 text-gold-500" />
            </div>

            <p className="text-zinc-500 text-sm">Total alumnos</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {totalStudents}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-6 h-6 text-emerald-500" />
            </div>

            <p className="text-zinc-500 text-sm">Activos</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {activeStudents}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <UserX className="w-6 h-6 text-red-500" />
            </div>

            <p className="text-zinc-500 text-sm">Inactivos</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {inactiveStudents}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <GraduationCap className="w-6 h-6 text-blue-500" />
            </div>

            <p className="text-zinc-500 text-sm">Principiantes</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {principiantes}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <GraduationCap className="w-6 h-6 text-gold-500" />
            </div>

            <p className="text-zinc-500 text-sm">Avanzados</p>

            <h2 className="text-4xl font-bold text-white mt-2">{avanzados}</h2>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-txs-card border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Alumnos recientes
              </h2>

              <p className="text-zinc-400 text-sm mt-1">
                Últimos alumnos agregados al sistema.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40"
              >
                <div>
                  <h3 className="text-white font-semibold">
                    {student.full_name}
                  </h3>

                  <p className="text-zinc-500 text-sm">{student.email}</p>
                </div>

                <div className="text-right">
                  <p className="text-gold-400 text-sm capitalize font-medium">
                    {student.group_level}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      student.is_active ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {student.is_active ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
