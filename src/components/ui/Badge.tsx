import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "neutral"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-gold-500/20 text-gold-500": variant === "default",
          "border-transparent bg-emerald-500/20 text-emerald-500": variant === "success",
          "border-transparent bg-amber-500/20 text-amber-500": variant === "warning",
          "border-transparent bg-red-500/20 text-red-500": variant === "danger",
          "border-transparent bg-zinc-800 text-zinc-300": variant === "neutral",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
