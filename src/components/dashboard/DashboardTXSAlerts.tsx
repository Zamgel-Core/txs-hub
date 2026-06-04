// 📍 Ruta del archivo: src/components/dashboard/DashboardTXSAlerts.tsx

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  Flame,
  Loader2,
  RefreshCw,
  Target,
} from "lucide-react";

import {
  getTXSIntelligentAlerts,
  TXSIntelligentAlerts,
} from "@/src/services/txsAlertsService";

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/30 p-5 text-center">
      <p className="text-sm font-semibold text-zinc-400">{text}</p>
    </div>
  );
}

export function DashboardTXSAlerts() {
  const [data, setData] = useState<TXSIntelligentAlerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const alerts = await getTXSIntelligentAlerts();
      setData(alerts);
    } catch (error) {
      console.error("Error cargando alertas TXS:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const totalAlerts =
    (data?.nearLevelUp.length || 0) +
    (data?.missingWeeklyEvaluation.length || 0) +
    (data?.monthlyHighlights.length || 0);

  return (
    <section className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#080808] via-black to-yellow-950/10 p-5 shadow-2xl shadow-yellow-900/10 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Alertas inteligentes
          </div>

          <h2 className="text-xl font-black text-white">TXS Radar</h2>

          <p className="mt-1 text-sm text-yellow-200/80">
            Señales rápidas para dar seguimiento sin revisar alumno por alumno.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 px-3 py-2 text-xs font-bold text-yellow-300 transition hover:bg-yellow-500/10 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-yellow-500/10 bg-black/30">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-300" />
        </div>
      ) : !data ? (
        <EmptyState text="No se pudieron cargar las alertas TXS." />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-widest text-yellow-300/70">
                Cerca de subir
              </p>
              <p className="mt-1 text-2xl font-black text-yellow-300">
                {data.nearLevelUp.length}
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/15 bg-sky-500/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-widest text-sky-300/70">
                Sin evaluación
              </p>
              <p className="mt-1 text-2xl font-black text-sky-300">
                {data.missingWeeklyEvaluation.length}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-widest text-orange-300/70">
                Destacados
              </p>
              <p className="mt-1 text-2xl font-black text-orange-300">
                {data.monthlyHighlights.length}
              </p>
            </div>
          </div>

          {totalAlerts === 0 ? (
            <EmptyState text="Todo tranquilo por ahora. No hay alertas TXS importantes." />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-300" />
                  <h3 className="font-black text-white">
                    Cerca de subir nivel
                  </h3>
                </div>

                {data.nearLevelUp.length === 0 ? (
                  <EmptyState text="Ningún alumno está a 10 puntos o menos." />
                ) : (
                  <div className="space-y-3">
                    {data.nearLevelUp.map((student) => (
                      <div
                        key={student.student_id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-bold text-white">
                            {student.full_name}
                          </p>
                          <span className="shrink-0 text-sm font-black text-yellow-300">
                            faltan {student.points_to_next_level}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {student.current_level_name} →{" "}
                          {student.next_level_name || "Máximo nivel"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-sky-500/15 bg-black/30 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-sky-300" />
                  <h3 className="font-black text-white">
                    Sin evaluación semanal
                  </h3>
                </div>

                {data.missingWeeklyEvaluation.length === 0 ? (
                  <EmptyState text="Todos los alumnos activos tienen evaluación esta semana." />
                ) : (
                  <div className="space-y-3">
                    {data.missingWeeklyEvaluation.map((student) => (
                      <div
                        key={student.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
                      >
                        <p className="truncate font-bold text-white">
                          {student.full_name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Pendiente de evaluación esta semana.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-orange-500/15 bg-black/30 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <h3 className="font-black text-white">Destacados del mes</h3>
                </div>

                {data.monthlyHighlights.length === 0 ? (
                  <EmptyState text="Todavía no hay puntos generados este mes." />
                ) : (
                  <div className="space-y-3">
                    {data.monthlyHighlights.map((student, index) => (
                      <div
                        key={student.student_id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-bold text-white">
                            #{index + 1} {student.full_name}
                          </p>
                          <span className="shrink-0 text-sm font-black text-orange-300">
                            +{student.monthly_points}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {student.current_level_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
