// 📍 Ruta: src/pages/public/Landing.tsx

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Camera,
  GraduationCap,
  Loader2,
  Music,
  Sparkles,
  Users,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { getActiveEvents, type EventItem } from "@/src/services/eventsService";

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
      <p className="text-xs sm:text-sm text-zinc-400 uppercase tracking-[0.2em] font-medium group-hover:text-gold-400 transition-colors">
        {label}
      </p>
    </motion.div>
  );
}

function formatEventDate(date: string | null) {
  if (!date) return { day: "--", month: "Fecha por confirmar" };

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return { day: "--", month: "Fecha por confirmar" };
  }

  return {
    day: new Intl.DateTimeFormat("es-MX", { day: "2-digit" }).format(parsed),
    month: new Intl.DateTimeFormat("es-MX", { month: "long" }).format(parsed),
  };
}

function formatEventTime(time: string | null) {
  if (!time) return "Horario por confirmar";

  const match = String(time).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return "Horario por confirmar";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return "Horario por confirmar";
  }

  const parsed = new Date(2000, 0, 1, hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(parsed);
}

const experienceCards = [
  {
    icon: GraduationCap,
    title: "TXS Academia",
    desc: "Aprende a bailar con instructores reales. Grupos para todas las edades y niveles en un ambiente premium.",
    link: "Ir a Academia",
    path: "/academia",
  },
  {
    icon: Camera,
    title: "TXS Producciones",
    desc: "Producción de eventos, coreografías exclusivas para XV años, bodas y espectáculos de alto nivel.",
    link: "Ir a Producciones",
    path: "/producciones",
  },
  {
    icon: Warehouse,
    title: "Palapa Tecolotes",
    desc: "Renta de espacios premium para eventos sociales, con excelente ubicación, servicios y ambiente TXS.",
    link: "Ir a Palapa",
    path: "/palapa",
  },
];

export function Landing() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const data = await getActiveEvents();
        if (isMounted) setEvents(data.slice(0, 2));
      } catch {
        if (isMounted) setEvents([]);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-txs-black pb-24 pt-32 md:pt-40 md:pb-40 min-h-[90vh] flex items-center">
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
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-txs-black via-txs-black/90 to-transparent md:w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-b from-txs-black/40 via-transparent to-txs-black" />
          <div className="absolute inset-y-0 left-0 w-full md:w-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-txs-black/50 to-transparent mix-blend-screen" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-txs-black via-txs-black/80 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
          className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none z-0"
        />

        <div className="container relative z-10 mx-auto max-w-7xl px-4 flex flex-col items-center xl:items-start text-center xl:text-left h-full">
          <div className="max-w-[800px] flex flex-col items-center xl:items-start pt-10 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 relative group cursor-default"
            >
              <div className="absolute inset-0 bg-gold-500/20 blur-[30px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
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
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm mix-blend-overlay" />
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center justify-center xl:justify-start gap-4 sm:gap-6 mb-8 flex-wrap w-full"
            >
              <div className="hidden sm:block h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
              <p className="text-sm sm:text-xl md:text-2xl text-gold-400 font-bold tracking-[0.25em] sm:tracking-[0.4em] uppercase text-center xl:text-left drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                Academia &bull; Eventos
              </p>
              <div className="hidden sm:block h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
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
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500" />
                <Button variant="gold" size="lg" className="relative w-full sm:w-auto text-lg h-14 px-10 shadow-[0_0_20px_rgba(212,175,55,0.3)] font-bold tracking-wider uppercase border border-gold-400/50 transform group-hover:-translate-y-0.5 transition-all duration-300">
                  Acceder al Portal
                </Button>
              </Link>

              <Link to="/academia" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 font-bold tracking-wider uppercase bg-txs-card/50 backdrop-blur-md border border-zinc-700/50 hover:bg-zinc-800/80 hover:border-gold-500/50 hover:text-gold-400 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transform hover:-translate-y-0.5 transition-all duration-300 group">
                  Conocer más
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="experiencias" className="py-24 relative overflow-hidden bg-txs-black">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute -left-40 top-40 w-96 h-96 bg-gold-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {experienceCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={card.path} className="block h-full">
                  <Card className="h-full bg-txs-card/90 backdrop-blur-xl border border-zinc-800/80 hover:border-gold-500/50 hover:bg-txs-card transition-all duration-500 group transform hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] relative overflow-hidden">
                    <div className="absolute inset-x-0 -top-full h-full bg-gradient-to-b from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <CardHeader className="relative z-10 pb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900 border border-gold-500/10 group-hover:border-gold-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                        <card.icon className="w-8 h-8 text-gold-500 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] group-hover:text-gold-400 transition-colors" />
                      </div>
                      <CardTitle className="text-2xl font-display font-bold text-white group-hover:text-gold-400 transition-colors drop-shadow-sm tracking-wide">
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col h-[calc(100%-112px)]">
                      <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-light mb-auto pb-6">{card.desc}</p>
                      <div className="flex items-center text-gold-500 text-sm font-bold tracking-wider uppercase group-hover:text-gold-400 transition-colors mt-auto">
                        {card.link} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-txs-black relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-full bg-zinc-900/40 border-y border-zinc-800/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/5 to-transparent mix-blend-screen" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center bg-txs-card/90 backdrop-blur-3xl rounded-3xl border border-zinc-800/80 p-8 sm:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] relative overflow-hidden group/container"
          >
            <div className="absolute inset-0 bg-gold-500/5 rounded-3xl pointer-events-none mix-blend-screen transition-opacity duration-1000 opacity-30 group-hover/container:opacity-80" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover/container:scale-125" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover/container:scale-125" />

            <AnimatedStat value={500} prefix="+" label="Alumnos Activos" delay={0.1} borderClasses="border-b sm:border-b-0 sm:border-r last:border-0 lg:border-b-0" />
            <AnimatedStat value={120} prefix="+" label="Eventos Inolvidables" delay={0.2} borderClasses="border-b sm:border-b-0 lg:border-r last:border-0" />
            <AnimatedStat value={15} prefix="+" label="Años de Exp." delay={0.3} borderClasses="border-b sm:border-b-0 sm:border-r last:border-0 lg:border-b-0" />
            <AnimatedStat value={4.9} decimals={1} label="Calificación" delay={0.4} borderClasses="last:border-0" />
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-txs-black">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

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
            <div className="hidden sm:block flex-1 mx-8 border-t border-dashed border-zinc-700/50" />
            <Link to="/eventos">
              <Button variant="outline" className="text-gold-500 hover:text-gold-400 hover:bg-gold-500/10 border-gold-500/30 uppercase tracking-widest font-bold text-xs h-12 px-6 rounded-full group hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all">
                Ver agenda completa <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {loadingEvents && (
            <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/70 text-zinc-400">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-gold-400" /> Cargando eventos...
            </div>
          )}

          {!loadingEvents && events.length === 0 && (
            <Card className="border-gold-500/20 bg-zinc-950/80 text-center">
              <CardContent className="p-10">
                <Sparkles className="mx-auto mb-4 h-10 w-10 text-gold-400" />
                <h3 className="text-2xl font-black text-white">Agenda en preparación</h3>
                <p className="mx-auto mt-3 max-w-xl text-zinc-400">
                  Cuando el administrador publique eventos activos, aparecerán automáticamente aquí.
                </p>
                <Link to="/eventos" className="mt-6 inline-block">
                  <Button variant="gold" className="rounded-full px-7">Ir a eventos</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!loadingEvents && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((event, index) => {
                const date = formatEventDate(event.event_date);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to="/eventos" className="group flex h-full flex-col sm:flex-row border border-zinc-800/80 rounded-2xl overflow-hidden bg-txs-card/80 backdrop-blur-md hover:border-gold-500/50 hover:shadow-[0_15px_40px_-5px_rgba(212,175,55,0.25)] transition-all duration-500 transform hover:-translate-y-1">
                      <div className="bg-zinc-900/80 sm:w-40 flex sm:flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-800/80 text-center py-6 sm:p-6 gap-2 sm:gap-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <span className="text-gold-500 text-sm font-bold uppercase tracking-[0.2em] sm:mb-2 relative z-10">{date.month}</span>
                        <span className="text-5xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 relative z-10 group-hover:from-white group-hover:to-gold-300 transition-all duration-500">{date.day}</span>
                      </div>

                      <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative bg-gradient-to-br from-txs-card to-zinc-900/50 overflow-hidden">
                        <div className="absolute right-0 top-0 w-48 h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1),_transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-gold-400 transition-colors drop-shadow-sm">{event.title}</h3>
                        <p className="text-gold-500 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                          <Warehouse className="w-4 h-4" /> {event.location || "Ubicación por confirmar"} &bull; {formatEventTime(event.event_time)}
                        </p>
                        <p className="text-sm text-zinc-400 leading-relaxed font-light relative z-10 line-clamp-3">{event.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
