// 📍 Ruta del archivo: src/pages/alumno/AlumnoDashboard.tsx

import { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { mockAvisos, mockEventos } from "@/src/data";
import { supabase } from "@/src/lib/supabase";

type Student = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  group_level: "principiante" | "avanzado";
  temporary_password: string | null;
  is_active: boolean;
};

export function AlumnoDashboard() {
  const [alumno, setAlumno] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");

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
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("email", user.email)
      .maybeSingle();

    if (error) {
      console.error(error);
      setAlumno(null);
    } else {
      setAlumno(data);
    }

    setLoading(false);
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
              ¡Hola, {alumno.full_name.split(" ")[0]}!
            </h1>

            <p className="text-zinc-400 text-lg font-light">
              Es un buen día para bailar. Tienes{" "}
              <strong className="text-white font-medium">2 clases</strong>{" "}
              programadas para esta semana.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <Button
              variant="gold"
              size="lg"
              className="w-full md:w-auto gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] text-md h-12 px-8 transition-all duration-300"
            >
              <CreditCard className="w-5 h-5" /> Pagar Membresía
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
              <p className="text-gold-400 font-semibold capitalize">
                {alumno.group_level}
              </p>
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
                {alumno.temporary_password || "No registrada"}
              </p>
            </div>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-gold-500"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant="success">Al corriente</Badge>
            </div>
            <p className="text-sm text-zinc-500">Estado Actual</p>
            <p className="text-xl font-bold text-white font-display mt-1">
              Membresía Activa
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
              Pendiente
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
            <p className="text-sm text-zinc-500">Próximo Pago</p>
            <p className="text-xl font-bold text-white font-display mt-1">
              Pendiente
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
            <p className="text-sm text-zinc-500">Asistencia Mensual</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl font-bold text-white font-display">—</p>
              <span className="text-xs text-zinc-500">Sin datos aún</span>
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
            <Button
              variant="link"
              className="text-gold-500 hover:text-gold-400 text-sm h-auto p-0"
            >
              Ver todos
            </Button>
          </div>

          <div className="space-y-4">
            {mockAvisos.map((aviso) => (
              <Card
                key={aviso.id}
                className="border-l-4 border-l-gold-500 bg-txs-card border-y-zinc-800 border-r-zinc-800 hover:bg-zinc-900/50 transition-colors"
              >
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bell className="w-5 h-5 text-gold-500" />
                  </div>

                  <div>
                    <h3 className="font-bold text-white mb-1">
                      {aviso.titulo}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-2">
                      {aviso.contenido}
                    </p>
                    <p className="text-xs font-mono text-zinc-500">
                      {aviso.fecha}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                {[
                  {
                    fecha: "Pendiente",
                    clase: "Historial de asistencia",
                    estado: "Sin datos",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.clase}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                          {item.fecha}
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral">{item.estado}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 mt-4">
          <h2 className="text-xl font-display font-bold text-white">
            Próximos Eventos
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {mockEventos.map((evento, i) => (
            <Card
              key={evento.id}
              className="overflow-hidden bg-txs-card border-zinc-800 hover:border-gold-500/40 transition-all group"
            >
              <div className="h-40 w-full relative bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-t from-txs-card to-transparent z-10" />
                <img
                  src={`https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600&auto=format&fit=crop&sig=${i}`}
                  alt={evento.titulo}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 duration-500"
                />

                <div className="absolute top-4 left-4 z-20 bg-txs-black/80 backdrop-blur-md border border-zinc-700/50 rounded-lg px-3 py-2 text-center pointer-events-none">
                  <p className="text-xs font-bold text-gold-500 uppercase leading-none mb-1">
                    {new Date(evento.fecha).toLocaleString("es-ES", {
                      month: "short",
                    })}
                  </p>

                  <p className="text-2xl font-display font-bold text-white leading-none">
                    {new Date(evento.fecha).getDate() + 1}
                  </p>
                </div>
              </div>

              <CardContent className="p-5 relative z-20">
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-gold-500 transition-colors line-clamp-1">
                  {evento.titulo}
                </h3>

                <div className="space-y-2 mb-5">
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    20:00 hrs
                  </p>

                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <span className="line-clamp-1">{evento.lugar}</span>
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-zinc-700 hover:bg-gold-500 hover:text-txs-black hover:border-gold-500 transition-colors font-medium"
                >
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
