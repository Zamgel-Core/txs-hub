// 📍 Ruta del archivo: src/components/dashboard/DashboardRecentPayments.tsx

import { Wallet } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";
import {
  DashboardPayment,
  DashboardStudent,
} from "@/src/services/dashboardService";
import {
  formatDashboardCurrency,
  formatDashboardDate,
} from "@/src/utils/dashboardFormatters";

type DashboardRecentPaymentsProps = {
  payments: DashboardPayment[];
  studentMap: Map<string, DashboardStudent>;
};

export function DashboardRecentPayments({
  payments,
  studentMap,
}: DashboardRecentPaymentsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Pagos recientes</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Últimos movimientos registrados en historial real.
            </p>
          </div>

          <Wallet className="h-7 w-7 text-emerald-400" />
        </div>

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">
              No existen pagos registrados todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const student = studentMap.get(payment.student_id);

              return (
                <div
                  key={payment.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {student?.full_name || "Alumno no encontrado"}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {payment.concept} • {payment.method}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="font-semibold text-emerald-400">
                      {formatDashboardCurrency(Number(payment.amount || 0))}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatDashboardDate(payment.payment_date)}
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
