// 📍 Ruta del archivo: src/pages/alumno/AlumnoSocial.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Eye, Flame, Medal, Sparkles, Users } from "lucide-react";

import { UserAvatar } from "@/src/components/common/UserAvatar";
import { SocialComposer } from "@/src/components/social/SocialComposer";
import { SocialFeed } from "@/src/components/social/SocialFeed";
import {
  getCurrentSocialStudent,
  type CurrentSocialStudent,
  type SocialFeedFilter,
} from "@/src/services/socialService";

const filters: Array<{
  id: SocialFeedFilter;
  label: string;
  icon: typeof Users;
}> = [
  { id: "todos", label: "Todos", icon: Users },
  { id: "mi_grupo", label: "Mi grupo", icon: Users },
  { id: "eventos", label: "Eventos", icon: Sparkles },
  { id: "reconocimientos", label: "Reconocimientos", icon: Award },
  { id: "txs", label: "TXS", icon: Medal },
  { id: "destacados", label: "Destacados", icon: Flame },
];

export function AlumnoSocial() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<SocialFeedFilter>("todos");
  const [student, setStudent] = useState<CurrentSocialStudent | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    try {
      const data = await getCurrentSocialStudent();
      setStudent(data);
    } catch (error) {
      console.error("Error cargando alumno social:", error);
      setStudent(null);
    }
  }

  function refreshFeed() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-zinc-950 via-txs-card to-black p-5 md:p-6 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400">
              <Sparkles className="w-3.5 h-3.5" /> Comunidad privada
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-zinc-100">
                TXS Social
              </h1>
              <span className="pb-1 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400/80">
                Academia TXS
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Comparte logros, experiencias, entrenamientos y momentos
              importantes con la comunidad TXS.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!student?.id) return;
              navigate(`/alumno/social/perfil/${student.id}`);
            }}
            className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-black/35 px-4 py-3 text-left text-sm text-zinc-300 transition hover:-translate-y-0.5 hover:border-gold-500/45 hover:bg-gold-500/10 hover:shadow-[0_0_28px_rgba(212,175,55,0.14)] md:w-auto"
            title="Ver tu perfil social"
          >
            <UserAvatar
              name={student?.full_name || "Alumno TXS"}
              imageUrl={student?.avatar_url || null}
              size="sm"
            />

            <div className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 group-hover:text-gold-400/80">
                Mi perfil social
              </span>
              <div className="truncate font-semibold text-gold-400">
                {student?.full_name || "Alumno TXS"}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500 group-hover:text-gold-300">
                <Eye className="h-3.5 w-3.5" /> Ver cómo te ve la comunidad
              </div>
            </div>
          </button>
        </div>
      </div>

      <SocialComposer student={student} onCreated={refreshFeed} />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const active = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-gold-500 bg-gold-500 text-black"
                  : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-gold-500/40 hover:text-gold-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      <SocialFeed
        key={`${activeFilter}-${refreshKey}`}
        activeFilter={activeFilter}
        currentStudent={student}
      />
    </div>
  );
}
