// 📍 Ruta del archivo: src/pages/admin/Avisos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  Announcement,
  AnnouncementGroup,
  AnnouncementPriority,
  AnnouncementTargetType,
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  getAnnouncementGroups,
  updateAnnouncement,
} from "@/src/services/announcementsService";

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  body: "",
  priority: "normal" as AnnouncementPriority,
  targetType: "todos" as AnnouncementTargetType,
  groupId: "",
  publishDate: today,
  expiresAt: "",
  isActive: true,
};

function formatDate(date: string | null) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPriorityBadge(priority: AnnouncementPriority) {
  if (priority === "urgente") {
    return <Badge variant="danger">Urgente</Badge>;
  }

  if (priority === "importante") {
    return <Badge variant="warning">Importante</Badge>;
  }

  return <Badge variant="neutral">Normal</Badge>;
}

function getPriorityIcon(priority: AnnouncementPriority) {
  if (priority === "urgente") {
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  }

  if (priority === "importante") {
    return <Bell className="h-5 w-5 text-amber-400" />;
  }

  return <Bell className="h-5 w-5 text-yellow-400" />;
}

export function Avisos() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [groups, setGroups] = useState<AnnouncementGroup[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [announcementsData, groupsData] = await Promise.all([
        getAdminAnnouncements(),
        getAnnouncementGroups(),
      ]);

      setAnnouncements(announcementsData);
      setGroups(groupsData);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los avisos.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedAnnouncement(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(announcement: Announcement) {
    setSelectedAnnouncement(announcement);
    setForm({
      title: announcement.title,
      body: announcement.body,
      priority: announcement.priority,
      targetType: announcement.target_type,
      groupId: announcement.group_id || "",
      publishDate: announcement.publish_date || today,
      expiresAt: announcement.expires_at || "",
      isActive: announcement.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      alert("Escribe un título para el aviso.");
      return;
    }

    if (!form.body.trim()) {
      alert("Escribe el contenido del aviso.");
      return;
    }

    if (form.targetType === "grupo" && !form.groupId) {
      alert("Selecciona el grupo que verá este aviso.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        priority: form.priority,
        targetType: form.targetType,
        groupId: form.targetType === "grupo" ? form.groupId : null,
        publishDate: form.publishDate,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };

      if (selectedAnnouncement) {
        await updateAnnouncement(selectedAnnouncement.id, payload);
      } else {
        await createAnnouncement(payload);
      }

      setModalOpen(false);
      setSelectedAnnouncement(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el aviso.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(announcement: Announcement) {
    const confirmed = confirm(
      `¿Seguro que quieres eliminar el aviso "${announcement.title}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteAnnouncement(announcement.id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el aviso.");
    }
  }

  const groupMap = useMemo(() => {
    return new Map(groups.map((group) => [group.id, group]));
  }, [groups]);

  const activeCount = announcements.filter((item) => item.is_active).length;
  const urgentCount = announcements.filter(
    (item) => item.priority === "urgente" && item.is_active,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando avisos reales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Avisos y Comunicados
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Publica comunicados reales para todos los alumnos o para grupos
            específicos.
          </p>
        </div>

        <Button variant="gold" className="gap-2" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nuevo aviso
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <Bell className="mb-4 h-6 w-6 text-yellow-400" />
            <p className="text-sm text-zinc-500">Total avisos</p>
            <p className="mt-1 text-3xl font-bold text-white">
              {announcements.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <CheckCircle2 className="mb-4 h-6 w-6 text-emerald-400" />
            <p className="text-sm text-zinc-500">Activos</p>
            <p className="mt-1 text-3xl font-bold text-white">{activeCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <AlertTriangle className="mb-4 h-6 w-6 text-red-400" />
            <p className="text-sm text-zinc-500">Urgentes activos</p>
            <p className="mt-1 text-3xl font-bold text-white">{urgentCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
                <Bell className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="font-semibold text-white">Sin avisos todavía</p>
              <p className="mt-2 text-sm text-zinc-500">
                Crea el primer comunicado para el portal del alumno.
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => {
            const group = announcement.group_id
              ? groupMap.get(announcement.group_id)
              : null;

            return (
              <Card
                key={announcement.id}
                className="transition hover:border-yellow-500/30"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                        {getPriorityIcon(announcement.priority)}
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-white">
                            {announcement.title}
                          </h3>

                          {getPriorityBadge(announcement.priority)}

                          {!announcement.is_active && (
                            <Badge variant="neutral">Inactivo</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Publicado: {formatDate(announcement.publish_date)}
                          </span>

                          <span>
                            Expira: {formatDate(announcement.expires_at)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {announcement.target_type === "todos"
                              ? "Todos los alumnos"
                              : group?.name || "Grupo no encontrado"}
                          </span>
                        </div>

                        <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                          {announcement.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 lg:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => openEditModal(announcement)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(announcement)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-yellow-500/20 bg-[#090909] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between border-b border-zinc-800 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedAnnouncement ? "Editar aviso" : "Nuevo aviso"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Los avisos activos aparecerán en el portal del alumno.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-zinc-600 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Título
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="Ej. Cambio de horario"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Contenido
                </label>
                <textarea
                  rows={5}
                  value={form.body}
                  onChange={(event) =>
                    setForm({ ...form, body: event.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none transition focus:border-yellow-500"
                  placeholder="Escribe el comunicado para los alumnos..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Prioridad
                  </label>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value as AnnouncementPriority,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Visibilidad
                  </label>
                  <select
                    value={form.targetType}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        targetType: event.target.value as AnnouncementTargetType,
                        groupId: "",
                      })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value="todos">Todos los alumnos</option>
                    <option value="grupo">Solo un grupo</option>
                  </select>
                </div>
              </div>

              {form.targetType === "grupo" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Grupo
                  </label>
                  <select
                    value={form.groupId}
                    onChange={(event) =>
                      setForm({ ...form, groupId: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-yellow-500"
                  >
                    <option value="">Selecciona un grupo</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} • {group.schedule}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Fecha de publicación
                  </label>
                  <input
                    type="date"
                    value={form.publishDate}
                    onChange={(event) =>
                      setForm({ ...form, publishDate: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition [color-scheme:dark] focus:border-yellow-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Expira en
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(event) =>
                      setForm({ ...form, expiresAt: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition [color-scheme:dark] focus:border-yellow-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                  className="h-4 w-4 accent-yellow-500"
                />
                Aviso activo y visible para alumnos
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 p-6 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>

              <Button
                variant="gold"
                className="gap-2"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Guardando..." : "Guardar aviso"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
