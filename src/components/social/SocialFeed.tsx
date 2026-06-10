// 📍 Ruta del archivo: src/components/social/SocialFeed.tsx

import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { SocialPostCard } from "./SocialPostCard";
import {
  getCurrentSocialStudent,
  getSocialFeed,
  type CurrentSocialStudent,
  type SocialFeedFilter,
  type SocialPost,
} from "@/src/services/socialService";

type SocialFeedProps = {
  activeFilter: SocialFeedFilter;
  currentStudent?: CurrentSocialStudent | null;
  canModerate?: boolean;
};

export function SocialFeed({ activeFilter, currentStudent = null, canModerate = false }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [student, setStudent] = useState<CurrentSocialStudent | null>(currentStudent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStudent(currentStudent);
  }, [currentStudent]);

  useEffect(() => {
    loadFeed();
  }, [activeFilter]);

  async function loadFeed() {
    setLoading(true);
    setError(null);

    try {
      const [data, studentData] = await Promise.all([
        getSocialFeed(activeFilter),
        currentStudent ? Promise.resolve(currentStudent) : getCurrentSocialStudent().catch(() => null),
      ]);

      setPosts(data);
      setStudent(studentData);
    } catch (feedError) {
      setError(feedError instanceof Error ? feedError.message : "No se pudo cargar TXS Social.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-center text-zinc-400">Cargando comunidad TXS...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        <p className="font-semibold">No se pudo cargar el feed.</p>
        <p className="mt-1 text-sm text-red-200/80">{error}</p>
        <Button onClick={loadFeed} variant="outline" className="mt-4 gap-2">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-10 text-center">
        <Users className="mx-auto w-10 h-10 text-gold-400" />
        <h3 className="mt-4 text-lg font-display font-semibold text-zinc-100">Todavía no hay publicaciones</h3>
        <p className="mt-2 text-sm text-zinc-500">Cuando los alumnos compartan logros, fotos o reconocimientos, aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <SocialPostCard key={post.id} post={post} onChanged={loadFeed} currentStudent={student} canModerate={canModerate} />
      ))}
    </div>
  );
}
