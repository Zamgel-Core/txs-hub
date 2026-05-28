// 📍 Ruta del archivo: src/pages/alumno/AlumnoEventos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Share2,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { EventItem, getActiveEvents } from "@/src/services/eventsService";

function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonth(date: string) {
  return new Date(`${date}T00:00:00`)
    .toLocaleDateString("es-MX", { month: "short" })
    .replace(".", "");
}

function getDay(date: string) {
  return new Date(`${date}T00:00:00`).getDate();
}

function getEventDate(date: string) {
  const eventDate = new Date(`${date}T00:00:00`);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDaysUntil(date: string) {
  const diff = getEventDate(date).getTime() - getToday().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getEventStatus(event: EventItem) {
  const days = getDaysUntil(event.event_date);

  if (days < 0) {
    return {
      label: "Finalizado",
      className: "border-zinc-700 bg-zinc-800 text-zinc-300",
    };
  }

  if (days === 0) {
    return {
      label: "Hoy",
      className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    };
  }

  if (days <= 7) {
    return {
      label: `Faltan ${days} día(s)`,
      className: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",
    };
  }

  return {
    label: "Próximo",
    className: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  };
}

function buildShareText(event: EventItem) {
  const parts = [
    `🔥 ${event.title}`,
    `${formatEventDate(event.event_date)}${
      event.event_time ? ` • ${event.event_time}` : ""
    }`,
    event.location ? `📍 ${event.location}` : "",
    event.description,
    event.maps_url ? `Ubicación: ${event.maps_url}` : "",
  ];

  return parts.filter(Boolean).join("\n");
}

async function copyToClipboard(text: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert(successMessage);
  } catch (error) {
    console.error("Error copiando:", error);
    alert("No se pudo copiar.");
  }
}

type EventDetailModalProps = {
  event: EventItem | null;
  onClose: () => void;
};

function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const status = getEventStatus(event);
  const shareText = buildShareText(event);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: shareText,
          url: event?.maps_url || window.location.href,
        });
        return;
      }

      await copyToClipboard(shareText, "Evento copiado para compartir.");
    } catch (error) {
      console.error("Error compartiendo evento:", error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-6">
        <div className="relative w-full overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950 shadow-2xl shadow-yellow-500/10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur transition hover:border-yellow-500/40 hover:text-yellow-300"
            aria-label="Cerrar detalle del evento"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative bg-black">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-full max-h-[82vh] w-full object-contain lg:min-h-[640px]"
                />
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                  <span className="text-sm font-bold uppercase text-yellow-400">
                    {getMonth(event.event_date)}
                  </span>
                  <span className="text-7xl font-black text-white">
                    {getDay(event.event_date)}
                  </span>
                </div>
              )}

              {event.is_featured && (
                <div className="absolute left-5 top-5">
                  <Badge className="border-yellow-500/30 bg-yellow-500/20 text-yellow-300">
                    <Star className="mr-1 h-3 w-3" />
                    Destacado
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-6 md:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge className={status.className}>{status.label}</Badge>

                {event.is_featured && (
                  <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Evento especial
                  </Badge>
                )}
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {event.title}
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-zinc-300">
                {event.description}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                  <Calendar className="mb-3 h-5 w-5 text-yellow-400" />
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Fecha
                  </p>
                  <p className="mt-1 font-semibold capitalize text-white">
                    {formatEventDate(event.event_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                  <Clock3 className="mb-3 h-5 w-5 text-yellow-400" />
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Hora
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {event.event_time || "Por confirmar"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4 sm:col-span-2">
                  <MapPin className="mb-3 h-5 w-5 text-yellow-400" />
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Ubicación
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {event.location || "Ubicación por confirmar"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {event.maps_url && (
                  <a href={event.maps_url} target="_blank" rel="noreferrer">
                    <Button variant="gold" className="w-full gap-2 sm:w-auto">
                      <ExternalLink className="h-4 w-4" />
                      Ver ubicación
                    </Button>
                  </a>
                )}

                <Button
                  variant="outline"
                  className="gap-2 border-zinc-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>

                {event.maps_url && (
                  <Button
                    variant="outline"
                    className="gap-2 border-zinc-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                    onClick={() =>
                      copyToClipboard(
                        event.maps_url || "",
                        "Link de ubicación copiado.",
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                    Copiar ubicación
                  </Button>
                )}

                {event.image_url && (
                  <a href={event.image_url} target="_blank" rel="noreferrer">
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:w-auto"
                    >
                      Ver flyer completo
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type EventCardProps = {
  event: EventItem;
  onOpen: (event: EventItem) => void;
  featured?: boolean;
};

function EventCard({ event, onOpen, featured = false }: EventCardProps) {
  const status = getEventStatus(event);

  return (
    <Card
      className={`group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-500/10 ${
        featured
          ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-zinc-950"
          : "border-zinc-800 bg-zinc-950/80 hover:border-yellow-500/30"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(event)}
        onKeyDown={(eventKey) => {
          if (eventKey.key === "Enter" || eventKey.key === " ") {
            onOpen(event);
          }
        }}
        className="block w-full cursor-pointer text-left"
      >
        <div className={featured ? "grid grid-cols-1 lg:grid-cols-2" : ""}>
          <div
            className={`relative overflow-hidden bg-zinc-900 ${
              featured ? "min-h-[320px]" : "h-56"
            }`}
          >
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                <span className="text-sm font-bold uppercase text-yellow-400">
                  {getMonth(event.event_date)}
                </span>
                <span className="text-6xl font-bold text-white">
                  {getDay(event.event_date)}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {event.is_featured && (
                <Badge className="border-yellow-500/30 bg-yellow-500/20 text-yellow-300">
                  <Star className="mr-1 h-3 w-3" />
                  Destacado
                </Badge>
              )}

              <Badge className={status.className}>{status.label}</Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4 lg:hidden">
              <h3 className="line-clamp-2 text-2xl font-black text-white">
                {event.title}
              </h3>
            </div>
          </div>

          <CardContent
            className={`flex flex-col ${
              featured ? "justify-center p-7 md:p-8" : "p-6"
            }`}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-yellow-400">
              <span className="flex items-center gap-2 capitalize">
                <Calendar className="h-4 w-4" />
                {featured
                  ? formatEventDate(event.event_date)
                  : formatShortDate(event.event_date)}
              </span>

              {event.event_time && (
                <span className="flex items-center gap-2 text-zinc-400">
                  <Clock3 className="h-4 w-4" />
                  {event.event_time}
                </span>
              )}
            </div>

            <h2
              className={`line-clamp-2 font-bold text-white ${
                featured ? "hidden text-3xl lg:block" : "text-xl"
              }`}
            >
              {event.title}
            </h2>

            <p
              className={`mt-3 text-sm leading-relaxed text-zinc-400 ${
                featured ? "line-clamp-4" : "line-clamp-3"
              }`}
            >
              {event.description}
            </p>

            <div className="mt-5 flex items-center gap-2 border-t border-zinc-800 pt-4 text-sm text-zinc-300">
              <MapPin className="h-4 w-4 shrink-0 text-yellow-400" />
              <span className="line-clamp-1">
                {event.location || "Ubicación por confirmar"}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button variant="gold" className="w-full sm:w-auto">
                Ver detalle
              </Button>

              {event.maps_url && (
                <a
                  href={event.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:w-auto"
                  >
                    Ubicación
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export function AlumnoEventos() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await getActiveEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      alert("No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return events.filter((event) => {
      return (
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        (event.location || "").toLowerCase().includes(term)
      );
    });
  }, [events, searchTerm]);

  const featuredEvent = filteredEvents.find((event) => event.is_featured);
  const regularEvents = featuredEvent
    ? filteredEvents.filter((event) => event.id !== featuredEvent.id)
    : filteredEvents;

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando clases y eventos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Clases y Eventos
            </h1>
            <p className="mt-2 text-zinc-400">
              Explora las actividades y eventos próximos de TXS.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Buscar eventos..."
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {featuredEvent && (
          <EventCard event={featuredEvent} onOpen={setSelectedEvent} featured />
        )}

        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-zinc-500">
                No hay eventos disponibles por ahora.
              </p>
            </CardContent>
          </Card>
        ) : regularEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {regularEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpen={setSelectedEvent}
              />
            ))}
          </div>
        ) : null}
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
