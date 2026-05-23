import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Users, LayoutDashboard, User } from "lucide-react";
import { motion } from "motion/react";

export function Login() {
  const [role, setRole] = useState<'admin' | 'instructor' | 'alumno'>('alumno');
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (role === 'admin') navigate('/admin');
    else navigate('/alumno');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-txs-black relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-txs-black to-txs-black pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-color-dodge pointer-events-none"></div>
      
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150px] bg-gold-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          <Link to="/" className="inline-block relative z-10 group">
            <div className="absolute -inset-4 bg-gold-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="/branding/logo_TSX.png" alt="TXS HUB Logo" className="h-20 sm:h-24 w-auto mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-500 relative z-10" />
          </Link>
          <p className="text-zinc-400 mt-6 font-light tracking-wide">Accede a tu portal exclusivo</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="bg-txs-card/90 backdrop-blur-2xl border-zinc-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <CardContent className="p-6 sm:p-8 relative z-10">
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('alumno')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 ${
                      role === 'alumno' 
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-105' 
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <Users className={`w-5 h-5 transition-transform duration-300 ${role === 'alumno' ? 'scale-110' : ''}`} />
                    <span>Alumno</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('instructor')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 ${
                      role === 'instructor' 
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-105' 
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <User className={`w-5 h-5 transition-transform duration-300 ${role === 'instructor' ? 'scale-110' : ''}`} />
                    <span>Instructor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 ${
                      role === 'admin' 
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-105' 
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <LayoutDashboard className={`w-5 h-5 transition-transform duration-300 ${role === 'admin' ? 'scale-110' : ''}`} />
                    <span>Admin</span>
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Correo Electrónico</label>
                    <Input type="email" placeholder="correo@ejemplo.com" required className="border-zinc-700/50 bg-zinc-900/50 h-12 focus:border-gold-500/50 focus:ring-gold-500/20 transition-all font-sans" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Contraseña</label>
                      <Link to="#" className="text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors">¿Olvidaste tu contraseña?</Link>
                    </div>
                    <Input type="password" placeholder="••••••••" required className="border-zinc-700/50 bg-zinc-900/50 h-12 focus:border-gold-500/50 focus:ring-gold-500/20 transition-all" />
                  </div>
                </div>

                <Button type="submit" variant="gold" className="w-full h-12 text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] group overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 transition-colors duration-300 text-txs-black group-hover:text-black">Iniciar Sesión</span>
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-zinc-500">
                <Link to="/" className="inline-flex items-center gap-2 hover:text-gold-400 transition-colors font-medium group">
                  <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Regresar al inicio
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
