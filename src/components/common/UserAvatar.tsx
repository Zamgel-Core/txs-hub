// 📍 Ruta del archivo: src/components/common/UserAvatar.tsx

import { cn } from "@/src/lib/utils";

type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

type UserAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  title?: string;
};

const sizeClasses: Record<UserAvatarSize, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-3xl",
  hero: "h-28 w-28 text-3xl sm:h-32 sm:w-32 sm:text-4xl",
};

function getInitials(name?: string | null) {
  const safeName = String(name || "TXS").trim();
  const parts = safeName.split(" ").filter(Boolean);

  if (parts.length === 0) return "TX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  className,
  imageClassName,
  fallbackClassName,
  title,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-gold-500/45 bg-zinc-950 shadow-[0_0_22px_rgba(212,175,55,0.18)]",
        sizeClasses[size],
        className,
      )}
      title={title || name || "Perfil TXS"}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "Perfil TXS"}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-400 via-gold-500 to-amber-700 font-black text-black",
            fallbackClassName,
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
