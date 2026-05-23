import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-txs-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none mix-blend-screen">
        <img src="/branding/sombrero_TSX.png" alt="" className="w-[800px] h-auto grayscale" />
      </div>

      <div className="text-center max-w-md mx-auto relative z-10">
        <img src="/branding/logo_TSX.png" alt="TXS HUB Logo" className="h-24 w-auto mx-auto mb-8 drop-shadow-2xl" />
        <h1 className="font-display font-bold text-6xl text-gold-500 mb-4 drop-shadow-md">404</h1>
        <h2 className="text-2xl text-white font-bold mb-4">Página no encontrada</h2>
        <p className="text-zinc-400 mb-8 font-light">
          La página que buscas no existe o ha sido movida. Verifica que la dirección esté escrita correctamente.
        </p>
        <Link to="/">
          <Button variant="gold" size="lg">
            Regresar al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
