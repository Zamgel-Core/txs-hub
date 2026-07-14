import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="txs-modal-title"
        className={cn(
          "relative z-50 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-800 bg-txs-card shadow-2xl animate-in fade-in zoom-in-95 sm:max-h-[calc(100dvh-2rem)]",
          className,
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-4 sm:px-6">
          <h2
            id="txs-modal-title"
            className="font-display text-lg font-semibold text-white sm:text-xl"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable] sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
