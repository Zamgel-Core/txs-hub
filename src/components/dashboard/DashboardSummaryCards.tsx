// 📍 Ruta del archivo: src/components/dashboard/DashboardSummaryCards.tsx

import { CheckCircle2, Clock3, Users, XCircle } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";

type DashboardSummaryCardsProps = {
  totalStudents: number;
  activeMemberships: number;
  expiredMemberships: number;
  pendingMemberships: number;
};

export function DashboardSummaryCards({
  totalStudents,
  activeMemberships,
  expiredMemberships,
  pendingMemberships,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-yellow-500/10">
        <CardContent className="p-6">
          <Users className="mb-5 h-8 w-8 text-yellow-400" />
          <p className="text-sm text-zinc-500">Total alumnos</p>
          <h2 className="mt-2 text-5xl font-bold text-white">
            {totalStudents}
          </h2>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/10">
        <CardContent className="p-6">
          <CheckCircle2 className="mb-5 h-8 w-8 text-emerald-400" />
          <p className="text-sm text-zinc-500">Membresías activas</p>
          <h2 className="mt-2 text-5xl font-bold text-white">
            {activeMemberships}
          </h2>
        </CardContent>
      </Card>

      <Card className="border-red-500/10">
        <CardContent className="p-6">
          <XCircle className="mb-5 h-8 w-8 text-red-400" />
          <p className="text-sm text-zinc-500">Membresías vencidas</p>
          <h2 className="mt-2 text-5xl font-bold text-white">
            {expiredMemberships}
          </h2>
        </CardContent>
      </Card>

      <Card className="border-amber-500/10">
        <CardContent className="p-6">
          <Clock3 className="mb-5 h-8 w-8 text-amber-400" />
          <p className="text-sm text-zinc-500">Pendientes</p>
          <h2 className="mt-2 text-5xl font-bold text-white">
            {pendingMemberships}
          </h2>
        </CardContent>
      </Card>
    </div>
  );
}
