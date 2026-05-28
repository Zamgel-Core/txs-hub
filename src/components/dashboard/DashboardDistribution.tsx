// 📍 Ruta del archivo: src/components/dashboard/DashboardDistribution.tsx

import { GraduationCap, ReceiptText } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";

type DashboardDistributionProps = {
  totalStudents: number;
  beginners: number;
  advanced: number;
  membershipBreakdown: {
    semanal: number;
    quincenal: number;
    mensual: number;
  };
};

export function DashboardDistribution({
  totalStudents,
  beginners,
  advanced,
  membershipBreakdown,
}: DashboardDistributionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-white">Distribución</h2>
        <p className="mt-1 text-sm text-zinc-500">Tipos de membresía.</p>

        <div className="mt-8 space-y-5">
          {Object.entries(membershipBreakdown).map(([type, count]) => (
            <div key={type}>
              <div className="mb-2 flex items-center justify-between">
                <p className="capitalize text-zinc-300">{type}</p>
                <p className="font-semibold text-white">{count}</p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-yellow-500"
                  style={{
                    width: `${totalStudents ? (count / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <GraduationCap className="mb-3 h-5 w-5 text-yellow-400" />
            <p className="text-sm text-zinc-400">Principiantes</p>
            <h3 className="mt-2 text-3xl font-bold text-white">{beginners}</h3>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <ReceiptText className="mb-3 h-5 w-5 text-yellow-400" />
            <p className="text-sm text-zinc-400">Avanzados</p>
            <h3 className="mt-2 text-3xl font-bold text-white">{advanced}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
