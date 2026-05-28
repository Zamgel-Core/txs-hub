// 📍 Ruta: src/pages/alumno/AlumnoAvisos.tsx
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  Megaphone,
  RefreshCw,
  Search,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { supabase } from "@/src/lib/supabase";
import {
  AnnouncementWithRead,
  getStudentAnnouncements,
  markAnnouncementAsRead,
} from "@/src/services/announcementsService";

type Student = {
  id: string;
  full_name: string;
  email: string;
};

type FilterType = "todos" | "nuevos" | "leidos" | "importantes";

function formatDate(date: string | null) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPriorityBadge(priority: AnnouncementWithRead["priority"]) {
  if (priority === "urgente") return <Badge variant="danger">Urgente</Badge>;
  if (priority === "importante")
    return <Badge variant="warning">Importante</Badge>;
  return <Badge variant="neutral">Normal</Badge>;
}

function getPriorityIcon(priority: AnnouncementWithRead["priority"]) {
  if (priority === "urgente")
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  if (priority === "importante")
    return <Megaphone className="w-5 h-5 text-amber-400" />;
  return <Bell className="w-5 h-5 text-gold-500" />;
}

export function AlumnoAvisos() {
  const [student, setStudent] = useState<Student | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementWithRead[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setStudent(null);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    const { data: studentData, error } = await supabase
      .from("students")
      .select("id, full_name, email")
      .ilike("email", user.email)
      .maybeSingle();

    if (error) {
      console.error("Error cargando alumno:", error);
      setStudent(null);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    if (!studentData) {
      console.warn("No se encontró alumno para este usuario.");
      setStudent(null);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    setStudent(studentData as Student);

    try {
      const data = await getStudentAnnouncements(studentData.id);
      setAnnouncements(data);
    } catch (announcementsError) {
      console.error(announcementsError);
      setAnnouncements([]);
    }

    setLoading(false);
  }

  async function handleMarkRead(announcementId: string) {
    if (!student) return;

    setSavingId(announcementId);

    try {
      await markAnnouncementAsRead(announcementId, student.id);

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcementId
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );

      window.dispatchEvent(new CustomEvent("txs:announcements-read-changed"));
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar el aviso como leído.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!student) return;

    const unread = announcements.filter((item) => !item.read_at);
    if (unread.length === 0) return;

    setSavingId("all");

    try {
      await Promise.all(
        unread.map((item) => markAnnouncementAsRead(item.id, student.id)),
      );

      const now = new Date().toISOString();

      setAnnouncements((current) =>
        current.map((item) =>
          !item.read_at ? { ...item, read_at: now } : item,
        ),
      );

      window.dispatchEvent(new CustomEvent("txs:announcements-read-changed"));
    } catch (error) {
      console.error(error);
      alert("No se pudieron marcar todos los avisos como leídos.");
    } finally {
      setSavingId(null);
    }
  }

  const stats = useMemo(() => {
    const total = announcements.length;
    const unread = announcements.filter((item) => !item.read_at).length;
    const urgent = announcements.filter(
      (item) => item.priority === "urgente",
    ).length;
    const important = announcements.filter(
      (item) => item.priority === "importante" || item.priority === "urgente",
    ).length;

    return { total, unread, urgent, important };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return announcements.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.body.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "todos" ||
        (filter === "nuevos" && !item.read_at) ||
        (filter === "leidos" && item.read_at) ||
        (filter === "importantes" &&
          (item.priority === "importante" || item.priority === "urgente"));

      return matchesSearch && matchesFilter;
    });
  }, [announcements, filter, search]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gold-400">
        Cargando avisos...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-gold-500/10 via-txs-card to-black p-6 sm:p-8 shadow-[0_0_45px_rgba(212,175,55,0.08)]">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-black/30 px-3 py-1 text-xs font-semibold text-gold-400 mb-4">
              <Bell className="w-4 h-4" />
              Centro de comunicados
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Avisos de la Academia
            </h1>

            <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
              Consulta comunicados importantes, anuncios generales y avisos
              publicados por administración.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              className="gap-2"
              disabled={savingId !== null}
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>

            <Button
              variant="gold"
              onClick={handleMarkAllRead}
              disabled={stats.unread === 0 || savingId !== null}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todo leído
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="mt-2 text-2xl font-display font-bold text-white">
              {stats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500">Nuevos</p>
            <p className="mt-2 text-2xl font-display font-bold text-gold-400">
              {stats.unread}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500">Importantes</p>
            <p className="mt-2 text-2xl font-display font-bold text-amber-400">
              {stats.important}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-zinc-500">Urgentes</p>
            <p className="mt-2 text-2xl font-display font-bold text-red-400">
              {stats.urgent}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar aviso..."
            className="w-full rounded-2xl border border-zinc-800 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "todos", label: "Todos" },
            { id: "nuevos", label: "Nuevos" },
            { id: "importantes", label: "Importantes" },
            { id: "leidos", label: "Leídos" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as FilterType)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === item.id
                  ? "border-gold-500/50 bg-gold-500/15 text-gold-400"
                  : "border-zinc-800 bg-black/30 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10">
                <Bell className="w-6 h-6 text-gold-500" />
              </div>

              <h2 className="text-lg font-display font-bold text-white">
                No hay avisos para mostrar
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Cuando administración publique nuevos comunicados aparecerán
                aquí.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`overflow-hidden ${
                !announcement.read_at
                  ? "border-gold-500/30 shadow-[0_0_30px_rgba(212,175,55,0.08)]"
                  : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                      {getPriorityIcon(announcement.priority)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityBadge(announcement.priority)}

                        {!announcement.read_at && (
                          <Badge variant="default">Nuevo</Badge>
                        )}

                        {announcement.read_at && (
                          <Badge variant="success">Leído</Badge>
                        )}
                      </div>

                      <h2 className="mt-3 text-xl font-display font-bold text-white">
                        {announcement.title}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Publicado: {formatDate(announcement.publish_date)}
                        </span>

                        {announcement.expires_at && (
                          <span>
                            Expira: {formatDate(announcement.expires_at)}
                          </span>
                        )}
                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                        {announcement.body}
                      </p>

                      {!announcement.read_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-5"
                          disabled={savingId !== null}
                          onClick={() => handleMarkRead(announcement.id)}
                        >
                          {savingId === announcement.id
                            ? "Guardando..."
                            : "Marcar como leído"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
