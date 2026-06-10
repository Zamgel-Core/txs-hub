// 📍 Ruta del archivo: src/pages/admin/SocialModeracion.tsx

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Eye,
  EyeOff,
  Flag,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  Users,
} from "lucide-react";

import { SocialComposer } from "@/src/components/social/SocialComposer";
import { SocialFeed } from "@/src/components/social/SocialFeed";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import {
  getAdminSocialPosts,
  getAdminSocialReports,
  getAdminSocialStats,
  toggleFeaturedPost,
  updateSocialPostStatus,
  updateSocialReportStatus,
  type AdminSocialStats,
  type SocialPost,
  type SocialReport,
} from "@/src/services/socialService";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status: string) {
  if (status === "published") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  if (status === "hidden") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  if (status === "pending_review") return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  if (status === "open") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  if (status === "reviewing") return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  if (status === "resolved") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  if (status === "dismissed") return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";
  return "border-red-500/20 bg-red-500/10 text-red-400";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    published: "🟢 Publicada",
    hidden: "🟠 Oculta",
    pending_review: "🟡 En revisión",
    deleted: "🔴 Eliminada",
    open: "🟠 Abierto",
    reviewing: "🔵 Revisando",
    resolved: "🟢 Resuelto",
    dismissed: "⚪ Descartado",
  };

  return labels[status] || status;
}

const emptyStats: AdminSocialStats = {
  posts_today: 0,
  posts_week: 0,
  reports_open: 0,
  posts_hidden: 0,
  users_suspended: 0,
  featured: 0,
};

export function SocialModeracion() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reports, setReports] = useState<SocialReport[]>([]);
  const [stats, setStats] = useState<AdminSocialStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"feed" | "posts" | "reports">("feed");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [postsData, reportsData] = await Promise.all([getAdminSocialPosts(), getAdminSocialReports()]);
      const statsData = await getAdminSocialStats(postsData, reportsData);
      setPosts(postsData);
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error cargando moderación social:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    await loadData();
    setFeedRefreshKey((value) => value + 1);
  }

  async function handleStatus(postId: string, status: SocialPost["status"]) {
    await updateSocialPostStatus(postId, status);
    await refreshAll();
  }

  async function handleFeatured(postId: string, isFeatured: boolean) {
    await toggleFeaturedPost(postId, isFeatured);
    await refreshAll();
  }

  async function handleReportStatus(reportId: string, status: SocialReport["status"]) {
    await updateSocialReportStatus(reportId, status);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400">
            <ShieldCheck className="w-3.5 h-3.5" /> TXS Social Admin
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-zinc-100">TXS Social</h1>
          <p className="mt-2 text-sm text-zinc-500">Publica como TXS Academia, revisa el feed y modera la comunidad.</p>
        </div>

        <Button onClick={refreshAll} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Posts hoy</p>
              <CalendarDays className="h-4 w-4 text-gold-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{stats.posts_today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Esta semana</p>
              <CalendarDays className="h-4 w-4 text-gold-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{stats.posts_week}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Reportes</p>
              <Flag className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-amber-400">{stats.reports_open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Ocultas</p>
              <EyeOff className="h-4 w-4 text-orange-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-orange-400">{stats.posts_hidden}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Suspendidos</p>
              <ShieldAlert className="h-4 w-4 text-red-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-red-400">{stats.users_suspended}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Destacadas</p>
              <Star className="h-4 w-4 text-gold-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gold-400">{stats.featured}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("feed")}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeTab === "feed" ? "border-gold-500 bg-gold-500 text-black" : "border-zinc-800 text-zinc-400 hover:text-gold-400"}`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeTab === "posts" ? "border-gold-500 bg-gold-500 text-black" : "border-zinc-800 text-zinc-400 hover:text-gold-400"}`}
        >
          Moderación
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeTab === "reports" ? "border-gold-500 bg-gold-500 text-black" : "border-zinc-800 text-zinc-400 hover:text-gold-400"}`}
        >
          Reportes
        </button>
      </div>

      {activeTab === "feed" ? (
        <div className="mx-auto max-w-3xl space-y-5">
          <SocialComposer mode="admin" onCreated={refreshAll} />
          <SocialFeed key={`admin-feed-${feedRefreshKey}`} activeFilter="todos" canModerate />
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-center text-zinc-400">Cargando moderación...</div>
      ) : activeTab === "posts" ? (
        <Card>
          <CardHeader>
            <CardTitle>Publicaciones recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-sm text-zinc-500">Todavía no hay publicaciones.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-zinc-100">{post.author?.full_name || "Sistema TXS"}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusClass(post.status)}`}>{getStatusLabel(post.status)}</span>
                        {post.is_featured && <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-xs font-semibold text-gold-400">⭐ Destacada</span>}
                        {post.media_url && <span className="rounded-full border border-zinc-700 bg-black/30 px-2 py-0.5 text-xs font-semibold text-zinc-400">Media</span>}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{formatDate(post.created_at)}</p>
                      <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-zinc-300">{post.content || "Publicación sin texto"}</p>
                      <p className="mt-2 text-xs text-zinc-500">❤️ {post.reactions_count} reacciones · 💬 {post.comments_count} comentarios · 🚩 {post.reports_count} reportes</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleFeatured(post.id, !post.is_featured)} className="gap-2">
                        <Star className="w-4 h-4" /> {post.is_featured ? "Quitar" : "Destacar"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStatus(post.id, "published")} className="gap-2">
                        <Eye className="w-4 h-4" /> Publicar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStatus(post.id, "pending_review")} className="gap-2">
                        <ShieldAlert className="w-4 h-4" /> Revisión
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStatus(post.id, "hidden")} className="gap-2">
                        <EyeOff className="w-4 h-4" /> Ocultar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStatus(post.id, "deleted")} className="gap-2 text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reportes de la comunidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay reportes todavía.</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Flag className="w-4 h-4 text-amber-400" />
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusClass(report.status)}`}>{getStatusLabel(report.status)}</span>
                        <span className="text-xs text-zinc-500">{formatDate(report.created_at)}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-zinc-100">Motivo: {report.reason}</p>
                      {report.details && <p className="mt-1 text-sm text-zinc-400">{report.details}</p>}
                      <p className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-500"><Users className="h-3.5 w-3.5" /> Reportado por: {report.reporter_name || "Alumno TXS"}</p>
                      {report.post_content && <p className="mt-3 line-clamp-3 rounded-xl border border-zinc-800 bg-black/30 p-3 text-sm text-zinc-400">{report.post_content}</p>}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReportStatus(report.id, "reviewing")}>Revisando</Button>
                      <Button variant="outline" size="sm" onClick={() => handleReportStatus(report.id, "resolved")}>Resuelto</Button>
                      <Button variant="outline" size="sm" onClick={() => handleReportStatus(report.id, "dismissed")}>Descartar</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
