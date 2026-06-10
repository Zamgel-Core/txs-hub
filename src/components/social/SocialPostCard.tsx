// 📍 Ruta del archivo: src/components/social/SocialPostCard.tsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  Edit3,
  Flag,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Shield,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { UserAvatar } from "@/src/components/common/UserAvatar";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  deleteOwnSocialPost,
  reportSocialPost,
  toggleFeaturedPost,
  toggleSocialReaction,
  updateOwnSocialPostContent,
  updateSocialPostStatus,
  type CurrentSocialStudent,
  type SocialPost,
  type SocialReactionType,
} from "@/src/services/socialService";
import { SocialComments } from "./SocialComments";

type SocialPostCardProps = {
  post: SocialPost;
  onChanged: () => void;
  currentStudent?: CurrentSocialStudent | null;
  canModerate?: boolean;
};

const reactionOptions: Array<{ type: SocialReactionType; label: string; emoji: string }> = [
  { type: "like", label: "Me gusta", emoji: "❤️" },
  { type: "fire", label: "Increíble", emoji: "🔥" },
  { type: "clap", label: "Felicidades", emoji: "👏" },
  { type: "trophy", label: "Excelente", emoji: "🏆" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(date);
}

function getPostBadge(postType: SocialPost["post_type"], isOfficial?: boolean) {
  if (isOfficial) return "Oficial";

  const labels: Record<SocialPost["post_type"], string> = {
    student_post: "Comunidad",
    achievement: "Logro",
    event: "Evento",
    recognition: "Reconocimiento",
    level_up: "Nivel TXS",
    birthday: "Cumpleaños",
    student_of_month: "Alumno del mes",
    system: "TXS",
  };

  return labels[postType] || "TXS";
}

function getPostIcon(postType: SocialPost["post_type"], isOfficial?: boolean) {
  if (isOfficial) return "🛡️";
  if (postType === "recognition") return "⭐";
  if (postType === "level_up") return "🏆";
  if (postType === "birthday") return "🎂";
  if (postType === "student_of_month") return "🔥";
  if (postType === "event") return "📅";
  return "🥋";
}

function canEditPost(post: SocialPost, currentStudent?: CurrentSocialStudent | null) {
  if (!currentStudent) return false;
  if (post.author_student_id !== currentStudent.id) return false;
  if (post.post_type !== "student_post") return false;
  if (post.status !== "published") return false;
  if (post.comments_count > 0 || post.reports_count > 0) return false;

  const createdAt = new Date(post.created_at).getTime();
  return Date.now() - createdAt <= 2 * 60 * 1000;
}

function canDeleteOwnPost(post: SocialPost, currentStudent?: CurrentSocialStudent | null) {
  if (!currentStudent) return false;
  return post.author_student_id === currentStudent.id && post.post_type === "student_post";
}

export function SocialPostCard({ post, onChanged, currentStudent = null, canModerate = false }: SocialPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const isOfficial = Boolean(post.author?.is_official);
  const visibleReactions = reactionOptions.filter((reaction) => (post.reaction_summary?.[reaction.type] || 0) > 0);
  const allowEdit = useMemo(() => canEditPost(post, currentStudent), [post, currentStudent]);
  const allowDeleteOwn = useMemo(() => canDeleteOwnPost(post, currentStudent), [post, currentStudent]);
  const wasEdited = Boolean(post.metadata?.edited);
  const profilePath = post.author_student_id
    ? canModerate
      ? `/admin/social/perfil/${post.author_student_id}`
      : `/alumno/social/perfil/${post.author_student_id}`
    : null;

  async function handleReaction(reactionType: SocialReactionType) {
    try {
      await toggleSocialReaction(post.id, reactionType);
      onChanged();
    } catch (error) {
      console.error("Error guardando reacción social:", error);
      window.alert("Solo los alumnos pueden reaccionar desde su portal.");
    }
  }

  async function handleReport() {
    const reason = window.prompt("¿Por qué quieres reportar esta publicación?");
    if (!reason?.trim()) return;

    setReporting(true);
    try {
      await reportSocialPost(post.id, reason.trim());
      window.alert("Reporte enviado. El equipo TXS lo revisará.");
    } catch (error) {
      console.error("Error reportando publicación:", error);
      window.alert("No se pudo enviar el reporte.");
    } finally {
      setReporting(false);
      setMenuOpen(false);
    }
  }

  async function handleSaveEdit() {
    if (!editContent.trim()) return;

    setSavingEdit(true);
    try {
      await updateOwnSocialPostContent(post.id, editContent);
      setEditing(false);
      onChanged();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo editar la publicación.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteOwnPost() {
    const confirmed = window.confirm("¿Eliminar esta publicación? Ya no aparecerá en el feed.");
    if (!confirmed) return;

    try {
      await deleteOwnSocialPost(post.id);
      onChanged();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo eliminar la publicación.");
    } finally {
      setMenuOpen(false);
    }
  }

  async function handleAdminStatus(status: SocialPost["status"]) {
    try {
      await updateSocialPostStatus(post.id, status);
      onChanged();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo actualizar la publicación.");
    } finally {
      setMenuOpen(false);
    }
  }

  async function handleAdminFeatured() {
    try {
      await toggleFeaturedPost(post.id, !post.is_featured);
      onChanged();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo destacar la publicación.");
    } finally {
      setMenuOpen(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-gold-500/15 bg-gradient-to-br from-zinc-950 via-txs-card to-black shadow-xl">
        <CardContent className="p-0">
          <div className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {profilePath ? (
                  <Link to={profilePath} className="relative shrink-0 transition hover:scale-105" title="Ver perfil social">
                    <UserAvatar name={post.author?.full_name || "TXS"} imageUrl={post.author?.avatar_url || null} size="lg" />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-zinc-950 text-xs">
                      {getPostIcon(post.post_type, isOfficial)}
                    </span>
                  </Link>
                ) : (
                  <div className="relative shrink-0">
                    <UserAvatar name={post.author?.full_name || "TXS"} imageUrl={post.author?.avatar_url || null} size="lg" />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-zinc-950 text-xs">
                      {getPostIcon(post.post_type, isOfficial)}
                    </span>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-zinc-100">{post.author?.full_name || "Sistema TXS"}</h3>
                    {isOfficial && <BadgeCheck className="h-4 w-4 text-gold-400" />}
                    <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-400">
                      {getPostBadge(post.post_type, isOfficial)}
                    </span>
                    {post.is_featured && <Star className="h-4 w-4 fill-gold-400 text-gold-400" />}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" /> {post.author?.group_name || "Comunidad TXS"}
                    </span>
                    {!isOfficial && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> {post.author?.current_level_name || "Nivel TXS"}
                        </span>
                        <span>•</span>
                        <span>🏆 {post.author?.total_points || 0} pts</span>
                      </>
                    )}
                    <span>•</span>
                    <span title={formatDate(post.created_at)}>{formatRelativeDate(post.created_at)}</span>
                    {wasEdited && <span>• Editado</span>}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen((value) => !value)} title="Opciones">
                  <MoreHorizontal className="h-5 w-5 text-zinc-500" />
                </Button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-gold-400"
                      >
                        <Edit3 className="h-4 w-4" /> Editar publicación
                      </button>
                    )}

                    {allowDeleteOwn && (
                      <button
                        type="button"
                        onClick={handleDeleteOwnPost}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar publicación
                      </button>
                    )}

                    {!canModerate && (
                      <button
                        type="button"
                        onClick={handleReport}
                        disabled={reporting}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-amber-400"
                      >
                        <Flag className="h-4 w-4" /> Reportar publicación
                      </button>
                    )}

                    {canModerate && (
                      <>
                        <button
                          type="button"
                          onClick={handleAdminFeatured}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-gold-400"
                        >
                          <Star className="h-4 w-4" /> {post.is_featured ? "Quitar destacado" : "Destacar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminStatus("hidden")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-amber-400"
                        >
                          <Flag className="h-4 w-4" /> Ocultar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminStatus("pending_review")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-blue-400"
                        >
                          <Flag className="h-4 w-4" /> Mandar a revisión
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminStatus("published")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-emerald-400"
                        >
                          <BadgeCheck className="h-4 w-4" /> Publicar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminStatus("deleted")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {editing ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="w-full min-h-24 resize-none rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-gold-500/50"
                  maxLength={700}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-zinc-500">Solo puedes editar durante los primeros 2 minutos y antes de recibir comentarios.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={savingEdit}>Cancelar</Button>
                    <Button variant="gold" size="sm" onClick={handleSaveEdit} disabled={savingEdit || !editContent.trim()}>
                      {savingEdit ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              post.content && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-300 md:text-base">{post.content}</p>
            )}
          </div>

          {post.media_url && post.media_type === "video" && (
            <div className="border-y border-zinc-800/70 bg-black/50">
              <video src={post.media_url} className="max-h-[560px] w-full bg-black" controls />
            </div>
          )}

          {post.media_url && post.media_type !== "video" && (
            <button type="button" onClick={() => setImageOpen(true)} className="block w-full border-y border-zinc-800/70 bg-black/30">
              <img src={post.media_url} alt="Publicación TXS" className="max-h-[560px] w-full object-cover" loading="lazy" />
            </button>
          )}

          <div className="space-y-4 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-zinc-500">
              <div className="flex flex-wrap items-center gap-2">
                {visibleReactions.length > 0 ? (
                  visibleReactions.map((reaction) => (
                    <span key={reaction.type} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1 text-xs">
                      {reaction.emoji} {post.reaction_summary[reaction.type]}
                    </span>
                  ))
                ) : (
                  <span>Sé el primero en reaccionar</span>
                )}
              </div>

              <button onClick={() => setShowComments((value) => !value)} className="inline-flex items-center gap-2 transition hover:text-gold-400">
                <MessageCircle className="h-4 w-4" />
                {post.comments_count} comentarios
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/70 pt-4 sm:flex sm:flex-wrap sm:items-center">
              {reactionOptions.map((reaction) => {
                const active = post.my_reaction === reaction.type;

                return (
                  <button
                    key={reaction.type}
                    type="button"
                    onClick={() => handleReaction(reaction.type)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition sm:py-1.5 ${
                      active
                        ? "border-gold-500 bg-gold-500 text-black"
                        : "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-gold-500/40 hover:text-gold-400"
                    }`}
                  >
                    <span className="mr-1">{reaction.emoji}</span>
                    {reaction.label}
                  </button>
                );
              })}
            </div>

            {showComments && <SocialComments postId={post.id} onChanged={onChanged} />}
          </div>
        </CardContent>
      </Card>

      {imageOpen && post.media_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setImageOpen(false)}>
          <button
            type="button"
            onClick={() => setImageOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-zinc-700 bg-black/80 p-2 text-zinc-200 hover:text-white"
            title="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-black" onClick={(event) => event.stopPropagation()}>
            <img src={post.media_url} alt="Publicación TXS" className="max-h-[90vh] w-full object-contain" />
          </div>
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-zinc-800 bg-black/70 px-4 py-2 text-xs text-zinc-400">
            <ImageIcon className="h-4 w-4" /> Toca fuera para cerrar
          </div>
        </div>
      )}
    </>
  );
}
