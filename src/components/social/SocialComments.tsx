// 📍 Ruta del archivo: src/components/social/SocialComments.tsx

import { useEffect, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { createSocialComment, getSocialComments, type SocialComment } from "@/src/services/socialService";

type SocialCommentsProps = {
  postId: string;
  onChanged: () => void;
};

export function SocialComments({ postId, onChanged }: SocialCommentsProps) {
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await getSocialComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Error cargando comentarios sociales:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!content.trim()) return;

    setSaving(true);
    try {
      await createSocialComment(postId, content);
      setContent("");
      await loadComments();
      onChanged();
    } catch (error) {
      console.error("Error creando comentario social:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-zinc-800/70 pt-4 space-y-4">
      {loading ? (
        <p className="text-sm text-zinc-500">Cargando comentarios...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-500">Sé el primero en comentar.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl bg-zinc-950/60 border border-zinc-800/60 p-3">
              <div className="text-sm font-semibold text-zinc-200">{comment.author_name}</div>
              <p className="mt-1 text-sm text-zinc-400 whitespace-pre-line">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-gold-500/50"
          maxLength={400}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
          }}
        />
        <Button onClick={handleSubmit} disabled={saving || !content.trim()} variant="outline" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
