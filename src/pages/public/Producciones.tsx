// 📍 Ruta: src/pages/public/Producciones.tsx

import { ArrowRight, Camera, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

const services = [
  "Coreografías para XV años y bodas",
  "Producción de shows y eventos privados",
  "Coordinación artística y escénica",
  "Experiencia TXS para eventos premium",
];

export function Producciones() {
  return (
    <div className="min-h-screen bg-txs-black text-white">
      <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_42%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />

        <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-400">
              <Sparkles className="h-4 w-4" />
              Próximamente
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              TXS Producciones
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Esta sección quedará lista como página pública premium para producción de eventos, coreografías y experiencias especiales de Texano Show.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/eventos">
                <Button variant="gold" className="rounded-full px-7">
                  Ver eventos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/academia">
                <Button variant="outline" className="rounded-full border-gold-500/30 text-gold-400">
                  Ver academia
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-gold-500/20 bg-zinc-950/80 shadow-2xl shadow-gold-500/10">
            <CardContent className="p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
                <Camera className="h-8 w-8 text-gold-400" />
              </div>
              <h2 className="text-2xl font-black">Servicios base</h2>
              <div className="mt-6 space-y-4">
                {services.map((service) => (
                  <div key={service} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                    <CheckCircle2 className="h-5 w-5 text-gold-400" />
                    <span className="text-sm font-semibold text-zinc-200">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
