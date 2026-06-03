// 📍 Ruta: src/pages/shared/MiPerfil.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Copy,
  HeartPulse,
  IdCard,
  Loader2,
  Lock,
  CalendarDays,
  Phone,
  Save,
  Shield,
  Upload,
  User,
  Users,
} from "lucide-react";

import {
  BaseProfile,
  ExtendedProfile,
  getMyProfileBundle,
  saveMyExtendedProfile,
  StudentSummary,
  updateMyBaseProfile,
  uploadProfilePhoto,
} from "@/src/services/profileService";

type MiPerfilProps = {
  mode: "admin" | "alumno";
};

const MAX_IMAGE_SIZE = 1024 * 1024;

const bloodTypes = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "TX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDate(date: string | null) {
  if (!date) return "Sin fecha";

  const safeDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(safeDate.getTime())) return "Sin fecha";

  return safeDate.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMembershipStyle(status?: string | null) {
  if (status === "activa")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "pendiente")
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-red-500/30 bg-red-500/10 text-red-300";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/10 ${props.className || ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full resize-y rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/10 ${props.className || ""}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/10 ${props.className || ""}`}
    />
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-sm font-semibold text-zinc-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function MiPerfil({ mode }: MiPerfilProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);

  const [baseProfile, setBaseProfile] = useState<BaseProfile | null>(null);
  const [student, setStudent] = useState<StudentSummary | null>(null);
  const [extended, setExtended] = useState<ExtendedProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const displayName =
    fullName || student?.full_name || baseProfile?.full_name || "Perfil TXS";
  const avatarUrl =
    extended?.profile_photo_url || baseProfile?.avatar_url || null;
  const qrValue =
    mode === "alumno" && student?.qr_token
      ? `${window.location.origin}/admin/escaner?token=${student.qr_token}`
      : extended?.qr_code_value ||
        `TXS-${mode.toUpperCase()}:${baseProfile?.id || "perfil"}`;

  const profileCompletion = useMemo(() => {
    if (!extended) return 0;

    const values = [
      fullName,
      phone,
      extended.birth_date,
      extended.address,
      extended.blood_type,
      extended.emergency_contact_name,
      extended.emergency_contact_phone,
      extended.allergies,
      extended.medications,
      extended.medical_conditions,
    ];

    const completed = values.filter(
      (value) => String(value || "").trim().length > 0,
    ).length;
    return Math.round((completed / values.length) * 100);
  }, [extended, fullName, phone]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);

      const bundle = await getMyProfileBundle();

      setBaseProfile(bundle.baseProfile);
      setStudent(bundle.student);
      setExtended(bundle.extendedProfile);
      setFullName(
        bundle.baseProfile?.full_name || bundle.student?.full_name || "",
      );
      setPhone(bundle.baseProfile?.phone || bundle.student?.phone || "");
    } catch (loadError) {
      console.error("Error cargando perfil:", loadError);
      setError(
        "No se pudo cargar tu perfil. Revisa la sesión o los permisos de Supabase.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateExtended<K extends keyof ExtendedProfile>(
    key: K,
    value: ExtendedProfile[K],
  ) {
    setExtended((current) => {
      if (!current) return current;
      return { ...current, [key]: value };
    });
  }

  async function handleSave() {
    if (!extended || !baseProfile?.id) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updateMyBaseProfile({
        profileId: baseProfile.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: extended.profile_photo_url || baseProfile.avatar_url,
      });

      const saved = await saveMyExtendedProfile({
        ...extended,
        profile_id: baseProfile.id,
        student_id: student?.id || extended.student_id || null,
        qr_code_value:
          extended.qr_code_value ||
          `TXS-${mode.toUpperCase()}:${student?.id || baseProfile.id}`,
      });

      setExtended(saved);
      setBaseProfile((current) =>
        current
          ? {
              ...current,
              full_name: fullName.trim(),
              phone: phone.trim(),
              avatar_url: saved.profile_photo_url || current.avatar_url,
            }
          : current,
      );
      setSuccess("Perfil actualizado correctamente.");
    } catch (saveError) {
      console.error("Error guardando perfil:", saveError);
      setError(
        "No se pudo guardar el perfil. Revisa los permisos RLS o intenta nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleImageSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file || !baseProfile?.id || !extended) return;

    setImageWarning(null);
    setError(null);
    setSuccess(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setImageWarning("Usa una imagen JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageWarning(
        "La imagen pesa más de 1 MB. Comprímela antes de subirla para no saturar el almacenamiento.",
      );
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const publicUrl = await uploadProfilePhoto({
        profileId: baseProfile.id,
        file,
      });

      const updatedExtended = {
        ...extended,
        profile_photo_url: publicUrl,
      };

      setExtended(updatedExtended);
      setBaseProfile((current) =>
        current ? { ...current, avatar_url: publicUrl } : current,
      );

      await updateMyBaseProfile({
        profileId: baseProfile.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: publicUrl,
      });

      const saved = await saveMyExtendedProfile(updatedExtended);
      setExtended(saved);
      setSuccess("Foto de perfil actualizada.");
    } catch (uploadError) {
      console.error("Error subiendo foto:", uploadError);
      setError(
        "No se pudo subir la foto. Revisa el bucket profile-photos y sus policies.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleCopyQr() {
    try {
      await navigator.clipboard.writeText(qrValue);
      setSuccess("Código copiado al portapapeles.");
    } catch {
      setError("No se pudo copiar el código.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/70 px-6 py-4 text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!extended) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
        No se pudo inicializar el perfil extendido.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-gold-500/20 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-5 shadow-2xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-500/5 blur-3xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative mx-auto h-36 w-36 flex-shrink-0 sm:mx-0">
              <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-2xl" />
              <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-gold-500/50 bg-zinc-900 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-500 to-amber-700 text-4xl font-black text-black">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/50 bg-black text-gold-400 shadow-xl transition hover:bg-gold-500 hover:text-black"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelected}
              />
            </div>

            <div className="text-center sm:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                <IdCard className="h-3.5 w-3.5" />
                Mi Perfil TXS
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {displayName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Información personal, datos médicos importantes, contacto de
                emergencia y credencial digital para futuras funciones de
                asistencia automática.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs font-semibold text-zinc-300">
                  {mode === "admin" ? "Administrador TXS" : "Alumno TXS"}
                </span>

                {student?.membership_status && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getMembershipStyle(student.membership_status)}`}
                  >
                    Membresía {student.membership_status}
                  </span>
                )}

                <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-300">
                  Perfil {profileCompletion}% completo
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <div className="rounded-3xl bg-white p-4">
                <QRCodeSVG value={qrValue} size={150} level="M" includeMargin />
              </div>

              <div className="w-full min-w-0 text-center sm:text-left lg:text-center xl:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                  Credencial digital
                </p>
                <p className="mt-2 break-all rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-300">
                  {qrValue}
                </p>
                <button
                  type="button"
                  onClick={handleCopyQr}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-xs font-bold text-gold-300 transition hover:bg-gold-500 hover:text-black"
                >
                  <Copy className="h-4 w-4" />
                  Copiar código
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(error || success || imageWarning) && (
        <div className="space-y-3">
          {success && (
            <div className="flex items-start gap-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {imageWarning && (
            <div className="flex flex-col gap-3 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Upload className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>{imageWarning}</span>
              </div>
              <a
                href="https://www.iloveimg.com/es/comprimir-imagen"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-amber-400/30 px-4 py-2 text-center text-xs font-bold text-amber-100 transition hover:bg-amber-400 hover:text-black"
              >
                Comprimir imagen
              </a>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={IdCard}
          label="Perfil completado"
          value={`${profileCompletion}%`}
        />
        <InfoCard
          icon={HeartPulse}
          label="Tipo de sangre"
          value={extended.blood_type || "Sin registrar"}
        />
        <InfoCard
          icon={Phone}
          label="Emergencia"
          value={extended.emergency_contact_phone || "Sin registrar"}
        />
        <InfoCard
          icon={CalendarDays}
          label="Vencimiento"
          value={formatDate(student?.membership_end_date || null)}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Datos personales
              </h2>
              <p className="text-sm text-zinc-500">
                Información básica de contacto.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel>Nombre completo</FieldLabel>
              <TextInput
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Teléfono</FieldLabel>
              <TextInput
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Teléfono"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Correo</FieldLabel>
              <TextInput
                value={baseProfile?.email || student?.email || ""}
                disabled
                className="cursor-not-allowed opacity-70"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Fecha de nacimiento</FieldLabel>
              <TextInput
                type="date"
                value={extended.birth_date || ""}
                onChange={(event) =>
                  updateExtended("birth_date", event.target.value || null)
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <FieldLabel>Dirección</FieldLabel>
              <TextInput
                value={extended.address || ""}
                onChange={(event) =>
                  updateExtended("address", event.target.value)
                }
                placeholder="Dirección completa"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Información TXS</h2>
              <p className="text-sm text-zinc-500">
                Datos internos para academia.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-black/30 p-4">
              <p className="text-xs text-zinc-500">ID de alumno</p>
              <p className="mt-1 break-all text-sm font-semibold text-zinc-200">
                {student?.id || "No vinculado a students"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={Users}
                label="Nivel / grupo"
                value={student?.group_level || "Sin grupo"}
              />
              <InfoCard
                icon={Lock}
                label="Vencimiento"
                value={formatDate(student?.membership_end_date || null)}
              />
            </div>

            <div className="rounded-3xl border border-gold-500/20 bg-gold-500/10 p-4 text-sm leading-6 text-gold-100">
              Este código podrá usarse más adelante para asistencia automática
              mediante escáner, lector QR o cámara del dispositivo.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/[0.04] p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Información médica
              </h2>
              <p className="text-sm text-zinc-500">
                Útil ante lesiones, accidentes o emergencias.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <FieldLabel>Tipo de sangre</FieldLabel>
              <SelectInput
                value={extended.blood_type || ""}
                onChange={(event) =>
                  updateExtended("blood_type", event.target.value || null)
                }
              >
                {bloodTypes.map((bloodType) => (
                  <option key={bloodType} value={bloodType}>
                    {bloodType || "Seleccionar"}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="space-y-2">
              <FieldLabel>Alergias</FieldLabel>
              <TextArea
                value={extended.allergies || ""}
                onChange={(event) =>
                  updateExtended("allergies", event.target.value)
                }
                placeholder="Ej. Penicilina, mariscos, látex..."
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Medicamentos</FieldLabel>
              <TextArea
                value={extended.medications || ""}
                onChange={(event) =>
                  updateExtended("medications", event.target.value)
                }
                placeholder="Medicamentos actuales o de uso importante"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Condiciones médicas</FieldLabel>
              <TextArea
                value={extended.medical_conditions || ""}
                onChange={(event) =>
                  updateExtended("medical_conditions", event.target.value)
                }
                placeholder="Lesiones, asma, presión, diabetes, etc."
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Contacto de emergencia
              </h2>
              <p className="text-sm text-zinc-500">
                Persona a contactar si ocurre algo en clase.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <FieldLabel>Nombre del contacto</FieldLabel>
              <TextInput
                value={extended.emergency_contact_name || ""}
                onChange={(event) =>
                  updateExtended("emergency_contact_name", event.target.value)
                }
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Teléfono de emergencia</FieldLabel>
              <TextInput
                value={extended.emergency_contact_phone || ""}
                onChange={(event) =>
                  updateExtended("emergency_contact_phone", event.target.value)
                }
                placeholder="Teléfono"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Relación</FieldLabel>
              <TextInput
                value={extended.emergency_contact_relationship || ""}
                onChange={(event) =>
                  updateExtended(
                    "emergency_contact_relationship",
                    event.target.value,
                  )
                }
                placeholder="Mamá, papá, pareja, hermano..."
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Notas importantes</FieldLabel>
              <TextArea
                value={extended.emergency_notes || ""}
                onChange={(event) =>
                  updateExtended("emergency_notes", event.target.value)
                }
                placeholder="Indicaciones especiales en caso de emergencia"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Privacidad y funciones futuras
            </h2>
            <p className="text-sm text-zinc-500">
              Dejamos preparada la base para perfil público, amigos, puntos y
              reconocimiento por clase.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-300">
            <span>
              <span className="block font-semibold text-zinc-100">
                Mostrar foto en perfil público
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Cuando activemos perfiles públicos o amigos, esta opción
                controlará si tu foto puede mostrarse.
              </span>
            </span>
            <input
              type="checkbox"
              checked={extended.public_show_photo}
              onChange={(event) =>
                updateExtended("public_show_photo", event.target.checked)
              }
            />
          </label>

          <div className="rounded-3xl border border-gold-500/20 bg-gold-500/10 p-4 text-sm leading-6 text-gold-100">
            <p className="font-bold text-gold-300">
              Sistema de progreso pendiente
            </p>
            <p className="mt-1">
              Los niveles y puntos se definirán con el cliente. La idea queda
              enfocada en asistencia, desempeño en clase, puntos otorgados por
              maestro/admin y mensajes de motivación, no necesariamente en
              categorías como principiante o intermedio.
            </p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 px-6 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(212,175,55,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Guardar perfil
        </button>
      </div>
    </div>
  );
}
