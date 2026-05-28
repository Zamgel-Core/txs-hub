// 📍 Ruta del archivo: src/pages/admin/AdminDashboard.tsx

import { Loader2 } from "lucide-react";

import { DashboardAdminAlert } from "@/src/components/dashboard/DashboardAdminAlert";
import { DashboardDistribution } from "@/src/components/dashboard/DashboardDistribution";
import { DashboardHeader } from "@/src/components/dashboard/DashboardHeader";
import { DashboardIncomeCards } from "@/src/components/dashboard/DashboardIncomeCards";
import { DashboardRecentPayments } from "@/src/components/dashboard/DashboardRecentPayments";
import { DashboardSummaryCards } from "@/src/components/dashboard/DashboardSummaryCards";
import { DashboardUpcomingExpirations } from "@/src/components/dashboard/DashboardUpcomingExpirations";
import { useAdminDashboard } from "@/src/hooks/useAdminDashboard";

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
      </div>

      <DashboardRecentPayments
        payments={stats.recentPayments}
        studentMap={stats.studentMap}
      />

      <DashboardAdminAlert expiredMemberships={stats.expiredMemberships} />
    </div>
  );
}
