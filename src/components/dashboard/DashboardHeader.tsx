// 📍 Ruta del archivo: src/components/dashboard/DashboardHeader.tsx

import { Loader2, TrendingUp } from "lucide-react";

type DashboardHeaderProps = {
  activeStudents: number;
  refreshing: boolean;
};

export function DashboardHeader({
  activeStudents,
  refreshing,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Dashboard Administrativo
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Métricas reales de alumnos, pagos, membresías y vencimientos de TXS.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
          {refreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
          ) : (
            <TrendingUp className="h-5 w-5 text-yellow-400" />
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Sistema activo
          </p>
          <p className="font-semibold text-white">
            {activeStudents} alumnos habilitados
          </p>
        </div>
      </div>
    </div>
  );
}
