// 📍 Ruta del archivo: src/pages/auth/Login.tsx

import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Users, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/src/lib/supabase";

export function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<"alumno" | "admin">(
    "alumno",
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Registro como solicitud manual
      if (mode === "register") {
        const subject = encodeURIComponent(
          "Nueva solicitud de registro TXS HUB",
        );

        const body = encodeURIComponent(`
Nueva solicitud de registro TXS HUB

Nombre completo:
${fullName}

Correo:
${email}

Contraseña solicitada:
${password}

Mensaje:
Solicito acceso al portal de alumnos TXS HUB.

Pendiente de validación por administración.
`);

        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=registro@txshub.com&su=${subject}&body=${body}`,
          "_blank",
        );

        setMessage(
          "Se abrirá tu aplicación de correo para enviar la solicitud.",
        );

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

      if (selectedRole === "admin" && profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Este usuario no pertenece al portal admin.");
      }

      if (selectedRole === "alumno" && profile.role !== "alumno") {
        await supabase.auth.signOut();
        throw new Error("Este usuario no pertenece al portal alumno.");
      }

      if (profile.role === "admin") {
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
    <div className="min-h-screen flex items-center justify-center bg-txs-black relative overflow-hidden px-4">
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
              : "Crea tu cuenta de alumno"}
          </p>
        </motion.div>

        <Card className="bg-txs-card/90 backdrop-blur-2xl border-zinc-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setMode("login")}
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
                onClick={() => setMode("register")}
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

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
                    : "Enviar solicitud"}
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
