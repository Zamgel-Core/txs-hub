// 📍 Ruta del archivo: src/pages/admin/Eventos.tsx

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Edit2,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { supabase } from "@/src/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import {
  createEvent,
  deleteEvent,
  EventFormPayload,
  EventItem,
  getAdminEvents,
  updateEvent,
  uploadEventImage,
} from "@/src/services/eventsService";

const today = new Date().toISOString().slice(0, 10);

const emptyForm: EventFormPayload = {
  title: "",
  description: "",
  eventDate: today,
  eventTime: "",
  location: "",
  mapsUrl: "",
  imageUrl: "",
  isFeatured: false,
  isActive: true,
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
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

function mapEventToForm(event: EventItem): EventFormPayload {
  return {
    title: event.title,
    description: event.description,
    eventDate: event.event_date,
    eventTime: event.event_time || "",
    location: event.location || "",
    mapsUrl: event.maps_url || "",
    imageUrl: event.image_url || "",
    isFeatured: event.is_featured,
    isActive: event.is_active,
  };
}

export function Eventos() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventFormPayload>(emptyForm);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          loadEvents();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await getAdminEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      alert("No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingEvent(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(event: EventItem) {
    setEditingEvent(event);
    setForm(mapEventToForm(event));
    setIsModalOpen(true);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida.");
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadEventImage(file);
      setForm((current) => ({ ...current, imageUrl }));
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSaveEvent() {
    if (!form.title.trim()) {
      alert("Agrega el título del evento.");
      return;
    }

    if (!form.description.trim()) {
      alert("Agrega la descripción del evento.");
      return;
    }

    if (!form.eventDate) {
      alert("Selecciona la fecha del evento.");
      return;
    }

    try {
      setSaving(true);

      if (editingEvent) {
        await updateEvent(editingEvent.id, form);
      } else {
        await createEvent(form);
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      setForm(emptyForm);
      await loadEvents();
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent(event: EventItem) {
    const confirmed = confirm(`¿Eliminar el evento "${event.title}"?`);

    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
      await loadEvents();
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("No se pudo eliminar el evento.");
    }
  }

  const stats = useMemo(() => {
    return {
      total: events.length,
      active: events.filter((event) => event.is_active).length,
      featured: events.filter((event) => event.is_featured).length,
    };
  }, [events]);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando eventos reales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Eventos
          </h1>
          <p className="mt-2 text-zinc-400">
            Administra eventos reales, flyers, ubicaciones y actividades de TXS.
          </p>
        </div>

        <Button variant="gold" className="gap-2" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Agregar evento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <Calendar className="mb-5 h-7 w-7 text-yellow-400" />
            <p className="text-sm text-zinc-500">Total eventos</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.total}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Star className="mb-5 h-7 w-7 text-emerald-400" />
            <p className="text-sm text-zinc-500">Destacados</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.featured}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <ImagePlus className="mb-5 h-7 w-7 text-blue-400" />
            <p className="text-sm text-zinc-500">Activos</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.active}
            </h2>
          </CardContent>
        </Card>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-zinc-500">Todavía no existen eventos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className={`group overflow-hidden ${
                event.is_featured ? "border-yellow-500/40" : ""
              }`}
            >
              <div className="relative h-48 overflow-hidden border-b border-zinc-800 bg-zinc-900">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                    <span className="text-sm font-bold uppercase text-yellow-400">
                      {getMonth(event.event_date)}
                    </span>
                    <span className="text-5xl font-bold text-white">
                      {getDay(event.event_date)}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute left-4 top-4 flex gap-2">
                  {event.is_featured && (
                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                      Destacado
                    </span>
                  )}

                  {!event.is_active && (
                    <span className="rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                      Inactivo
                    </span>
                  )}
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2 text-xl group-hover:text-yellow-400">
                  {event.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col pt-2">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="h-4 w-4 text-yellow-400" />
                    <span>
                      {formatDate(event.event_date)}
                      {event.event_time ? ` • ${event.event_time}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                    <span className="line-clamp-1">
                      {event.location || "Sin ubicación"}
                    </span>
                  </div>
                </div>

                <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500">
                  {event.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
                  {event.maps_url ? (
                    <a
                      href={event.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-yellow-400 hover:text-yellow-300"
                    >
                      Ver ubicación
                    </a>
                  ) : (
                    <span className="text-sm text-zinc-600">Sin mapa</span>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => openEditModal(event)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-950/30 hover:text-red-300"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-yellow-500/30 bg-[#070707] shadow-2xl shadow-yellow-500/10">
            <div className="flex items-start justify-between border-b border-zinc-800 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingEvent ? "Editar evento" : "Nuevo evento"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Los eventos activos aparecerán en el portal del alumno.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-zinc-800 p-2 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Título</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="Ej. Bootcamp intensivo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Descripción</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="Describe el evento para los alumnos..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Fecha</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(event) =>
                      setForm({ ...form, eventDate: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition [color-scheme:dark] focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Hora</label>
                  <input
                    value={form.eventTime}
                    onChange={(event) =>
                      setForm({ ...form, eventTime: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                    placeholder="Ej. 7:00 PM - 10:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Ubicación</label>
                <input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="Ej. Estudios TXS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Link Google Maps
                </label>
                <input
                  value={form.mapsUrl}
                  onChange={(event) =>
                    setForm({ ...form, mapsUrl: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-zinc-400">
                  Imagen / flyer del evento
                </label>

                {form.imageUrl && (
                  <div className="overflow-hidden rounded-2xl border border-zinc-800">
                    <img
                      src={form.imageUrl}
                      alt="Preview del evento"
                      className="max-h-64 w-full object-cover"
                    />
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-yellow-500/30 bg-yellow-500/5 px-4 py-4 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/10">
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {uploadingImage ? "Subiendo imagen..." : "Subir imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) =>
                      setForm({ ...form, isFeatured: event.target.checked })
                    }
                    className="h-4 w-4 accent-yellow-500"
                  />
                  Evento destacado
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm({ ...form, isActive: event.target.checked })
                    }
                    className="h-4 w-4 accent-yellow-500"
                  />
                  Visible para alumnos
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-800 p-6">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>

              <Button
                variant="gold"
                className="gap-2"
                onClick={handleSaveEvent}
                disabled={saving || uploadingImage}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Guardando..." : "Guardar evento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
