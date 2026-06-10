// 📍 Ruta del archivo: src/components/social/SocialComposer.tsx

import { useState } from "react";
import { BadgeCheck, ImagePlus, Loader2, Send, Sparkles, Video, X } from "lucide-react";

import { UserAvatar } from "@/src/components/common/UserAvatar";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  createAdminSocialPost,
  createSocialPost,
  uploadSocialMedia,
  type CurrentSocialStudent,
  type SocialVisibility,
} from "@/src/services/socialService";

type SocialComposerProps = {
  student?: CurrentSocialStudent | null;
  onCreated: () => void;
  mode?: "student" | "admin";
};

const maxImageSizeMb = 5;
const maxVideoSizeMb = 25;

export function SocialComposer({ student = null, onCreated, mode = "student" }: SocialComposerProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<SocialVisibility>("academy");
  const [publishAsOfficial, setPublishAsOfficial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminMode = mode === "admin";
  const canPublish = isAdminMode || Boolean(student);

  const composerName = isAdminMode && publishAsOfficial ? "TXS Academia" : student?.full_name || "Equipo TXS";
  const composerAvatarUrl = isAdminMode && publishAsOfficial ? null : student?.avatar_url || null;

  const firstName = isAdminMode
    ? publishAsOfficial
      ? "TXS Academia"
      : "equipo TXS"
    : student?.full_name?.split(" ")[0] || "TXS";

  function handleFileChange(file: File | null) {
    setError(null);

    if (!file) {
      clearSelectedFile();
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Solo puedes agregar imágenes o videos cortos.");
      return;
    }

    const maxSizeMb = isImage ? maxImageSizeMb : maxVideoSizeMb;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(
        isImage
          ? `La imagen no debe pesar más de ${maxImageSizeMb} MB.`
          : `El video no debe pesar más de ${maxVideoSizeMb} MB.`,
      );
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearSelectedFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit() {
    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedFile) {
      setError("Escribe algo o agrega una foto para publicar.");
      return;
    }

    if (!canPublish) {
      setError("No se encontró el usuario actual para publicar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let uploadedMedia: Awaited<ReturnType<typeof uploadSocialMedia>> | null = null;

      if (selectedFile) {
        uploadedMedia = await uploadSocialMedia(selectedFile);
      }

      const payload = {
        content: trimmedContent,
        visibility,
        groupId: student?.group_id || null,
        mediaUrl: uploadedMedia?.url || null,
        mediaType: uploadedMedia?.mediaType || null,
      };

      if (isAdminMode) {
        await createAdminSocialPost(payload, publishAsOfficial);
      } else {
        await createSocialPost(payload);
      }

      setContent("");
      clearSelectedFile();
      setVisibility("academy");
      onCreated();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la publicación.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden border-gold-500/20 bg-gradient-to-br from-zinc-950 via-txs-card to-black">
      <CardContent className="p-4 md:p-5 space-y-4">
        {isAdminMode && (
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Publicar como</p>
              <p className="text-xs text-zinc-500">Las publicaciones oficiales aparecen con insignia de TXS Academia.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 p-1">
              <button
                type="button"
                onClick={() => setPublishAsOfficial(true)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  publishAsOfficial ? "bg-gold-500 text-black" : "text-zinc-400 hover:text-gold-400"
                }`}
              >
                TXS Academia
              </button>
              <button
                type="button"
                onClick={() => setPublishAsOfficial(false)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  !publishAsOfficial ? "bg-gold-500 text-black" : "text-zinc-400 hover:text-gold-400"
                }`}
              >
                Mi usuario
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <UserAvatar name={composerName} imageUrl={composerAvatarUrl} size="md" />
            {isAdminMode && publishAsOfficial && (
              <span className="absolute -bottom-1 -right-1 rounded-full border border-black bg-zinc-950 p-1 text-gold-400">
                <BadgeCheck className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={
                isAdminMode
                  ? `¿Qué va a compartir ${firstName}? Avisos, eventos, logros o contenido de la comunidad...`
                  : `¿Qué estás pensando, ${firstName}? Comparte un logro, entrenamiento o experiencia TXS...`
              }
              className="w-full min-h-24 resize-none rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10"
              maxLength={700}
            />

            {previewUrl && selectedFile && (
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black/40">
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="absolute right-3 top-3 z-10 rounded-full border border-zinc-700 bg-black/70 p-1.5 text-zinc-300 hover:text-white"
                  title="Quitar archivo"
                >
                  <X className="h-4 w-4" />
                </button>

                {selectedFile.type.startsWith("image/") ? (
                  <img src={previewUrl} alt="Vista previa" className="max-h-[360px] w-full object-cover" />
                ) : (
                  <video src={previewUrl} className="max-h-[360px] w-full bg-black" controls />
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-500/40 hover:text-gold-400">
                  <ImagePlus className="h-4 w-4" />
                  Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                    disabled={saving || !canPublish}
                  />
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-500/40 hover:text-gold-400">
                  <Video className="h-4 w-4" />
                  Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                    disabled={saving || !canPublish}
                  />
                </label>

                <span className="inline-flex items-center gap-1 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-2 text-xs font-medium text-gold-400">
                  <Sparkles className="h-3.5 w-3.5" /> {isAdminMode ? "Comunidad oficial" : "Comunidad TXS"}
                </span>
              </div>

              {!isAdminMode && (
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as SocialVisibility)}
                  className="rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100 outline-none focus:border-gold-500/50"
                >
                  <option value="academy">Toda la academia</option>
                  <option value="group">Solo mi grupo</option>
                </select>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>Fotos máximo {maxImageSizeMb} MB</span>
              <span>•</span>
              <span>Videos máximo {maxVideoSizeMb} MB</span>
            </div>

            {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">{content.length}/700 caracteres</p>
              <Button onClick={handleSubmit} disabled={saving || !canPublish} variant="gold" className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {saving ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
