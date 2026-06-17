// 📍 Ruta del archivo: src/pages/auth/Login.tsx

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  Eye,
  EyeOff,
  Users,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/src/lib/supabase";

const TXS_WHATSAPP_NUMBER = "528991019210";

function normalizePhone(value: string) {
  return value.replace(/[^0-9+]/g, "").trim();
}

function buildRegistrationMessage({
  fullName,
  email,
  phone,
  password,
}: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  return `Hola TXS Academy.

Quiero solicitar mi registro al portal de alumnos TXS HUB.

Nombre completo:
${fullName}

Teléfono:
${phone}

Correo:
${email}

Contraseña solicitada:
${password}

Quedo pendiente de validación por administración.`;
}

export function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [selectedRole, setSelectedRole] = useState<"alumno" | "admin">(
    "alumno",
  );

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMode(searchParams.get("mode") === "register" ? "register" : "login");
  }, [searchParams]);

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");

    if (nextMode === "register") {
      setSearchParams({ mode: "register" });
      return;
    }

    setSearchParams({});
  }

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const cleanFullName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = normalizePhone(phone);
        const cleanPassword = password.trim();

        if (!cleanFullName || !cleanEmail || !cleanPhone || !cleanPassword) {
          throw new Error("Completa nombre, teléfono, correo y contraseña.");
        }

        if (cleanPassword.length < 6) {
          throw new Error("La contraseña debe tener mínimo 6 caracteres.");
        }

        const whatsappMessage = buildRegistrationMessage({
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          password: cleanPassword,
        });

        const internalMessage = `Nueva solicitud de registro desde el portal público.

Nombre completo:
${cleanFullName}

Teléfono:
${cleanPhone}

Correo:
${cleanEmail}

Contraseña solicitada:
${cleanPassword}

Acción sugerida:
Revisar la solicitud, crear o validar al alumno en Supabase/Auth y responder por WhatsApp.`;

        const { error: messageError } = await supabase.from("messages").insert({
          student_id: null,
          sender_email: cleanEmail,
          sender_name: cleanFullName,
          category: "otro",
          subject: "Nueva solicitud de registro TXS HUB",
          message: internalMessage,
          status: "pendiente",
        });

        if (messageError) {
          console.error(messageError);
          throw new Error(
            "No se pudo enviar la solicitud al buzón interno. Revisa la policy de mensajes públicos en Supabase.",
          );
        }

        window.open(
          `https://wa.me/${TXS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
            whatsappMessage,
          )}`,
          "_blank",
          "noopener,noreferrer",
        );

        setMessage(
          "Solicitud enviada al buzón interno. También se abrió WhatsApp para completar el registro.",
        );
        setFullName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        throw new Error("No se encontró el usuario.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        throw new Error("Error obteniendo perfil.");
      }

      if (!profile) {
        throw new Error("Perfil no encontrado.");
      }

      if (!profile.is_active) {
        throw new Error("Tu cuenta está desactivada.");
      }

      if (
        selectedRole === "admin" &&
        profile.role !== "admin" &&
        profile.role !== "moderator" &&
        profile.role !== "staff"
      ) {
        await supabase.auth.signOut();
        throw new Error("Este usuario no pertenece al portal admin.");
      }

      if (selectedRole === "alumno" && profile.role !== "alumno") {
        await supabase.auth.signOut();
        throw new Error("Este usuario no pertenece al portal alumno.");
      }

      if (
        profile.role === "admin" ||
        profile.role === "moderator" ||
        profile.role === "staff"
      ) {
        navigate("/admin");
        return;
      }

      if (profile.role === "alumno") {
        navigate("/alumno");
        return;
      }

      throw new Error("Rol inválido.");
    } catch (error) {
      const authError = error as Error;
      setMessage(authError.message || "Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-txs-black relative overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-txs-black to-txs-black pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-color-dodge pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="w-full max-w-md z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 relative"
        >
          <Link to="/" className="inline-block relative z-10 group">
            <img
              src="/branding/logo_TSX.png"
              alt="TXS HUB Logo"
              className="h-20 sm:h-24 w-auto mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          <p className="text-zinc-400 mt-6 font-light tracking-wide">
            {mode === "login"
              ? "Accede a tu portal exclusivo"
              : "Solicita tu cuenta de alumno por WhatsApp"}
          </p>
        </motion.div>

        <Card className="bg-txs-card/90 backdrop-blur-2xl border-zinc-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => changeMode("login")}
                className={`rounded-xl border p-3 text-sm font-bold transition-all ${
                  mode === "login"
                    ? "border-gold-500 bg-gold-500/10 text-gold-400"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => changeMode("register")}
                className={`rounded-xl border p-3 text-sm font-bold transition-all ${
                  mode === "register"
                    ? "border-gold-500 bg-gold-500/10 text-gold-400"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              {mode === "login" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("alumno")}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedRole === "alumno"
                        ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-105"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Alumno</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("admin")}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedRole === "admin"
                        ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-105"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Admin</span>
                  </button>
                </div>
              )}

              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                      Nombre completo
                    </label>
                    <Input
                      type="text"
                      placeholder="Nombre del alumno"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                      Número de teléfono
                    </label>
                    <Input
                      type="tel"
                      placeholder="Ej. 8991019210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                  Correo electrónico
                </label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-gold-400"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    title={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-4 text-sm text-gold-200">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
                    <p>
                      Al enviar tu solicitud, se guardará en la bandeja interna
                      del admin y se abrirá WhatsApp para completar el registro.
                    </p>
                  </div>
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-3 text-sm text-gold-300">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                variant="gold"
                disabled={loading}
                className="w-full h-12 text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              >
                {loading
                  ? "Procesando..."
                  : mode === "login"
                    ? "Iniciar sesión"
                    : "Enviar registro"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-zinc-500">
              <Link
                to="/"
                className="inline-flex items-center gap-2 hover:text-gold-400 transition-colors font-medium group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform">
                  &larr;
                </span>{" "}
                Regresar al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
