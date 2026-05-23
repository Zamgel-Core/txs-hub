import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "link" | "gold"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-zinc-800 border border-zinc-700/50 text-zinc-50 hover:bg-zinc-700/80 shadow-md hover:shadow-lg": variant === "default",
            "bg-gold-500 text-txs-black hover:bg-gold-400 font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]": variant === "gold",
            "border border-gold-500/40 bg-transparent hover:bg-gold-500/10 text-gold-500 hover:border-gold-500 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]": variant === "outline",
            "hover:bg-zinc-800/80 hover:text-gold-500": variant === "ghost",
            "text-zinc-50 underline-offset-4 hover:underline hover:text-gold-500": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-12 md:h-11 rounded-lg px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
