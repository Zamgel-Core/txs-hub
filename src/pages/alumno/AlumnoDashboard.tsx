// 📍 Ruta del archivo: src/pages/alumno/AlumnoDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  User,
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

  return <Badge variant="neutral">Vencida</Badge>;
}

export function AlumnoDashboard() {
  const [alumno, setAlumno] = useState<Student | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementWithRead[]>([]);

  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadAlumno();
  }, []);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gold-500/10 via-txs-card to-zinc-900/80 p-8 sm:p-10 rounded-2xl border border-zinc-800/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-gold-500/20 transition-all duration-700" />

        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 mb-3 drop-shadow-md">
              ¡Hola, {getFirstName(alumno.full_name)}!
            </h1>

            <p className="text-zinc-400 text-lg font-light">
              {group ? (
                <>
                  Tu grupo actual es{" "}
                  <strong className="text-white font-medium">
                    {group.name}
                  </strong>
                  . Tienes{" "}
                  <strong className="text-white font-medium">
                    {classCount || "—"} clase(s)
                  </strong>{" "}
                  programadas según tu horario.
                </>
              ) : (
                "Aún no tienes grupo asignado."
              )}
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <Button
              variant="gold"
              className="gap-2 shadow-lg shadow-gold-500/20"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CreditCard className="w-5 h-5" />
              Pagar Membresía
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-txs-card border-zinc-800/80">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <User className="w-6 h-6 text-gold-500" />
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                Mi Cuenta
              </h2>
              <p className="text-sm text-zinc-400">
                Información personal y acceso.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-sm mb-1">Nombre</p>
              <p className="text-white font-medium">{alumno.full_name}</p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-sm mb-1">Correo</p>
              <p className="text-white font-medium break-all">{alumno.email}</p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-sm mb-1">Teléfono</p>
              <p className="text-white font-medium">{alumno.phone || "—"}</p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-sm mb-1">Grupo</p>
              <p className="text-gold-400 font-semibold">
                {group?.name || alumno.group_level || "Sin grupo"}
              </p>
              {group && (
                <p className="text-xs text-zinc-500 mt-1">
                  {group.days} • {group.schedule}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold-500" />
              <h3 className="text-white font-semibold text-lg">
                Cambiar contraseña
              </h3>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-sm mb-2">
                Contraseña temporal asignada
              </p>
              <p className="text-gold-400 font-semibold tracking-wider">
                {maskPassword(alumno.temporary_password)}
              </p>
            </div>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-gold-500"
            />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              {getMembershipBadge(alumno.membership_status)}
            </div>
            <p className="text-sm text-zinc-500">Estado Actual</p>
            <p className="text-xl font-bold text-white font-display mt-1">
              {getMembershipLabel(alumno.membership_status)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gold-500" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">Fecha de Vencimiento</p>
            <p className="text-xl font-bold text-white font-display mt-1">
              {formatDate(alumno.membership_end_date)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-zinc-300" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">Tipo de Membresía</p>
            <p className="text-xl font-bold text-white font-display mt-1 capitalize">
              {alumno.membership_type || "Pendiente"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">Asistencia Reciente</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl font-bold text-white font-display">
                {attendanceStats !== null ? `${attendanceStats}%` : "—"}
              </p>
              <span className="text-xs text-zinc-500">
                {attendanceStats !== null ? "Últimos registros" : "Sin datos"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white">
              Avisos Recientes
            </h2>

            <span className="text-sm text-zinc-500">
              {announcements.filter((item) => !item.read_at).length} nuevo(s)
            </span>
          </div>

          {announcements.length === 0 ? (
            <Card className="bg-txs-card border-zinc-800/80">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-5 h-5 text-gold-500" />
                </div>
                <p className="text-white font-semibold">Sin avisos recientes</p>
                <p className="text-sm text-zinc-500 mt-2">
                  Los comunicados publicados por administración aparecerán aquí.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.slice(0, 3).map((announcement) => (
                <Card
                  key={announcement.id}
                  className={`bg-txs-card border-zinc-800/80 ${
                    !announcement.read_at ? "border-gold-500/30" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-gold-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">
                            {announcement.title}
                          </p>

                          {!announcement.read_at && (
                            <Badge variant="default">Nuevo</Badge>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(announcement.publish_date)}
                        </p>

                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                          {announcement.body}
                        </p>

                        {!announcement.read_at && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() =>
                              handleMarkAnnouncementRead(announcement.id)
                            }
                          >
                            Marcar como leído
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white">
              Asistencia Reciente
            </h2>
          </div>

          <Card className="bg-txs-card border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/80">
                {attendance.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">
                    Sin registros de asistencia todavía.
                  </div>
                ) : (
                  attendance.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold-500" />
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {item.status}
                          </p>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">
                            {formatDate(item.attendance_date)}
                          </p>
                        </div>
                      </div>

                      <Badge variant="neutral">{item.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 mt-4">
          <h2 className="text-xl font-display font-bold text-white">
            Próximas Clases
          </h2>

          <Link to="/alumno/eventos">
            <Button
              variant="link"
              className="text-gold-500 hover:text-gold-400 text-sm h-auto p-0"
            >
              Ver calendario completo
            </Button>
          </Link>
        </div>

        <Card className="bg-txs-card border-zinc-800/80">
          <CardContent className="p-6">
            {group ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{group.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Instructor: {group.instructor}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    {group.days} • {group.schedule}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold-500" />
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-center">
                No tienes clases asignadas todavía.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        studentName={alumno?.full_name}
      />
    </div>
  );
}
