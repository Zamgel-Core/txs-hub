// 📍 Ruta: src/pages/public/Producciones.tsx

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  Disc3,
  Flame,
  Music2,
  PartyPopper,
  Phone,
  Sparkles,
  Star,
  UsersRound,
  Volume2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

const whatsappUrl =
  "https://wa.me/528991019210?text=Hola%20TXS%2C%20quiero%20informaci%C3%B3n%20sobre%20TXS%20Producciones.";

const heroImages = [
  "/producciones/1.png",
  "/producciones/2.png",
  "/producciones/3.jpeg",
  "/producciones/4.jpeg",
  "/producciones/5.jpeg",
  "/producciones/6.jpeg",
];

const services = [
  {
    icon: PartyPopper,
    title: "Shows",
    description:
      "Presentaciones especiales para eventos sociales, celebraciones privadas y experiencias en vivo.",
  },
  {
    icon: UsersRound,
    title: "Bailarines",
    description:
      "Talento escénico para coreografías, entradas especiales, animación y momentos estelares.",
  },
  {
    icon: Disc3,
    title: "DJ",
    description:
      "Ambiente musical para mantener la energía del evento desde el inicio hasta el cierre.",
  },
  {
    icon: Volume2,
    title: "Sonido",
    description:
      "Apoyo técnico para que cada presentación se viva con presencia, potencia y calidad.",
  },
  {
    icon: CalendarDays,
    title: "Eventos",
    description:
      "Producción y coordinación artística para celebraciones, fiestas privadas y eventos premium.",
  },
  {
    icon: Crown,
    title: "XV años",
    description:
      "Coreografías, shows, entradas y experiencias diseñadas para hacer inolvidable cada celebración.",
  },
];

const highlights = [
  "Coreografías para XV años y bodas",
  "Producción de shows y eventos privados",
  "Bailarines, DJ, sonido y coordinación escénica",
  "Experiencias especiales para eventos sociales",
];

const gallery = [
  {
    src: "/producciones/1.png",
    title: "Experiencias sociales",
    label: "Celebraciones privadas",
  },
  {
    src: "/producciones/3.jpeg",
    title: "Shows con impacto",
    label: "Producción escénica",
  },
  {
    src: "/producciones/4.jpeg",
    title: "Equipo TXS",
    label: "Coordinación en evento",
  },
  {
    src: "/producciones/5.jpeg",
    title: "Ambiente premium",
    label: "Momentos memorables",
  },
];

export function Producciones() {
  return (
    <div className="min-h-screen bg-txs-black text-white">
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_40%)]" />
        <div className="absolute -right-48 top-24 h-[520px] w-[520px] rounded-full bg-gold-500/10 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />

        <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-400">
              <Sparkles className="h-4 w-4" />
              Shows • Bailarines • DJ • Sonido • Eventos
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              TXS{" "}
              <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700 bg-clip-text text-transparent">
                Producciones
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Creamos experiencias memorables para XV años, bodas, eventos
              sociales, celebraciones privadas, shows y presentaciones
              especiales con el sello de Texano Show.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <Button variant="gold" className="rounded-full px-7">
                  Solicitar información <Phone className="ml-2 h-4 w-4" />
                </Button>
              </a>

              <Link to="/eventos">
                <Button
                  variant="outline"
                  className="rounded-full border-gold-500/30 text-gold-400"
                >
                  Ver eventos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["Shows", "Bailarines", "DJ", "Sonido"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-800 bg-black/35 p-4 text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-gold-500/20 bg-zinc-950 shadow-2xl shadow-gold-500/10">
              <div className="relative aspect-[16/10]">
                <img
                  src={heroImages[0]}
                  alt="TXS Producciones"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-black/65 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold-300 backdrop-blur-xl">
                    <Flame className="h-4 w-4" />
                    Producción para eventos premium
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 p-3">
                {heroImages.slice(1).map((image, index) => (
                  <div
                    key={image}
                    className="aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
                  >
                    <img
                      src={image}
                      alt={`Galería TXS Producciones ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-gold-500/20 bg-zinc-950/80">
            <CardContent className="p-7 md:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
                <Music2 className="h-8 w-8 text-gold-400" />
              </div>

              <h2 className="text-3xl font-black">Producción completa</h2>

              <p className="mt-4 leading-relaxed text-zinc-400">
                TXS Producciones reúne talento artístico, coordinación escénica,
                animación, sonido y experiencia en eventos para transformar cada
                celebración en un momento inolvidable.
              </p>

              <div className="mt-7 space-y-3">
                {highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-400" />
                    <span className="text-sm font-semibold text-zinc-200">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Card
                  key={service.title}
                  className="border-zinc-800 bg-zinc-950/70 transition hover:-translate-y-1 hover:border-gold-500/35 hover:shadow-xl hover:shadow-gold-500/5"
                >
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                      <Icon className="h-6 w-6 text-gold-400" />
                    </div>
                    <h3 className="text-xl font-black">{service.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              Galería
            </p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Momentos TXS Producciones
            </h2>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              className="rounded-full border-gold-500/30 text-gold-400"
            >
              Cotizar evento <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {gallery.map((item) => (
            <div
              key={item.src}
              className="group relative min-h-[320px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950"
            >
              <img
                src={item.src}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-black/65 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold-300 backdrop-blur-xl">
                  <Star className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <h3 className="text-2xl font-black">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
