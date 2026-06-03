// 📍 Ruta del archivo: src/pages/alumno/AlumnoDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Lock,
  MapPin,
  Megaphone,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { PaymentModal } from "@/src/components/alumno/PaymentModal";
import { supabase } from "@/src/lib/supabase";
import {
  AnnouncementWithRead,
  getStudentAnnouncements,
  markAnnouncementAsRead,
} from "@/src/services/announcementsService";

type Student = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  group_level: string;
  group_id: string | null;
  temporary_password: string | null;
  is_active: boolean;
  membership_status: "activa" | "vencida" | "pendiente" | null;
  membership_type: "semanal" | "quincenal" | "mensual" | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  last_payment_date: string | null;
  payment_notes: string | null;
  annual_fee_status: "active" | "pending" | "expired" | null;
  annual_fee_paid_at: string | null;
  annual_fee_expires_at: string | null;
  annual_fee_amount: number | null;
};

type Group = {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  level: string;
  days: string | null;
};

type AttendanceRecord = {
  id: string;
  attendance_date: string;
  status: "presente" | "falta" | "retardo";
  created_at: string;
};

function formatDate(date: string | null) {
  if (!date) return "Pendiente";

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "Alumno";
}

function maskPassword(password: string | null) {
  if (!password) return "No registrada";
  if (password.length <= 4) return "••••";

  return `${password.slice(0, 4)}••••`;
}

function getMembershipLabel(status: Student["membership_status"]) {
  if (status === "activa") return "Membresía Activa";
  if (status === "pendiente") return "Membresía Pendiente";
  return "Membresía Vencida";
}

function getMembershipBadge(status: Student["membership_status"]) {
  if (status === "activa") {
    return <Badge variant="success">Al corriente</Badge>;
  }

  if (status === "pendiente") {
    return <Badge variant="warning">Pendiente</Badge>;
  }

  return <Badge variant="danger">Vencida</Badge>;
}

function getAnnualFeeLabel(status: Student["annual_fee_status"]) {
  if (status === "active") return "Anualidad Activa";
  if (status === "expired") return "Anualidad Vencida";
  return "Anualidad Pendiente";
}

function getAnnualFeeShortLabel(status: Student["annual_fee_status"]) {
  if (status === "active") return "Activa";
  if (status === "expired") return "Vencida";
  return "Pendiente";
}

function getAnnualFeeBadge(status: Student["annual_fee_status"]) {
  if (status === "active") {
    return <Badge variant="success">Anualidad Activa</Badge>;
  }

  if (status === "expired") {
    return <Badge variant="danger">Anualidad Vencida</Badge>;
  }

  return <Badge variant="warning">Anualidad Pendiente</Badge>;
}

function getAnnualFeeDisplayAmount(amount: number | null) {
  const safeAmount = typeof amount === "number" ? amount : 150;

  return safeAmount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function getAttendanceBadge(status: AttendanceRecord["status"]) {
  if (status === "presente") return <Badge variant="success">Presente</Badge>;
  if (status === "retardo") return <Badge variant="warning">Retardo</Badge>;
  return <Badge variant="danger">Falta</Badge>;
}

export function AlumnoDashboard() {
  const [alumno, setAlumno] = useState<Student | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementWithRead[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadAlumno();
  }, []);

  useEffect(() => {
    if (!alumno?.id) return;

    const refreshAlumno = () => {
      loadAlumno();
    };

    window.addEventListener("txs:membership-live-changed", refreshAlumno);

    const channel = supabase
      .channel(`student-dashboard-payments-${alumno.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `student_id=eq.${alumno.id}`,
        },
        refreshAlumno,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
          filter: `id=eq.${alumno.id}`,
        },
        refreshAlumno,
      )
      .subscribe();

    return () => {
      window.removeEventListener("txs:membership-live-changed", refreshAlumno);
      supabase.removeChannel(channel);
    };
  }, [alumno?.id]);

  useEffect(() => {
    if (!alumno?.id) return;

    const refreshAttendance = () => {
      loadAlumno();
    };

    const channel = supabase
      .channel(`student-dashboard-attendance-${alumno.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `student_id=eq.${alumno.id}`,
        },
        refreshAttendance,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [alumno?.id]);

  useEffect(() => {
    if (!alumno?.id) return;

    const handleAnnouncementsLiveChanged = () => {
      getStudentAnnouncements(alumno.id)
        .then(setAnnouncements)
        .catch((error) => {
          console.error("Error actualizando avisos del dashboard:", error);
        });
    };

    window.addEventListener(
      "txs:announcements-live-changed",
      handleAnnouncementsLiveChanged,
    );

    return () => {
      window.removeEventListener(
        "txs:announcements-live-changed",
        handleAnnouncementsLiveChanged,
      );
    };
  }, [alumno?.id]);

  async function loadAlumno() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setAlumno(null);
      setGroup(null);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .ilike("email", user.email)
      .maybeSingle();

    if (studentError || !studentData) {
      console.error(studentError);
      setAlumno(null);
      setGroup(null);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    setAlumno(studentData as Student);

    if (studentData.group_id) {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", studentData.group_id)
        .maybeSingle();

      if (groupError) {
        console.error(groupError);
        setGroup(null);
      } else {
        setGroup(groupData as Group);
      }
    } else {
      setGroup(null);
    }

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentData.id)
      .order("attendance_date", { ascending: false })
      .limit(5);

    if (attendanceError) {
      console.error(attendanceError);
      setAttendance([]);
    } else {
      setAttendance((attendanceData as AttendanceRecord[]) || []);
    }

    try {
      const announcementsData = await getStudentAnnouncements(studentData.id);
      setAnnouncements(announcementsData);
    } catch (announcementsError) {
      console.error(announcementsError);
      setAnnouncements([]);
    }

    setLoading(false);
  }

  async function handleMarkAnnouncementRead(announcementId: string) {
    if (!alumno) return;

    try {
      await markAnnouncementAsRead(announcementId, alumno.id);

      setAnnouncements((current) =>
        current.map((announcement) =>
          announcement.id === announcementId
            ? { ...announcement, read_at: new Date().toISOString() }
            : announcement,
        ),
      );

      window.dispatchEvent(new CustomEvent("txs:announcements-read-changed"));
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar el aviso como leído.");
    }
  }

  async function handleChangePassword() {
    setMessage("");

    if (!newPassword || newPassword.length < 6) {
      setMessage("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSavingPassword(false);

    if (error) {
      setMessage(error.message || "No se pudo actualizar la contraseña.");
      return;
    }

    setNewPassword("");
    setMessage("Contraseña actualizada correctamente.");
  }

  const classCount = useMemo(() => {
    if (!group?.days) return 0;

    return group.days
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean).length;
  }, [group]);

  const attendanceStats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(
      (item) => item.status === "presente",
    ).length;

    if (!total) return null;

    return Math.round((present / total) * 100);
  }, [attendance]);

  const unreadAnnouncements = useMemo(() => {
    return announcements.filter((item) => !item.read_at).length;
  }, [announcements]);

  const latestAnnouncement = announcements[0] || null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gold-400">
        Cargando información del alumno...
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center text-red-400">
        No se encontró información del alumno.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gold-500/15 via-txs-card to-black p-6 sm:p-8 shadow-[0_0_45px_rgba(212,175,55,0.08)]">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-black/30 px-3 py-1 text-xs font-semibold text-gold-400">
              <UserCheck className="h-4 w-4" />
              Portal del alumno
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600">
              ¡Hola, {getFirstName(alumno.full_name)}!
            </h1>

            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-zinc-400">
              {group ? (
                <>
                  Tu grupo actual es{" "}
                  <strong className="text-white">{group.name}</strong>. Tienes{" "}
                  <strong className="text-white">
                    {classCount || "—"} clase(s)
                  </strong>{" "}
                  programadas según tu horario.
                </>
              ) : (
                "Aún no tienes grupo asignado."
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/alumno/avisos">
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                <Bell className="h-4 w-4" />
                Avisos{" "}
                {unreadAnnouncements > 0 ? `(${unreadAnnouncements})` : ""}
              </Button>
            </Link>

            <Button
              variant="gold"
              className="w-full gap-2 shadow-lg shadow-gold-500/20 sm:w-auto"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CreditCard className="h-5 w-5" />
              Pagar Membresía
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              {getMembershipBadge(alumno.membership_status)}
            </div>

            <p className="text-sm text-zinc-500">Estado actual</p>
            <p className="mt-1 text-xl font-display font-bold text-white">
              {getMembershipLabel(alumno.membership_status)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold-500/10">
              <Calendar className="h-5 w-5 text-gold-500" />
            </div>

            <p className="text-sm text-zinc-500">Vencimiento</p>
            <p className="mt-1 text-xl font-display font-bold text-white">
              {formatDate(alumno.membership_end_date)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500/10">
                <CreditCard className="h-5 w-5 text-gold-500" />
              </div>
              {getAnnualFeeBadge(alumno.annual_fee_status)}
            </div>

            <p className="text-sm text-zinc-500">Anualidad TXS</p>
            <p className="mt-1 text-xl font-display font-bold text-white">
              {getAnnualFeeShortLabel(alumno.annual_fee_status)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {alumno.annual_fee_status === "active"
                ? `Vence: ${formatDate(alumno.annual_fee_expires_at)}`
                : `Monto: ${getAnnualFeeDisplayAmount(
                    alumno.annual_fee_amount,
                  )}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10">
              <AlertCircle className="h-5 w-5 text-blue-500" />
            </div>

            <p className="text-sm text-zinc-500">Asistencia reciente</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-xl font-display font-bold text-white">
                {attendanceStats !== null ? `${attendanceStats}%` : "—"}
              </p>
              <span className="text-xs text-zinc-500">
                {attendanceStats !== null ? "Últimos registros" : "Sin datos"}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-gold-500/25 bg-gradient-to-br from-gold-500/10 via-txs-card to-black shadow-[0_0_35px_rgba(212,175,55,0.06)]">
          <CardContent className="p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Próxima clase
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Horario asignado según tu grupo actual.
                </p>
              </div>

              <Link to="/alumno/eventos">
                <Button variant="outline" size="sm">
                  Ver clases
                </Button>
              </Link>
            </div>

            {group ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
                    <Users className="h-7 w-7 text-gold-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {getMembershipBadge(alumno.membership_status)}
                      {getAnnualFeeBadge(alumno.annual_fee_status)}
                      <Badge variant="default">Grupo asignado</Badge>
                    </div>

                    <h3 className="text-2xl font-display font-bold text-white leading-tight">
                      {group.name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      Nivel:{" "}
                      <span className="font-semibold text-gold-400">
                        {group.level || alumno.group_level || "Sin nivel"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4">
                    <Calendar className="mb-3 h-5 w-5 text-gold-400" />
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Días
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {group.days || "Por confirmar"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4">
                    <Clock3 className="mb-3 h-5 w-5 text-gold-400" />
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Horario
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {group.schedule || "Por confirmar"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4">
                    <UserCheck className="mb-3 h-5 w-5 text-gold-400" />
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Instructor
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {group.instructor || "Por confirmar"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-8 text-center">
                <Calendar className="mx-auto mb-4 h-10 w-10 text-gold-400" />
                <h3 className="text-lg font-bold text-white">
                  Aún no tienes un grupo asignado
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Cuando administración te asigne un grupo, aquí aparecerán tus
                  clases semanales.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80">
          <CardContent className="p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Avisos nuevos
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {unreadAnnouncements} comunicado(s) sin leer.
                </p>
              </div>

              <Link to="/alumno/avisos">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>

            {latestAnnouncement ? (
              <div
                className={`rounded-2xl border p-5 ${
                  latestAnnouncement.read_at
                    ? "border-zinc-800 bg-black/25"
                    : "border-gold-500/30 bg-gold-500/10"
                }`}
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
                    <Megaphone className="h-5 w-5 text-gold-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white">
                        {latestAnnouncement.title}
                      </h3>

                      {!latestAnnouncement.read_at && (
                        <Badge variant="default">Nuevo</Badge>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDate(latestAnnouncement.publish_date)}
                    </p>
                  </div>
                </div>

                <p className="line-clamp-4 text-sm leading-relaxed text-zinc-400">
                  {latestAnnouncement.body}
                </p>

                {!latestAnnouncement.read_at && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={() =>
                      handleMarkAnnouncementRead(latestAnnouncement.id)
                    }
                  >
                    Marcar como leído
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-black/25 p-8 text-center">
                <Bell className="mx-auto mb-4 h-10 w-10 text-gold-400" />
                <p className="font-semibold text-white">Sin avisos recientes</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Los comunicados publicados por administración aparecerán aquí.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="bg-txs-card border-zinc-800/80">
          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10">
                <User className="h-6 w-6 text-gold-500" />
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Mi cuenta
                </h2>
                <p className="text-sm text-zinc-400">
                  Información personal y acceso.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="mb-1 text-sm text-zinc-500">Nombre</p>
                <p className="font-medium text-white">{alumno.full_name}</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="mb-1 text-sm text-zinc-500">Correo</p>
                <p className="break-all font-medium text-white">
                  {alumno.email}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="mb-1 text-sm text-zinc-500">Teléfono</p>
                <p className="font-medium text-white">{alumno.phone || "—"}</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="mb-1 text-sm text-zinc-500">Grupo</p>
                <p className="font-semibold text-gold-400">
                  {group?.name || alumno.group_level || "Sin grupo"}
                </p>
                {group && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {group.days} • {group.schedule}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-4 md:col-span-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-zinc-400">Anualidad TXS</p>
                  {getAnnualFeeBadge(alumno.annual_fee_status)}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Estado
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {getAnnualFeeShortLabel(alumno.annual_fee_status)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Monto
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {getAnnualFeeDisplayAmount(alumno.annual_fee_amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Vence
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {formatDate(alumno.annual_fee_expires_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg font-semibold text-white">
                  Cambiar contraseña
                </h3>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="mb-2 text-sm text-zinc-500">
                  Contraseña temporal asignada
                </p>
                <p className="font-semibold tracking-wider text-gold-400">
                  {maskPassword(alumno.temporary_password)}
                </p>
              </div>

              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nueva contraseña"
                className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none transition focus:border-gold-500"
              />

              {message && <p className="text-sm text-gold-400">{message}</p>}

              <Button
                variant="gold"
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full md:w-auto"
              >
                {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-zinc-800 p-6 sm:p-7">
              <h2 className="text-2xl font-display font-bold text-white">
                Asistencia reciente
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Tus últimos registros de asistencia.
              </p>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {attendance.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  Sin registros de asistencia todavía.
                </div>
              ) : (
                attendance.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-gold-500" />
                      <div>
                        <p className="text-sm font-medium capitalize text-white">
                          {item.status}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-zinc-500">
                          {formatDate(item.attendance_date)}
                        </p>
                      </div>
                    </div>

                    {getAttendanceBadge(item.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/alumno/eventos">
          <Card className="h-full bg-txs-card border-zinc-800/80 hover:border-gold-500/30 transition-colors">
            <CardContent className="p-5">
              <Calendar className="mb-4 h-6 w-6 text-gold-400" />
              <h3 className="font-bold text-white">Clases y eventos</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Consulta tu horario y eventos próximos.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/alumno/pagos">
          <Card className="h-full bg-txs-card border-zinc-800/80 hover:border-gold-500/30 transition-colors">
            <CardContent className="p-5">
              <CreditCard className="mb-4 h-6 w-6 text-gold-400" />
              <h3 className="font-bold text-white">Historial de pagos</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Revisa pagos, membresía y vencimientos.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/alumno/soporte">
          <Card className="h-full bg-txs-card border-zinc-800/80 hover:border-gold-500/30 transition-colors">
            <CardContent className="p-5">
              <MapPin className="mb-4 h-6 w-6 text-gold-400" />
              <h3 className="font-bold text-white">Soporte</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Contacta a administración si necesitas ayuda.
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        studentName={alumno?.full_name}
      />
    </div>
  );
}
