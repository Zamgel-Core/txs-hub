// 📍 Ruta del archivo: src/pages/admin/AdminDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import { Cake, CalendarDays, Loader2 } from "lucide-react";

import { DashboardAdminAlert } from "@/src/components/dashboard/DashboardAdminAlert";
import { DashboardDistribution } from "@/src/components/dashboard/DashboardDistribution";
import { DashboardHeader } from "@/src/components/dashboard/DashboardHeader";
import { DashboardIncomeCards } from "@/src/components/dashboard/DashboardIncomeCards";
import { DashboardRecentPayments } from "@/src/components/dashboard/DashboardRecentPayments";
import { DashboardSummaryCards } from "@/src/components/dashboard/DashboardSummaryCards";
import { DashboardUpcomingExpirations } from "@/src/components/dashboard/DashboardUpcomingExpirations";
import { useAdminDashboard } from "@/src/hooks/useAdminDashboard";
import { supabase } from "@/src/lib/supabase";

interface BirthdayStudent {
  id: string;
  full_name: string;
  birth_date: string | null;
}

interface UpcomingBirthday extends BirthdayStudent {
  nextBirthday: Date;
  daysUntil: number;
}

function getNextBirthdayInfo(birthDate?: string | null) {
  if (!birthDate) return null;

  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);

  if (!birthYear || !birthMonth || !birthDay) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birthMonth - 1, birthDay);
    nextBirthday.setHours(0, 0, 0, 0);
  }

  const diffMs = nextBirthday.getTime() - today.getTime();
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    nextBirthday,
    daysUntil,
  };
}

function formatBirthdayDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getBirthdayLabel(daysUntil: number) {
  if (daysUntil === 0) return "Hoy";
  if (daysUntil === 1) return "Mañana";
  if (daysUntil <= 7) return `En ${daysUntil} días`;
  return `En ${daysUntil} días`;
}

function DashboardUpcomingBirthdays() {
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);

  useEffect(() => {
    loadBirthdays();
  }, []);

  async function loadBirthdays() {
    setLoadingBirthdays(true);

    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, birth_date")
      .eq("is_active", true)
      .not("birth_date", "is", null);

    if (error) {
      console.error(error);
      setBirthdays([]);
      setLoadingBirthdays(false);
      return;
    }

    const upcoming = (data || [])
      .map((student) => {
        const birthdayInfo = getNextBirthdayInfo(student.birth_date);

        if (!birthdayInfo) return null;

        return {
          ...student,
          nextBirthday: birthdayInfo.nextBirthday,
          daysUntil: birthdayInfo.daysUntil,
        };
      })
      .filter(Boolean) as UpcomingBirthday[];

    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    setBirthdays(upcoming.slice(0, 6));
    setLoadingBirthdays(false);
  }

  const birthdaysThisWeek = useMemo(
    () => birthdays.filter((student) => student.daysUntil <= 7).length,
    [birthdays],
  );

  const nextBirthday = birthdays[0];

  return (
    <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0b0b0b] to-[#160d16] p-5 sm:p-6 shadow-2xl shadow-amber-900/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
            <Cake className="h-3.5 w-3.5" />
            Cumpleaños
          </div>

          <h2 className="text-xl font-black text-white">Próximos cumpleaños</h2>

          <p className="mt-1 text-sm text-amber-200/80">
            {birthdaysThisWeek > 0
              ? `${birthdaysThisWeek} alumno(s) cumplen esta semana.`
              : "No hay cumpleaños esta semana. Próximos cumpleaños registrados:"}
          </p>
        </div>

        <button
          onClick={loadBirthdays}
          className="rounded-xl border border-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/10"
        >
          Actualizar
        </button>
      </div>

      {!loadingBirthdays && birthdays.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-300/70">
              Registrados
            </p>
            <p className="mt-1 text-xl font-black text-white">
              {birthdays.length}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-widest text-yellow-300/70">
              Esta semana
            </p>
            <p className="mt-1 text-xl font-black text-yellow-300">
              {birthdaysThisWeek}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/70">
              Próximo
            </p>
            <p className="mt-1 text-xl font-black text-emerald-300">
              {nextBirthday ? `${nextBirthday.daysUntil}d` : "--"}
            </p>
          </div>
        </div>
      )}

      {loadingBirthdays ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-amber-500/10 bg-black/30">
          <Loader2 className="h-6 w-6 animate-spin text-amber-300" />
        </div>
      ) : birthdays.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-500/15 bg-black/30 p-6 text-center">
          <Cake className="mx-auto mb-3 h-8 w-8 text-amber-400/40" />
          <p className="text-sm font-semibold text-amber-200">
            Todavía no hay fechas de nacimiento registradas.
          </p>
          <p className="mt-1 text-xs text-amber-300/60">
            Pide a los alumnos actualizar su perfil.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {birthdays.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] p-4 transition hover:border-amber-500/25"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {student.full_name}
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-amber-200/70">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatBirthdayDate(student.nextBirthday)}
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${
                  student.daysUntil <= 7
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                }`}
              >
                {getBirthdayLabel(student.daysUntil)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AdminDashboard() {
  const { loading, refreshing, stats } = useAdminDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando dashboard real...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <DashboardHeader
        activeStudents={stats.activeStudents}
        refreshing={refreshing}
      />

      <DashboardSummaryCards
        totalStudents={stats.totalStudents}
        activeMemberships={stats.activeMemberships}
        expiredMemberships={stats.expiredMemberships}
        pendingMemberships={stats.pendingMemberships}
      />

      <DashboardIncomeCards
        incomeToday={stats.incomeToday}
        incomeMonth={stats.incomeMonth}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <DashboardUpcomingExpirations students={stats.upcomingExpirations} />

        <DashboardDistribution
          totalStudents={stats.totalStudents}
          beginners={stats.beginners}
          advanced={stats.advanced}
          membershipBreakdown={stats.membershipBreakdown}
        />

        <DashboardUpcomingBirthdays />
      </div>

      <DashboardRecentPayments
        payments={stats.recentPayments}
        studentMap={stats.studentMap}
      />

      <DashboardAdminAlert expiredMemberships={stats.expiredMemberships} />
    </div>
  );
}
