// 📍 Ruta del archivo: src/components/dashboard/DashboardAdminAlert.tsx

import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";

type DashboardAdminAlertProps = {
  expiredMemberships: number;
};

export function DashboardAdminAlert({
  expiredMemberships,
}: DashboardAdminAlertProps) {
  if (expiredMemberships <= 0) return null;

  return (
    <Card className="border-red-500/10 bg-gradient-to-r from-red-500/5 to-transparent">
      <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Atención administrativa
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Actualmente existen {expiredMemberships} membresías vencidas. Se
              recomienda actualizar pagos y renovaciones.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
