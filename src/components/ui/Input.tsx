import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-4 py-2 text-base md:text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-300 focus:bg-txs-card focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
