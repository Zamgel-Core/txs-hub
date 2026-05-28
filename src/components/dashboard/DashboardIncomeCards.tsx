// 📍 Ruta del archivo: src/components/dashboard/DashboardIncomeCards.tsx

import { BadgeDollarSign, Wallet } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";
import { formatDashboardCurrency } from "@/src/utils/dashboardFormatters";

type DashboardIncomeCardsProps = {
  incomeToday: number;
  incomeMonth: number;
};

export function DashboardIncomeCards({
  incomeToday,
  incomeMonth,
}: DashboardIncomeCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Card className="border-emerald-500/10">
        <CardContent className="p-6">
          <Wallet className="mb-5 h-8 w-8 text-emerald-400" />
          <p className="text-sm text-zinc-500">Ingresos de hoy</p>
          <h2 className="mt-2 text-4xl font-bold text-white">
            {formatDashboardCurrency(incomeToday)}
          </h2>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/10">
        <CardContent className="p-6">
          <BadgeDollarSign className="mb-5 h-8 w-8 text-yellow-400" />
          <p className="text-sm text-zinc-500">Ingresos del mes</p>
          <h2 className="mt-2 text-4xl font-bold text-white">
            {formatDashboardCurrency(incomeMonth)}
          </h2>
        </CardContent>
      </Card>
    </div>
  );
}
