// 📍 Ruta del archivo: src/pages/shared/SocialProfile.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { UserAvatar } from "@/src/components/common/UserAvatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { SocialPostCard } from "@/src/components/social/SocialPostCard";
import {
  getCurrentSocialStudent,
  getSocialProfileStudent,
  getStudentSocialPosts,
  type CurrentSocialStudent,
  type SocialPost,
  type SocialProfileStudent,
} from "@/src/services/socialService";
import {
  getStudentRecognitionSummary,
  recognitionOptions,
} from "@/src/services/recognitionsService";
import {
  getStudentProgress,
  type TXSProgressSummary,
} from "@/src/services/txsProgressService";

type RecognitionSummaryItem = (typeof recognitionOptions)[number] & {
  count: number;
};

function formatDate(value?: string | null) {
  if (!value) return "Fecha no disponible";

  return new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getLevelProgressPercent(progress: TXSProgressSummary | null) {
  if (!progress) return 0;
  if (!progress.next_level_min_points) return 100;

  const pointsToNext = progress.points_to_next_level ?? 0;
  const currentLevelStart = Math.max(
    progress.next_level_min_points - pointsToNext,
    0,
  );
  const levelRange = progress.next_level_min_points - currentLevelStart;
  const pointsInLevel = progress.total_points - currentLevelStart;

  if (levelRange <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, Math.round((pointsInLevel / levelRange) * 100)),
  );
}

export function SocialProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState<SocialProfileStudent | null>(null);
  const [currentStudent, setCurrentStudent] =
    useState<CurrentSocialStudent | null>(null);
  const [progress, setProgress] = useState<TXSProgressSummary | null>(null);
  const [recognitions, setRecognitions] = useState<RecognitionSummaryItem[]>(
    recognitionOptions.map((option) => ({ ...option, count: 0 })),
  );
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canModerate = location.pathname.startsWith("/admin");
  const isOwnProfile = Boolean(
    currentStudent?.id && student?.id && currentStudent.id === student.id,
  );

  const levelPercent = getLevelProgressPercent(progress);

  const totalRecognitions = useMemo(
    () => recognitions.reduce((sum, item) => sum + item.count, 0),
    [recognitions],
  );

  const topRecognitions = useMemo(
    () => recognitions.filter((item) => item.count > 0).sort((a, b) => b.count - a.count),
    [recognitions],
  );

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  async function loadProfile() {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const [studentData, currentData, progressData, recognitionData, postData] =
        await Promise.all([
          getSocialProfileStudent(studentId),
          getCurrentSocialStudent().catch(() => null),
          getStudentProgress(studentId),
          getStudentRecognitionSummary(studentId),
          getStudentSocialPosts(studentId, 30),
        ]);

      setStudent(studentData);
      setCurrentStudent(currentData);
      setProgress(progressData);
      setRecognitions(recognitionData);
      setPosts(postData);
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "No se pudo cargar el perfil social.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4 pb-10">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        <Card>
          <CardContent className="p-8 text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-gold-400" />
            <h1 className="text-xl font-bold text-white">
              Perfil no disponible
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {error || "No encontramos este perfil social."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        {isOwnProfile && (
          <Button asChild variant="gold" className="gap-2">
            <Link to="/alumno/progreso">
              <Sparkles className="h-4 w-4" /> Ver mi progreso completo
            </Link>
          </Button>
        )}
      </div>

      <section className="overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-zinc-950 via-black to-yellow-950/20 shadow-2xl">
        <div className="relative h-36 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.42),transparent_35%),linear-gradient(135deg,rgba(212,175,55,0.2),rgba(0,0,0,0.85))] sm:h-44">
          <div className="absolute inset-0 opacity-25 bg-[url('/branding/sombrero_TSX.png')] bg-[length:420px_auto] bg-center bg-no-repeat grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
          {progress?.current_level_name && (
            <div className="absolute right-4 top-4 rounded-full border border-gold-500/30 bg-black/55 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-300 backdrop-blur">
              {progress.current_level_name}
            </div>
          )}
        </div>

        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <UserAvatar
                name={student.full_name}
                imageUrl={student.avatar_url}
                size="hero"
                className="rounded-3xl border-4 border-black"
              />

              <div className="pb-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge>Perfil Social TXS</Badge>
                  {isOwnProfile && <Badge variant="success">Tu perfil</Badge>}
                </div>

                <h1 className="text-2xl font-black text-white sm:text-4xl">
                  {student.full_name}
                </h1>

                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <Users className="h-4 w-4 text-gold-400" />
                  {student.group_name || "Sin grupo asignado"}
                  <span className="text-zinc-700">•</span>
                  <CalendarDays className="h-4 w-4 text-gold-400" />
                  Miembro desde {formatDate(student.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-gold-500/20 bg-black/35">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  <Trophy className="h-4 w-4 text-gold-400" /> Nivel
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {progress?.current_level_name || "Nivel 1"}
                </p>
                <p className="text-xs text-gold-400">
                  {progress?.badge_label || "Inicio TXS"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold-500/20 bg-black/35">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  <Zap className="h-4 w-4 text-gold-400" /> Puntos
                </p>
                <p className="mt-2 text-2xl font-black text-gold-400">
                  {progress?.total_points ?? 0}
                </p>
                <p className="text-xs text-zinc-500">Puntos TXS acumulados</p>
              </CardContent>
            </Card>

            <Card className="border-gold-500/20 bg-black/35">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  <Award className="h-4 w-4 text-gold-400" /> Reconocimientos
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalRecognitions}
                </p>
                <p className="text-xs text-zinc-500">Insignias recibidas</p>
              </CardContent>
            </Card>

            <Card className="border-gold-500/20 bg-black/35">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  <MessageSquareText className="h-4 w-4 text-gold-400" /> Posts
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {posts.length}
                </p>
                <p className="text-xs text-zinc-500">Publicaciones visibles</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/35 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span>Progreso hacia el siguiente nivel</span>
              <span className="font-bold text-gold-400">{levelPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
              <span>
                {progress?.next_level_min_points
                  ? `${progress.total_points} / ${progress.next_level_min_points} pts`
                  : `${progress?.total_points || 0} pts acumulados`}
              </span>
              <span className="font-semibold text-gold-400">
                {progress?.points_to_next_level
                  ? `Faltan ${progress.points_to_next_level} pts para ${progress.next_level_name}.`
                  : "Nivel máximo alcanzado."}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Star className="h-5 w-5 text-gold-400" /> Reconocimientos
              </h2>

              {topRecognitions.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">
                  Todavía no hay reconocimientos registrados.
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {topRecognitions.map((recognition) => (
                    <span
                      key={recognition.type}
                      className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-2 text-sm font-semibold text-gold-300"
                    >
                      <span>{recognition.emoji}</span>
                      {recognition.label}
                      <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs text-zinc-300">
                        {recognition.count}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-white">Resumen social</h2>
              <div className="mt-4 space-y-3 text-sm text-zinc-400">
                <div className="flex items-center justify-between gap-3">
                  <span>Publicaciones</span>
                  <span className="font-bold text-white">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Grupo</span>
                  <span className="font-bold text-white">
                    {student.group_name || "Sin grupo"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Nivel</span>
                  <span className="font-bold text-gold-400">
                    {progress?.current_level_name || "Nivel 1"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">
                Publicaciones
              </h2>
              <p className="text-sm text-zinc-500">
                Actividad visible dentro de TXS Social.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquareText className="mx-auto mb-4 h-10 w-10 text-gold-400" />
                <h3 className="text-lg font-bold text-white">
                  Sin publicaciones todavía
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Cuando este alumno publique en TXS Social, aparecerá aquí.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  currentStudent={currentStudent}
                  canModerate={canModerate}
                  onChanged={loadProfile}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
