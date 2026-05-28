// 📍 Ruta del archivo: src/components/dashboard/DashboardUpcomingExpirations.tsx

import { CalendarClock } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";
import { DashboardStudent } from "@/src/services/dashboardService";
import {
  formatDashboardDate,
  getDashboardDaysRemaining,
} from "@/src/utils/dashboardFormatters";

type DashboardUpcomingExpirationsProps = {
  students: DashboardStudent[];
};

export function DashboardUpcomingExpirations({
  students,
}: DashboardUpcomingExpirationsProps) {
  return (
    <Card className="xl:col-span-2">
      <CardContent className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Próximos vencimientos
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Membresías que vencen en los próximos 7 días.
            </p>
          </div>

          <CalendarClock className="h-7 w-7 text-red-400" />
        </div>

        {students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">No hay vencimientos próximos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => {
              const remaining = getDashboardDaysRemaining(
                student.membership_end_date,
              );

              return (
                <div
                  key={student.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {student.full_name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {student.group_level} •{" "}
                      {student.membership_type || "Sin membresía"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-zinc-400">
                      Vence: {formatDashboardDate(student.membership_end_date)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-amber-400">
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
  );
}
