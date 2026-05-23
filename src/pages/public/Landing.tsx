import { Users, Music, Tent, Calendar, Sparkles, ArrowRight, GraduationCap, Camera, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";

function AnimatedStat({ value, suffix = "", decimals = 0, label, delay = 0, prefix = "", borderClasses = "" }: any) {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => prefix + latest.toFixed(decimals) + suffix);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      onViewportEnter={() => {
        if (!hasAnimated) {
          animate(count, value, { duration: 2.5, ease: [0.16, 1, 0.3, 1] });
          setHasAnimated(true);
        }
      }}
      className={`space-y-4 relative z-10 py-6 sm:py-0 border-zinc-800/50 group ${borderClasses}`}
    >
      <motion.p className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gold-300 to-gold-600 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform duration-500 will-change-transform group-hover:scale-110">
        {display}
      </motion.p>
      <p className="text-xs sm:text-sm text-zinc-400 uppercase tracking-[0.2em] font-medium group-hover:text-gold-400 transition-colors">{label}</p>
    </motion.div>
  );
}

export function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-txs-black pb-24 pt-32 md:pt-40 md:pb-40 min-h-[90vh] flex items-center">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0 bg-txs-black">
          <motion.div 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 mix-blend-screen"
            style={{ 
              backgroundImage: "url('/branding/fondo_principal_txshub.png')",
              backgroundPosition: "center right",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat"
            }}
          />
          {/* Subtle Particles/Atmosphere */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-color-dodge pointer-events-none"></div>

          {/* Gradients for depth and text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-txs-black via-txs-black/90 to-transparent md:w-2/3"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-txs-black/40 via-transparent to-txs-black"></div>
          <div className="absolute inset-y-0 left-0 w-full md:w-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-txs-black/50 to-transparent mix-blend-screen mix-blend-color-dodge"></div>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-txs-black via-txs-black/80 to-transparent"></div>
        </div>
        
        {/* Decorative Golden Glow */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
          className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none z-0"
        />
        
        <div className="container relative z-10 mx-auto max-w-7xl px-4 flex flex-col items-center xl:items-start text-center xl:text-left h-full">
          <div className="max-w-[800px] flex flex-col items-center xl:items-start pt-10 md:pt-0">
            {/* Branding Element */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 relative group cursor-default"
            >
              <div className="absolute inset-0 bg-gold-500/20 blur-[30px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img 
                src="/branding/sombrero_TSX.png" 
                alt="TXS Hats" 
                className="w-20 md:w-28 h-auto object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.6)] transform -rotate-12 group-hover:rotate-0 transition-transform duration-700 ease-out relative z-10" 
              />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-7xl sm:text-8xl md:text-[140px] font-black tracking-tighter text-white mb-6 drop-shadow-2xl leading-[0.85] uppercase"
            >
              TXS <br className="hidden xl:block" />
              <span className="text-transparent bg-clip-text bg-[linear-gradient(to_right,#FDE047,#D4AF37,#A16207)] drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] relative inline-block">
                HUB
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm mix-blend-overlay"></span>
              </span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center justify-center xl:justify-start gap-4 sm:gap-6 mb-8 flex-wrap w-full"
            >
              <div className="hidden sm:block h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>
              <p className="text-sm sm:text-xl md:text-2xl text-gold-400 font-bold tracking-[0.25em] sm:tracking-[0.4em] uppercase text-center xl:text-left drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                Academia &bull; Eventos
              </p>
              <div className="hidden sm:block h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl text-lg sm:text-xl md:text-2xl text-zinc-300 mb-12 font-light tracking-wide leading-relaxed drop-shadow-md"
            >
              Un solo lugar, <span className="font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">todas las experiencias</span>. Donde la pasión por el baile texano, la cumbia y los grandes espectáculos se encuentran en un ambiente premium.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-5 w-full xl:w-auto"
            >
              <Link to="/login" className="w-full sm:w-auto group relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                <Button variant="gold" size="lg" className="relative w-full sm:w-auto text-lg h-14 px-10 shadow-[0_0_20px_rgba(212,175,55,0.3)] font-bold tracking-wider uppercase border border-gold-400/50 transform group-hover:-translate-y-0.5 transition-all duration-300">
                  Acceder al Portal
                </Button>
              </Link>
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 font-bold tracking-wider uppercase bg-txs-card/50 backdrop-blur-md border border-zinc-700/50 hover:bg-zinc-800/80 hover:border-gold-500/50 hover:text-gold-400 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transform hover:-translate-y-0.5 transition-all duration-300 group">
                Conocer más
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Subtle scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center z-10 hidden md:flex"
        >
          <span className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase mb-2">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* Cards Section */}
      <section className="py-24 relative overflow-hidden bg-txs-black">
        {/* Stylistic visual decorators */}
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
        <div className="absolute -left-40 top-40 w-96 h-96 bg-gold-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            
            {[
              {
                icon: GraduationCap,
                title: "TXS Academia",
                desc: "Aprende a bailar con los mejores instructores. Grupos para todas las edades y niveles en un ambiente inigualable.",
                link: "Ir a Academia"
              },
              {
                icon: Camera,
                title: "TXS Producciones",
                desc: "Producción de eventos, coreografías exclusivas para XV años, bodas y espectáculos de alto nivel.",
                link: "Ir a Producciones"
              },
              {
                icon: Warehouse,
                title: "Palapa Tecolotes",
                desc: "Renta de espacios premium para tus eventos sociales, con excelente ubicación, servicios y ambiente.",
                link: "Ir a Palapa"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="h-full bg-txs-card/90 backdrop-blur-xl border border-zinc-800/80 hover:border-gold-500/50 hover:bg-txs-card transition-all duration-500 group transform hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] relative overflow-hidden">
                  <div className="absolute inset-x-0 -top-full h-full bg-gradient-to-b from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                  <CardHeader className="relative z-10 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900 border border-gold-500/10 group-hover:border-gold-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                      <card.icon className="w-8 h-8 text-gold-500 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] group-hover:text-gold-400 transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-display font-bold text-white group-hover:text-gold-400 transition-colors drop-shadow-sm tracking-wide">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 flex flex-col h-[calc(100%-112px)]">
                    <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-light mb-auto pb-6">{card.desc}</p>
                    <div className="flex items-center text-gold-500 text-sm font-bold tracking-wider uppercase group-hover:text-gold-400 transition-colors cursor-pointer mt-auto">
                      {card.link} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Cinematic Feel */}
      <section className="py-24 bg-txs-black relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-full bg-zinc-900/40 border-y border-zinc-800/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/5 to-transparent mix-blend-screen mix-blend-color-dodge"></div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center bg-txs-card/90 backdrop-blur-3xl rounded-3xl border border-zinc-800/80 p-8 sm:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] relative overflow-hidden group/container"
          >
            <div className="absolute inset-0 bg-gold-500/5 rounded-3xl pointer-events-none mix-blend-screen transition-opacity duration-1000 opacity-30 group-hover/container:opacity-80"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover/container:scale-125"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover/container:scale-125"></div>
            
            <AnimatedStat value={500} prefix="+" label="Alumnos Activos" delay={0.1} borderClasses="border-b sm:border-b-0 sm:border-r last:border-0 lg:border-b-0" />
            <AnimatedStat value={120} prefix="+" label="Eventos Inolvidables" delay={0.2} borderClasses="border-b sm:border-b-0 lg:border-r last:border-0" />
            <AnimatedStat value={15} prefix="+" label="Años de Exp." delay={0.3} borderClasses="border-b sm:border-b-0 sm:border-r last:border-0 lg:border-b-0" />
            <AnimatedStat value={4.9} decimals={1} label="Calificación" delay={0.4} borderClasses="last:border-0" />
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events Cinematographic */}
      <section className="py-24 relative overflow-hidden bg-txs-black">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-16"
          >
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-110 group-hover:bg-gold-500/20 transition-all duration-300">
                <Calendar className="w-6 h-6 text-gold-400 group-hover:text-gold-300 transition-colors" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight drop-shadow-md">
                PRÓXIMOS EVENTOS
              </h2>
            </div>
            <div className="hidden sm:block flex-1 mx-8 border-t border-dashed border-zinc-700/50"></div>
            <Button variant="outline" className="text-gold-500 hover:text-gold-400 hover:bg-gold-500/10 border-gold-500/30 uppercase tracking-widest font-bold text-xs h-12 px-6 rounded-full group hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all">
              Ver agenda completa <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row border border-zinc-800/80 rounded-2xl overflow-hidden bg-txs-card/80 backdrop-blur-md group hover:border-gold-500/50 hover:shadow-[0_15px_40px_-5px_rgba(212,175,55,0.25)] transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="bg-zinc-900/80 sm:w-40 flex sm:flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-800/80 text-center py-6 sm:p-6 gap-2 sm:gap-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <span className="text-gold-500 text-sm font-bold uppercase tracking-[0.2em] sm:mb-2 relative z-10">Junio</span>
                <span className="text-5xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 relative z-10 group-hover:from-white group-hover:to-gold-300 transition-all duration-500">20</span>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative bg-gradient-to-br from-txs-card to-zinc-900/50 overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1),_transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-gold-400 transition-colors drop-shadow-sm">Show Anual TXS 2026</h3>
                <p className="text-gold-500 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                  <Warehouse className="w-4 h-4" /> Palapa Tecolotes &bull; 20:00 hrs
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed font-light relative z-10">El gran cierre de temporada. Presentaciones exclusivas de la academia con bandas invitadas, cena especial y toda la energía texana.</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row border border-zinc-800/80 rounded-2xl overflow-hidden bg-txs-card/80 backdrop-blur-md group hover:border-gold-500/50 hover:shadow-[0_15px_40px_-5px_rgba(212,175,55,0.25)] transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="bg-zinc-900/80 sm:w-40 flex sm:flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-800/80 text-center py-6 sm:p-6 gap-2 sm:gap-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <span className="text-gold-500 text-sm font-bold uppercase tracking-[0.2em] sm:mb-2 relative z-10">Julio</span>
                <span className="text-5xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 relative z-10 group-hover:from-white group-hover:to-gold-300 transition-all duration-500">05</span>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative bg-gradient-to-br from-txs-card to-zinc-900/50 overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1),_transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-gold-400 transition-colors drop-shadow-sm">Bootcamp Intensivo</h3>
                <p className="text-gold-500 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Estudios TXS &bull; 09:00 hrs
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed font-light relative z-10">Aprende los pasos más avanzados y perfecciona tu técnica en este bootcamp de inmersión total con instructores invitados de talla internacional.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

