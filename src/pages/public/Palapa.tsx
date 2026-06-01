// 📍 Ruta: src/pages/public/Palapa.tsx

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  GlassWater,
  Images,
  MapPin,
  PartyPopper,
  Phone,
  Sparkles,
  Utensils,
  Warehouse,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

const whatsappUrl =
  "https://wa.me/528991019210?text=Hola%20TXS%2C%20quiero%20informaci%C3%B3n%20sobre%20Palapa%20Tecolotes.";

const heroImages = [
  "/palapa/1.jpg",
  "/palapa/2.jpg",
  "/palapa/6.jpg",
  "/palapa/8.jpg",
];

const features = [
  {
    icon: Warehouse,
    title: "Espacio para eventos sociales",
    description:
      "Un lugar amplio y versátil para celebraciones familiares, XV años, convivencias y eventos privados.",
  },
  {
    icon: PartyPopper,
    title: "Ambiente listo para celebrar",
    description:
      "Montajes, pista, mesas, iluminación y áreas preparadas para crear una experiencia cómoda y especial.",
  },
  {
    icon: Utensils,
    title: "Área para banquete y snacks",
    description:
      "Ideal para mesas de comida, postres, botanas, candy bar y servicio para invitados.",
  },
  {
    icon: Waves,
    title: "Área con alberca",
    description:
      "Un extra perfecto para convivencias, fiestas familiares y eventos con ambiente relajado.",
  },
];

const gallery = [
  {
    src: "/palapa/1.jpg",
    title: "Entrada para celebraciones",
    label: "Recepción",
  },
  {
    src: "/palapa/2.jpg",
    title: "Montaje para invitados",
    label: "Salón",
  },
  {
    src: "/palapa/3.jpg",
    title: "Servicio de comida",
    label: "Banquete",
  },
  {
    src: "/palapa/4.jpg",
    title: "Mesa de postres",
    label: "Dulces y snacks",
  },
  {
    src: "/palapa/5.jpg",
    title: "Pasteles y detalles",
    label: "Celebraciones",
  },
  {
    src: "/palapa/6.jpg",
    title: "Montaje formal",
    label: "Eventos privados",
  },
  {
    src: "/palapa/7.jpg",
    title: "Decoración para XV años",
    label: "XV años",
  },
  {
    src: "/palapa/8.jpg",
    title: "Alberca y convivencia",
    label: "Área exterior",
  },
];

export function Palapa() {
  return (
    <div className="min-h-screen bg-txs-black text-white">
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_42%)]" />
        <div className="absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-gold-500/10 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />

        <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-400">
              <Sparkles className="h-4 w-4" />
              Eventos • Convivencias • Celebraciones
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              Palapa{" "}
              <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700 bg-clip-text text-transparent">
                Tecolotes
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Un espacio amplio y cómodo para celebrar momentos especiales: XV
              años, convivencias familiares, fiestas privadas, reuniones y
              experiencias conectadas con Texano Show.
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
              {["Eventos", "XV años", "Convivencias", "Alberca"].map((item) => (
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
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 overflow-hidden rounded-[2rem] border border-gold-500/20 bg-zinc-950 shadow-2xl shadow-gold-500/10">
                <div className="relative aspect-[16/9]">
                  <img
                    src={heroImages[0]}
                    alt="Palapa Tecolotes"
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-black/65 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold-300 backdrop-blur-xl">
                      <MapPin className="h-4 w-4" />
                      Espacio para eventos sociales
                    </div>
                  </div>
                </div>
              </div>

              {heroImages.slice(1).map((image) => (
                <div
                  key={image}
                  className="aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                >
                  <img
                    src={image}
                    alt="Galería Palapa Tecolotes"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-gold-500/20 bg-zinc-950/80">
            <CardContent className="p-7 md:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
                <CalendarDays className="h-8 w-8 text-gold-400" />
              </div>

              <h2 className="text-3xl font-black">Ideal para tu evento</h2>

              <p className="mt-4 leading-relaxed text-zinc-400">
                Palapa Tecolotes ofrece un ambiente familiar, amplio y versátil
                para recibir invitados, montar decoración, preparar alimentos,
                organizar convivencias y crear celebraciones memorables.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Eventos sociales y privados",
                  "Montajes para XV años y celebraciones",
                  "Área para banquete, postres y snacks",
                  "Ambiente familiar con opción de alberca",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-400" />
                    <span className="text-sm font-semibold text-zinc-200">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="border-zinc-800 bg-zinc-950/70 transition hover:-translate-y-1 hover:border-gold-500/35 hover:shadow-xl hover:shadow-gold-500/5"
                >
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                      <Icon className="h-6 w-6 text-gold-400" />
                    </div>
                    <h3 className="text-xl font-black">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {feature.description}
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
              Espacios, montajes y detalles
            </h2>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              className="rounded-full border-gold-500/30 text-gold-400"
            >
              Cotizar fecha <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {gallery.map((item, index) => (
            <div
              key={item.src}
              className={`group relative min-h-[320px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 ${
                index === 0 || index === 7 ? "md:col-span-2" : ""
              }`}
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
                  {index % 2 === 0 ? (
                    <Images className="h-3.5 w-3.5" />
                  ) : (
                    <GlassWater className="h-3.5 w-3.5" />
                  )}
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
