// 📍 Ruta: src/pages/admin/AdminDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/Card";

import { supabase } from "../../lib/supabase";

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  group_level: "principiante" | "avanzado";
  is_active: boolean;
  created_at: string;

  membership_status: "activa" | "vencida" | "pendiente";

  membership_type: "semanal" | "quincenal" | "mensual" | null;

  membership_start_date: string | null;
  membership_end_date: string | null;
  last_payment_date: string | null;
  payment_notes: string | null;
};

function formatDate(date: string | null) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(date: string | null) {
  if (!date) return null;

  const today = new Date();
  const endDate = new Date(date);

  const diffTime = endDate.getTime() - today.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error cargando dashboard:", error);
    } else {
      setStudents((data as Student[]) || []);
    }

    setLoading(false);
  }

  const totalStudents = students.length;

  const activeMemberships = students.filter(
    (student) => student.membership_status === "activa",
  ).length;

  const expiredMemberships = students.filter(
    (student) => student.membership_status === "vencida",
  ).length;

  const pendingMemberships = students.filter(
    (student) => student.membership_status === "pendiente",
  ).length;

  const activeStudents = students.filter((student) => student.is_active).length;

  const beginners = students.filter(
    (student) => student.group_level === "principiante",
  ).length;

  const advanced = students.filter(
    (student) => student.group_level === "avanzado",
  ).length;

  const upcomingExpirations = useMemo(() => {
    return students
      .filter((student) => {
        if (!student.membership_end_date) return false;

        const days = getDaysRemaining(student.membership_end_date);

        return days !== null && days >= 0 && days <= 7;
      })
      .sort((a, b) => {
        const aDate = new Date(a.membership_end_date || "").getTime();

        const bDate = new Date(b.membership_end_date || "").getTime();

        return aDate - bDate;
      })
      .slice(0, 6);
  }, [students]);

  const recentPayments = useMemo(() => {
    return students
      .filter((student) => student.last_payment_date)
      .sort((a, b) => {
        const aDate = new Date(a.last_payment_date || "").getTime();

        const bDate = new Date(b.last_payment_date || "").getTime();

        return bDate - aDate;
      })
      .slice(0, 6);
  }, [students]);

  const membershipBreakdown = {
    semanal: students.filter((student) => student.membership_type === "semanal")
      .length,

    quincenal: students.filter(
      (student) => student.membership_type === "quincenal",
    ).length,

    mensual: students.filter((student) => student.membership_type === "mensual")
      .length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin mx-auto mb-6" />

          <p className="text-zinc-400 text-sm tracking-wide uppercase">
            Cargando dashboard premium...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Dashboard Administrativo
          </h1>

          <p className="text-zinc-400 mt-3 max-w-2xl">
            Resumen operativo en tiempo real de TXS Academia y más.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent px-5 py-4 backdrop-blur-sm">
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Sistema activo
            </p>

            <p className="text-white font-semibold">
              {activeStudents} alumnos habilitados
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card className="overflow-hidden border-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-yellow-400" />
              </div>

              <span className="text-xs text-zinc-500 uppercase tracking-widest">
                TOTAL
              </span>
            </div>

            <h2 className="text-5xl font-bold text-white">{totalStudents}</h2>

            <p className="text-zinc-500 mt-3 text-sm">
              Alumnos registrados actualmente.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>

              <span className="text-xs text-zinc-500 uppercase tracking-widest">
                ACTIVAS
              </span>
            </div>

            <h2 className="text-5xl font-bold text-white">
              {activeMemberships}
            </h2>

            <p className="text-zinc-500 mt-3 text-sm">Membresías activas.</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>

              <span className="text-xs text-zinc-500 uppercase tracking-widest">
                VENCIDAS
              </span>
            </div>

            <h2 className="text-5xl font-bold text-white">
              {expiredMemberships}
            </h2>

            <p className="text-zinc-500 mt-3 text-sm">Membresías vencidas.</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-amber-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock3 className="w-7 h-7 text-amber-400" />
              </div>

              <span className="text-xs text-zinc-500 uppercase tracking-widest">
                PENDIENTES
              </span>
            </div>

            <h2 className="text-5xl font-bold text-white">
              {pendingMemberships}
            </h2>

            <p className="text-zinc-500 mt-3 text-sm">
              Pendientes por confirmar.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Próximos vencimientos
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  Membresías que vencen en los próximos 7 días.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-red-400" />
              </div>
            </div>

            {upcomingExpirations.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-zinc-500">No hay vencimientos próximos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingExpirations.map((student) => {
                  const remaining = getDaysRemaining(
                    student.membership_end_date,
                  );

                  return (
                    <div
                      key={student.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
                    >
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {student.full_name}
                        </h3>

                        <p className="text-zinc-500 text-sm mt-1">
                          {student.group_level} •{" "}
                          {student.membership_type || "Sin membresía"}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-zinc-400">
                          Vence: {formatDate(student.membership_end_date)}
                        </p>

                        <p
                          className={`text-sm mt-2 font-semibold ${
                            remaining !== null && remaining <= 2
                              ? "text-red-400"
                              : "text-amber-400"
                          }`}
                        >
                          {remaining === 0
                            ? "Vence hoy"
                            : `${remaining} día(s) restantes`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Distribución</h2>

                <p className="text-zinc-500 text-sm mt-1">
                  Tipos de membresía.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-yellow-400" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-zinc-300">Semanal</p>

                  <p className="text-white font-semibold">
                    {membershipBreakdown.semanal}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-500"
                    style={{
                      width: `${
                        totalStudents
                          ? (membershipBreakdown.semanal / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-zinc-300">Quincenal</p>

                  <p className="text-white font-semibold">
                    {membershipBreakdown.quincenal}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{
                      width: `${
                        totalStudents
                          ? (membershipBreakdown.quincenal / totalStudents) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-zinc-300">Mensual</p>

                  <p className="text-white font-semibold">
                    {membershipBreakdown.mensual}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${
                        totalStudents
                          ? (membershipBreakdown.mensual / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-zinc-800 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="w-5 h-5 text-yellow-400" />

                  <p className="text-zinc-300 text-sm">Principiantes</p>
                </div>

                <h3 className="text-3xl font-bold text-white">{beginners}</h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BadgeDollarSign className="w-5 h-5 text-yellow-400" />

                  <p className="text-zinc-300 text-sm">Avanzados</p>
                </div>

                <h3 className="text-3xl font-bold text-white">{advanced}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Pagos recientes</h2>

              <p className="text-zinc-500 text-sm mt-1">
                Últimos movimientos registrados.
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {recentPayments.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-500">
                No existen pagos registrados todavía.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
                >
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {student.full_name}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-1">
                      {student.email}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-emerald-400 font-semibold capitalize">
                      {student.membership_type || "Sin membresía"}
                    </p>

                    <p className="text-zinc-400 text-sm mt-1">
                      Último pago: {formatDate(student.last_payment_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-500/10 bg-gradient-to-r from-red-500/5 to-transparent">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-5 md:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Atención administrativa
              </h2>

              <p className="text-zinc-400 mt-2 max-w-2xl text-sm leading-relaxed">
                Actualmente existen {expiredMemberships} membresías vencidas. Se
                recomienda actualizar pagos y renovaciones para mantener el
                control administrativo actualizado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
