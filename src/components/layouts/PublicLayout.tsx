// 📍 Ruta: src/components/layouts/PublicLayout.tsx

import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/Button";
import { MapPin, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PoweredByZamgel } from "@/src/components/common/PoweredByZamgel";

const navItems = [
  { label: "Inicio", path: "/" },
  { label: "Academia", path: "/academia" },
  { label: "Producciones", path: "/producciones" },
  { label: "Palapa", path: "/palapa" },
  { label: "Eventos", path: "/eventos" },
];

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-txs-black">
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full border-b transition-all duration-500 ${
          scrolled
            ? "border-zinc-800/80 bg-txs-black/80 backdrop-blur-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] py-1"
            : "border-transparent bg-transparent py-3"
        }`}
      >
        <div
          className={`absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="container mx-auto max-w-7xl px-4 flex h-16 sm:h-[72px] items-center justify-between transition-all duration-500">
          <Link
            to="/"
            className="flex items-center gap-2 relative group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="absolute -inset-4 bg-gold-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img
              src="/branding/logo_TSX.png"
              alt="TXS HUB Logo"
              className="h-10 sm:h-12 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] transform group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[11px] sm:text-xs font-bold text-zinc-300 tracking-[0.2em] uppercase">
            {navItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={item.path}
                  className="hover:text-gold-400 transition-colors relative group py-2"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-300 ease-out" />
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold-500 blur-[2px] group-hover:w-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100" />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-xs font-bold tracking-[0.1em] text-zinc-300 hover:text-gold-400 transition-colors uppercase"
            >
              Iniciar sesión
            </Link>

            <Link to="/login?mode=register">
              <Button
                variant="gold"
                className="uppercase tracking-widest text-xs font-bold h-10 px-6 rounded-full"
              >
                Registrarse
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-gold-400 bg-txs-card/80 rounded-lg border border-zinc-800/80"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-4/5 max-w-sm bg-txs-card h-full border-l border-zinc-800/80 flex flex-col pt-28 pb-8 px-6"
            >
              <nav className="flex flex-col gap-2 text-lg font-medium text-zinc-300 mb-8">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center justify-between py-4 border-b border-zinc-800/50 hover:text-gold-400 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="uppercase tracking-widest text-sm font-bold">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="flex flex-col gap-4 mt-auto">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full py-6 uppercase tracking-widest"
                  >
                    Iniciar sesión
                  </Button>
                </Link>

                <Link
                  to="/login?mode=register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="gold"
                    className="w-full py-6 uppercase tracking-widest"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="relative border-t border-zinc-800/80 bg-txs-card py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-6">
            <img
              src="/branding/logo_TSX.png"
              alt="TXS Logo Footer"
              className="h-12 w-auto"
            />
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              El centro de control premium para alumnos, pagos, eventos y
              experiencias exclusivas de Texano Show.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-zinc-100 mb-6">
              Experiencias
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <Link to="/academia" className="hover:text-gold-400">
                  Academia
                </Link>
              </li>
              <li>
                <Link to="/producciones" className="hover:text-gold-400">
                  Producciones
                </Link>
              </li>
              <li>
                <Link to="/palapa" className="hover:text-gold-400">
                  Palapa Tecolotes
                </Link>
              </li>
              <li>
                <Link to="/eventos" className="hover:text-gold-400">
                  Eventos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-zinc-100 mb-6">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <Link to="/terminos" className="hover:text-gold-400">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:text-gold-400">
                  Aviso de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/reglamento" className="hover:text-gold-400">
                  Reglamento interno
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-zinc-100 mb-6">
              Contacto
            </h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-500 mt-1" />
                Reynosa, Tamps
              </li>
              <li>
                <a
                  href="mailto:txshub@gmail.com"
                  className="hover:text-gold-400"
                >
                  txshub@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 mt-16 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>
            © {new Date().getFullYear()} Texano Show. Todos los derechos
            reservados.
          </p>
          <PoweredByZamgel />
        </div>
      </footer>
    </div>
  );
}
