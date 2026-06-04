// 📍 Ruta del archivo: src/components/admin/StudentDetailsModal.tsx

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  AlertTriangle,
  GraduationCap,
  HeartPulse,
  Clock3,
  Loader2,
  Phone,
  PlusCircle,
  Save,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";

interface StudentSummary {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  group_level?: string | null;
  membership_status?: string | null;
  membership_type?: string | null;
  membership_end_date?: string | null;
  annual_fee_status?: string | null;
  annual_fee_expires_at?: string | null;
  birth_date?: string | null;
  qr_token?: string | null;
}

interface GroupInfo {
  name: string;
  schedule: string;
  days?: string | null;
  level?: string | null;
}

interface TXSProgressSummary {
  student_id: string;
  total_points: number;
  current_level: number;
  current_level_name: string;
  badge_label?: string | null;
  next_level?: number | null;
  next_level_name?: string | null;
  next_level_min_points?: number | null;
  points_to_next_level: number;
}

interface TXSPointLedgerItem {
  id: string;
  source_type: string;
  points: number;
  reason: string;
  created_at: string;
}

interface ExtendedProfile {
  id?: string;
  student_id?: string | null;
  birth_date?: string | null;
  address?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  medications?: string | null;
  medical_conditions?: string | null;
  emergency_notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  qr_code_value?: string | null;
}

interface StudentDetailsModalProps {
  student: StudentSummary;
  groupInfo: GroupInfo;
  planName: string;
  onClose: () => void;
}

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined) return "No registrado";

  const cleanValue = String(value).trim();
  return cleanValue ? cleanValue : "No registrado";
}

function formatDateLocal(date?: string | null) {
  if (!date) return "No registrado";

  const cleanDate = String(date).trim();
  const dateOnly = cleanDate.includes("T")
    ? cleanDate.split("T")[0]
    : cleanDate;
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) return "No registrado";

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return "No registrado";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getStatusLabel(status?: string | null) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "activa" || normalized === "active") return "Activa";
  if (normalized === "vencida" || normalized === "expired") return "Vencida";
  if (normalized === "pending") return "Pendiente";
  if (normalized === "pausada") return "Pausada";
  if (normalized === "cancelada") return "Cancelada";

  return "No registrado";
}

function getTXSSourceLabel(sourceType?: string | null) {
  const labels: Record<string, string> = {
    attendance: "Asistencia",
    evaluation: "Evaluación",
    recognition: "Reconocimiento",
    payment: "Pago puntual",
    annual_fee: "Anualidad",
    manual_adjustment: "Ajuste manual",
    system_bonus: "Bonus TXS",
  };

  return labels[String(sourceType || "")] || "Movimiento TXS";
}

function getTXSLevelPercent(progress?: TXSProgressSummary | null) {
  if (!progress) return 0;
  if (!progress.next_level_min_points) return 100;

  const currentLevelStart = Math.max(
    progress.next_level_min_points -
      progress.points_to_next_level -
      progress.total_points,
    0,
  );

  const levelRange = progress.next_level_min_points - currentLevelStart;
  const pointsInLevel = progress.total_points - currentLevelStart;

  if (levelRange <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, Math.round((pointsInLevel / levelRange) * 100)),
  );
}

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p
        className={
          highlight
            ? "font-black text-yellow-300"
            : "font-semibold text-zinc-100"
        }
      >
        {formatValue(value)}
      </p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  tone = "yellow",
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  tone?: "yellow" | "red" | "emerald" | "blue";
}) {
  const toneClass = {
    yellow: "border-yellow-500/20 bg-yellow-500/[0.03] text-yellow-400",
    red: "border-red-500/20 bg-red-500/[0.03] text-red-400",
    emerald: "border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400",
    blue: "border-blue-500/20 bg-blue-500/[0.03] text-blue-300",
  }[tone];

  return (
    <section className={`rounded-3xl border p-5 ${toneClass}`}>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-current/25 bg-black/30">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function StudentDetailsModal({
  student,
  groupInfo,
  planName,
  onClose,
}: StudentDetailsModalProps) {
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [txsProgress, setTXSProgress] = useState<TXSProgressSummary | null>(
    null,
  );
  const [txsHistory, setTXSHistory] = useState<TXSPointLedgerItem[]>([]);
  const [adjustmentPoints, setAdjustmentPoints] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  async function loadProfile() {
    setLoading(true);

    const [profileResponse, progressResponse, historyResponse] =
      await Promise.all([
        supabase
          .from("user_extended_profiles")
          .select("*")
          .eq("student_id", student.id)
          .maybeSingle(),
        supabase
          .from("student_txs_progress_summary")
          .select(
            "student_id, total_points, current_level, current_level_name, badge_label, next_level, next_level_name, next_level_min_points, points_to_next_level",
          )
          .eq("student_id", student.id)
          .maybeSingle(),
        supabase
          .from("student_points_ledger")
          .select("id, source_type, points, reason, created_at")
          .eq("student_id", student.id)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

    if (profileResponse.error) {
      console.error(profileResponse.error);
      setProfile(null);
    } else {
      setProfile(profileResponse.data || null);
    }

    if (progressResponse.error) {
      console.error(progressResponse.error);
      setTXSProgress(null);
    } else {
      setTXSProgress(
        (progressResponse.data || null) as TXSProgressSummary | null,
      );
    }

    if (historyResponse.error) {
      console.error(historyResponse.error);
      setTXSHistory([]);
    } else {
      setTXSHistory((historyResponse.data || []) as TXSPointLedgerItem[]);
    }

    setLoading(false);
  }

  async function handleManualAdjustment() {
    const points = Number(adjustmentPoints);
    const reason = adjustmentReason.trim();

    if (!Number.isFinite(points) || points === 0) {
      alert("Ingresa una cantidad de puntos diferente de 0.");
      return;
    }

    if (!reason) {
      alert("Agrega un motivo para el ajuste de puntos.");
      return;
    }

    try {
      setSavingAdjustment(true);

      const { error } = await supabase.from("student_points_ledger").insert({
        student_id: student.id,
        source_type: "manual_adjustment",
        source_id: `manual:${student.id}:${Date.now()}`,
        points,
        reason,
        metadata: {
          origin: "admin_student_detail",
          adjustment_type: points > 0 ? "positive" : "negative",
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setAdjustmentPoints(1);
      setAdjustmentReason("");
      await loadProfile();
      alert("Ajuste de puntos guardado correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el ajuste de puntos.");
    } finally {
      setSavingAdjustment(false);
    }
  }

  const birthDate = profile?.birth_date || student.birth_date;
  const qrValue = profile?.qr_code_value || student.qr_token;
  const txsLevelPercent = getTXSLevelPercent(txsProgress);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#080808] shadow-2xl shadow-yellow-900/10">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-900 px-5 py-5 sm:px-7">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-yellow-300">
              <Shield className="h-3.5 w-3.5" />
              Detalle del alumno
            </div>
            <h2 className="text-2xl font-black text-white">
              {student.full_name}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Información personal, médica y de emergencia capturada desde el
              portal del alumno.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400"
            aria-label="Cerrar detalles"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-110px)] overflow-y-auto px-5 py-6 sm:px-7">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-zinc-900 bg-black/30">
              <Loader2 className="h-7 w-7 animate-spin text-yellow-400" />
            </div>
          ) : (
            <div className="space-y-5">
              <SectionCard
                icon={<User className="h-5 w-5" />}
                title="Datos personales"
                subtitle="Información básica y de contacto."
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DetailItem
                    label="Nombre completo"
                    value={student.full_name}
                  />
                  <DetailItem label="Correo" value={student.email} />
                  <DetailItem label="Teléfono" value={student.phone} />
                  <DetailItem
                    label="Fecha de nacimiento"
                    value={formatDateLocal(birthDate)}
                  />
                  <div className="md:col-span-2">
                    <DetailItem label="Dirección" value={profile?.address} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={<HeartPulse className="h-5 w-5" />}
                title="Información médica"
                subtitle="Datos importantes para accidentes, alergias o emergencias."
                tone="red"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DetailItem
                    label="Tipo de sangre"
                    value={profile?.blood_type}
                    highlight
                  />
                  <DetailItem label="Alergias" value={profile?.allergies} />
                  <DetailItem
                    label="Medicamentos"
                    value={profile?.medications}
                  />
                  <DetailItem
                    label="Condiciones médicas"
                    value={profile?.medical_conditions}
                  />
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Notas de emergencia"
                      value={profile?.emergency_notes}
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={<Phone className="h-5 w-5" />}
                title="Contacto de emergencia"
                subtitle="Persona autorizada para contactar si ocurre algo en clase."
                tone="emerald"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <DetailItem
                    label="Nombre"
                    value={profile?.emergency_contact_name}
                  />
                  <DetailItem
                    label="Teléfono"
                    value={profile?.emergency_contact_phone}
                    highlight
                  />
                  <DetailItem
                    label="Relación"
                    value={profile?.emergency_contact_relationship}
                  />
                </div>
              </SectionCard>

              <SectionCard
                icon={<GraduationCap className="h-5 w-5" />}
                title="Información TXS"
                subtitle="Datos internos de academia, grupo, membresía y credencial."
                tone="blue"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DetailItem label="Grupo" value={groupInfo.name} />
                  <DetailItem
                    label="Horario"
                    value={`${groupInfo.days || ""} ${groupInfo.schedule || ""}`.trim()}
                  />
                  <DetailItem
                    label="Nivel"
                    value={groupInfo.level || student.group_level}
                  />
                  <DetailItem label="Plan" value={planName} />
                  <DetailItem
                    label="Membresía"
                    value={`${getStatusLabel(student.membership_status)} · Vence ${formatDateLocal(student.membership_end_date)}`}
                  />
                  <DetailItem
                    label="Anualidad"
                    value={`${getStatusLabel(student.annual_fee_status)} · Vence ${formatDateLocal(student.annual_fee_expires_at)}`}
                  />
                  <div className="md:col-span-2">
                    <DetailItem label="Valor QR / Credencial" value={qrValue} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={<Trophy className="h-5 w-5" />}
                title="Progreso TXS"
                subtitle="Nivel, puntos e historial de crecimiento del alumno."
                tone="yellow"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <DetailItem
                    label="Nivel TXS"
                    value={txsProgress?.current_level_name || "Nivel 1"}
                    highlight
                  />
                  <DetailItem
                    label="Puntos TXS"
                    value={txsProgress?.total_points ?? 0}
                    highlight
                  />
                  <DetailItem
                    label="Siguiente nivel"
                    value={
                      txsProgress?.next_level_name
                        ? `${txsProgress.next_level_name} · faltan ${txsProgress.points_to_next_level}`
                        : "Máximo nivel"
                    }
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-yellow-300/80">
                    <span>Avance al siguiente nivel</span>
                    <span>{txsLevelPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${txsLevelPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                    <PlusCircle className="h-4 w-4 text-yellow-400" />
                    Ajuste manual de puntos
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr_auto] md:items-end">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Puntos
                      </span>
                      <input
                        type="number"
                        value={adjustmentPoints}
                        onChange={(event) =>
                          setAdjustmentPoints(Number(event.target.value))
                        }
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-sm font-bold text-white outline-none transition focus:border-yellow-400/60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Motivo
                      </span>
                      <input
                        value={adjustmentReason}
                        onChange={(event) =>
                          setAdjustmentReason(event.target.value)
                        }
                        placeholder="Ej. Torneo interno, apoyo en clase, corrección administrativa"
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/60"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleManualAdjustment}
                      disabled={savingAdjustment}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 text-sm font-black text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingAdjustment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    Usa valores positivos para sumar y negativos para corregir o
                    restar puntos.
                  </p>
                </div>

                <div className="mt-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                    <Clock3 className="h-4 w-4 text-yellow-400" />
                    Últimos movimientos
                  </div>

                  {txsHistory.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/30 p-4 text-sm text-zinc-500">
                      Aún no hay movimientos de puntos registrados.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {txsHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-black/30 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                              {item.reason}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {getTXSSourceLabel(item.source_type)} ·{" "}
                              {formatDateLocal(item.created_at)}
                            </p>
                          </div>

                          <span
                            className={
                              item.points >= 0
                                ? "font-black text-yellow-300"
                                : "font-black text-red-400"
                            }
                          >
                            {item.points > 0 ? "+" : ""}
                            {item.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>

              {!profile && (
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                  <div className="mb-1 flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    Perfil extendido no encontrado
                  </div>
                  Pide al alumno entrar a Mi Perfil y guardar sus datos
                  personales para completar esta sección.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
