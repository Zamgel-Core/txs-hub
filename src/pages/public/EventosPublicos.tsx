// 📍 Ruta: src/pages/public/EventosPublicos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { getActiveEvents, type EventItem } from "@/src/services/eventsService";

function formatEventDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function getDateParts(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return {
    day: new Intl.DateTimeFormat("es-MX", { day: "2-digit" }).format(parsed),
    month: new Intl.DateTimeFormat("es-MX", { month: "short" }).format(parsed).replace(".", ""),
  };
}

function formatEventTime(time: string | null) {
  if (!time) return "Horario por confirmar";

  const [hours = "00", minutes = "00"] = time.split(":");
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(parsed);
}

export function EventosPublicos() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featuredEvents = useMemo(
    () => events.filter((event) => event.is_featured).slice(0, 3),
    [events],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");
        const data = await getActiveEvents();

        if (isMounted) {
          setEvents(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los eventos.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleShare(event: EventItem) {
    const eventUrl = `${window.location.origin}/eventos`;
    const text = `${event.title} — ${formatEventDate(event.event_date)}${event.location ? ` en ${event.location}` : ""}`;

    if (navigator.share) {
      await navigator.share({ title: event.title, text, url: eventUrl });
      return;
    }

    await navigator.clipboard.writeText(`${text}\n${eventUrl}`);
    setCopiedId(event.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  async function handleCopy(event: EventItem) {
    const eventUrl = `${window.location.origin}/eventos`;
    await navigator.clipboard.writeText(`${event.title}\n${formatEventDate(event.event_date)}\n${formatEventTime(event.event_time)}\n${event.location || "Ubicación por confirmar"}\n${eventUrl}`);
    setCopiedId(event.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  return (
    <div className="min-h-screen bg-txs-black text-white">
      <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.16),_transparent_42%)]" />
        <div className="absolute -left-40 top-24 h-[520px] w-[520px] rounded-full bg-gold-500/10 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />

        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-400">
              <Sparkles className="h-4 w-4" />
              Agenda TXS
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              Próximos eventos de la experiencia{" "}
              <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700 bg-clip-text text-transparent">
                TXS
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Consulta eventos publicados desde el panel administrativo: shows, presentaciones, bootcamps, convivencias y experiencias especiales.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-16">
        {loading && (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/70 text-zinc-400">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-gold-400" />
            Cargando eventos...
          </div>
        )}

        {!loading && error && (
          <Card className="border-red-500/30 bg-red-950/20">
            <CardContent className="p-8 text-center text-red-200">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card className="overflow-hidden border-gold-500/20 bg-zinc-950/80">
            <CardContent className="p-10 text-center">
              <CalendarDays className="mx-auto mb-5 h-12 w-12 text-gold-400" />
              <h2 className="text-3xl font-black">Aún no hay eventos activos</h2>
              <p className="mx-auto mt-3 max-w-xl text-zinc-400">
                Cuando el administrador publique eventos activos, aparecerán automáticamente en esta agenda pública.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-16">
            {featuredEvents.length > 0 && (
              <div>
                <div className="mb-8 flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Destacados</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl">Eventos principales</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {featuredEvents.map((event, index) => (
                    <motion.button
                      type="button"
                      key={event.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06 }}
                      onClick={() => setSelectedEvent(event)}
                      className="group overflow-hidden rounded-[2rem] border border-gold-500/20 bg-zinc-950 text-left shadow-2xl shadow-gold-500/5 transition hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-gold-500/15"
                    >
                      <div className="relative aspect-[16/10] bg-zinc-900">
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-gold-950/30">
                            <CalendarDays className="h-12 w-12 text-gold-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                        <div className="absolute left-5 top-5 rounded-2xl border border-gold-500/30 bg-black/70 px-4 py-3 text-center backdrop-blur-xl">
                          <p className="text-xs font-bold uppercase text-gold-400">{getDateParts(event.event_date).month}</p>
                          <p className="text-3xl font-black text-white">{getDateParts(event.event_date).day}</p>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-black text-white transition group-hover:text-gold-400">{event.title}</h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">{event.description}</p>
                        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-zinc-300">
                          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-gold-400" />{formatEventTime(event.event_time)}</span>
                          {event.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-400" />{event.location}</span>}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Agenda completa</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">Todos los próximos eventos</h2>

              <div className="mt-8 grid grid-cols-1 gap-5">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.04, 0.24) }}
                    className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 transition hover:border-gold-500/40 md:grid-cols-[220px_1fr]"
                  >
                    <button type="button" onClick={() => setSelectedEvent(event)} className="relative min-h-[220px] bg-zinc-900 text-left md:min-h-full">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-gold-950/30">
                          <CalendarDays className="h-12 w-12 text-gold-400" />
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-2xl border border-gold-500/30 bg-black/75 px-4 py-3 text-center backdrop-blur-xl">
                        <p className="text-xs font-bold uppercase text-gold-400">{getDateParts(event.event_date).month}</p>
                        <p className="text-3xl font-black text-white">{getDateParts(event.event_date).day}</p>
                      </div>
                    </button>

                    <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {event.is_featured && <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold-400">Destacado</span>}
                          <span className="rounded-full border border-zinc-700 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-400">{formatEventDate(event.event_date)}</span>
                        </div>

                        <button type="button" onClick={() => setSelectedEvent(event)} className="text-left">
                          <h3 className="text-2xl font-black text-white transition hover:text-gold-400 md:text-3xl">{event.title}</h3>
                        </button>
                        <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">{event.description}</p>
                      </div>

                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
                          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-gold-400" />{formatEventTime(event.event_time)}</span>
                          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-400" />{event.location || "Ubicación por confirmar"}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {event.maps_url && (
                            <a href={event.maps_url} target="_blank" rel="noreferrer">
                              <Button variant="outline" className="rounded-full border-gold-500/30 text-gold-400">
                                Ubicación <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          <Button variant="outline" onClick={() => handleCopy(event)} className="rounded-full border-zinc-700 text-zinc-200">
                            {copiedId === event.id ? <Check className="mr-2 h-4 w-4 text-gold-400" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copiar
                          </Button>
                          <Button variant="gold" onClick={() => setSelectedEvent(event)} className="rounded-full">
                            Ver detalles <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[2rem] border border-gold-500/25 bg-zinc-950 shadow-2xl shadow-gold-500/10"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-[16/8] min-h-[260px] bg-zinc-900">
                {selectedEvent.image_url ? (
                  <img src={selectedEvent.image_url} alt={selectedEvent.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-gold-950/30">
                    <CalendarDays className="h-16 w-16 text-gold-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/20 to-transparent" />
                <button type="button" onClick={() => setSelectedEvent(null)} className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/60 p-3 text-white backdrop-blur-xl transition hover:bg-white hover:text-black" aria-label="Cerrar evento">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedEvent.is_featured && <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold-400">Destacado</span>}
                  <span className="rounded-full border border-zinc-700 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-400">{formatEventDate(selectedEvent.event_date)}</span>
                </div>

                <h2 className="text-3xl font-black text-white md:text-5xl">{selectedEvent.title}</h2>
                <p className="mt-5 whitespace-pre-line leading-relaxed text-zinc-300">{selectedEvent.description}</p>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-black/35 p-5">
                    <Clock3 className="mb-3 h-5 w-5 text-gold-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Hora</p>
                    <p className="mt-1 font-semibold text-white">{formatEventTime(selectedEvent.event_time)}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-black/35 p-5">
                    <MapPin className="mb-3 h-5 w-5 text-gold-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ubicación</p>
                    <p className="mt-1 font-semibold text-white">{selectedEvent.location || "Ubicación por confirmar"}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {selectedEvent.maps_url && (
                    <a href={selectedEvent.maps_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="rounded-full border-gold-500/30 text-gold-400">
                        Abrir ubicación <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={() => handleCopy(selectedEvent)} className="rounded-full border-zinc-700 text-zinc-200">
                    {copiedId === selectedEvent.id ? <Check className="mr-2 h-4 w-4 text-gold-400" /> : <Copy className="mr-2 h-4 w-4" />}
                    Copiar datos
                  </Button>
                  <Button variant="gold" onClick={() => handleShare(selectedEvent)} className="rounded-full">
                    <Share2 className="mr-2 h-4 w-4" /> Compartir
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
