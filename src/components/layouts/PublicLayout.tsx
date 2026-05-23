import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/Button";
import { MapPin, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <header 
        className={`fixed top-0 inset-x-0 z-50 w-full border-b transition-all duration-500 ${
          scrolled 
            ? "border-zinc-800/80 bg-txs-black/80 backdrop-blur-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] py-1" 
            : "border-transparent bg-transparent py-3"
        }`}
      >
        <div className={`absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="container mx-auto max-w-7xl px-4 flex h-16 sm:h-[72px] items-center justify-between transition-all duration-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 relative group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="absolute -inset-4 bg-gold-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img src="/branding/logo_TSX.png" alt="TXS HUB Logo" className="h-10 sm:h-12 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] transform group-hover:scale-105 transition-transform duration-500" />
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] sm:text-xs font-bold text-zinc-300 tracking-[0.2em] uppercase">
            {["Inicio", "Academia", "Producciones", "Palapa", "Eventos"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to="/" className="hover:text-gold-400 transition-colors relative group py-2">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gold-500 blur-[2px] group-hover:w-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"></span>
                </Link>
              </motion.div>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
              <Link to="/login" className="text-xs font-bold tracking-[0.1em] text-zinc-300 hover:text-gold-400 transition-colors uppercase flex items-center gap-2 group">
                <span className="relative">
                  Iniciar sesión
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, duration: 0.5 }}>
              <Link to="/login">
                <Button variant="gold" className="relative shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-[10px] sm:text-xs font-bold h-10 px-6 rounded-full group overflow-hidden border border-gold-400/50">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 text-txs-black group-hover:text-black transition-colors">Registrarse</span>
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-gold-400 bg-txs-card/80 rounded-lg border border-zinc-800/80 transition-colors backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gold-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isMobileMenuOpen ? <X className="w-6 h-6 relative z-10" /> : <Menu className="w-6 h-6 relative z-10" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm bg-txs-card h-full border-l border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col pt-28 pb-8 px-6 overflow-y-auto relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <nav className="flex flex-col gap-2 text-lg font-medium text-zinc-300 mb-8 relative z-10">
                {["Inicio", "Academia", "Producciones", "Palapa", "Eventos"].map((item, i) => (
                  <motion.div key={item} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                    <Link to="/" className="flex items-center justify-between py-4 border-b border-zinc-800/50 hover:text-gold-400 hover:tracking-wider transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="uppercase tracking-widest text-sm font-bold">{item}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              
              <div className="flex flex-col gap-4 mt-auto relative z-10">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center text-zinc-300 hover:text-gold-400 hover:bg-gold-500/10 py-6 text-sm uppercase tracking-widest font-bold transition-all border border-zinc-800/80">Iniciar sesión</Button>
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="gold" className="w-full justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)] py-6 text-sm uppercase tracking-widest font-bold transition-all">Registrarse</Button>
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
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
        
        {/* Subtle Watermark Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.03 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"
        >
          <img src="/branding/sombrero_TSX.png" alt="TXS Pattern" className="w-[800px] h-auto grayscale" />
        </motion.div>
        
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gold-500/5 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-500/5 blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative inline-block group">
              <div className="absolute -inset-4 bg-gold-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img src="/branding/logo_TSX.png" alt="TXS Logo Footer" className="h-12 w-auto relative z-10 transition-transform duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed font-light drop-shadow-sm">
              El centro de control premium para alumnos, pagos, eventos y experiencias exclusivas de Texano Show.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-display font-semibold text-zinc-100 mb-6 tracking-wide drop-shadow-sm">Experiencias</h4>
            <ul className="space-y-3 text-sm text-zinc-400 font-light">
              <li><Link to="#" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Academia</Link></li>
              <li><Link to="#" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Producciones</Link></li>
              <li><Link to="#" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Palapa Tecolotes</Link></li>
              <li><Link to="#" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Eventos Privados</Link></li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-display font-semibold text-zinc-100 mb-6 tracking-wide drop-shadow-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-400 font-light">
              <li><Link to="/terminos" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Términos y Condiciones</Link></li>
              <li><Link to="/privacidad" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Aviso de Privacidad</Link></li>
              <li><Link to="/reglamento" className="hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Reglamento interno</Link></li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-display font-semibold text-zinc-100 mb-6 tracking-wide drop-shadow-sm">Contacto</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-light">
              <li className="flex items-start gap-3 group cursor-default">
                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-gold-500/10">
                  <MapPin className="w-4 h-4 text-gold-500 group-hover:text-gold-400 transition-colors" />
                </div>
                <span className="mt-1.5 group-hover:text-zinc-300 transition-colors">Reynosa, Tamps</span>
              </li>
              <li className="flex items-center gap-3">
                <a href="mailto:txshub@gmail.com" className="hover:text-gold-400 transition-colors cursor-pointer border-b border-transparent hover:border-gold-500/50 pb-0.5 inline-block">txshub@gmail.com</a>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10 mt-16 pt-8 border-t border-zinc-800/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-sm text-zinc-500 font-light text-center md:text-left"
            >
              © {new Date().getFullYear()} Texano Show. Todos los derechos reservados.
            </motion.div>
            
            <motion.a 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
              href="https://zamgelcore.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/30 px-5 py-3 rounded-xl transition-all duration-500 group shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src="/branding/zamgelcore-zc-logo.png" alt="Zamgel Core" className="w-6 h-6 object-contain group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-300 relative z-10" />
              <div className="flex flex-col items-start leading-none relative z-10">
                <span className="text-[10px] text-zinc-500 font-medium tracking-[0.15em] mb-1 group-hover:text-zinc-400 transition-colors">POWERED BY</span>
                <span className="text-sm text-zinc-300 font-bold tracking-wide group-hover:text-orange-400 transition-colors">Zamgel Core</span>
              </div>
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
}
