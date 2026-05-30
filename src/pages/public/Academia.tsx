// 📍 Ruta: src/pages/public/Academia.tsx

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HeartHandshake,
  Music,
  Play,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

const gallery = [
  {
    src: "/academia/2.jpeg",
    title: "Presentaciones",
    className: "md:col-span-2 aspect-[16/7]",
    objectPosition: "object-center",
  },
  {
    src: "/academia/4.jpeg",
    title: "Coreografías",
    className: "aspect-[4/5]",
    objectPosition: "object-center",
  },
  {
    src: "/academia/6.jpeg",
    title: "Parejas de baile",
    className: "md:col-span-2 aspect-[16/8]",
    objectPosition: "object-center",
  },
  {
    src: "/academia/7.jpeg",
    title: "Técnica y estilo",
    className: "aspect-[4/5]",
    objectPosition: "object-center",
  },
  {
    src: "/academia/8.jpeg",
    title: "Nivel avanzado",
    className: "aspect-[4/5]",
    objectPosition: "object-center",
  },
  {
    src: "/academia/9.jpeg",
    title: "Pasión por bailar",
    className: "aspect-[4/5]",
    objectPosition: "object-center",
  },
  {
    src: "/academia/5.jpeg",
    title: "Comunidad TXS",
    className: "md:col-span-2 aspect-[16/8]",
    objectPosition: "object-center",
  },
];

const demoVideos = [
  {
    src: "/academia/instructor.mp4",
    title: "Instructor TXS",
    description: "Técnica y estilo en pista.",
  },
  {
    src: "/academia/alumno_demostracion.mp4",
    title: "Alumno en práctica",
    description: "Progreso real dentro de clase.",
  },
  {
    src: "/academia/maestro_demostracion.mp4",
    title: "Demostración maestro",
    description: "Guía, ritmo y precisión.",
  },
];

const levels = [
  {
    title: "Principiantes",
    description:
      "Aprende desde cero: pasos básicos, ritmo, postura, conexión y seguridad en pista.",
    icon: GraduationCap,
  },
  {
    title: "Intermedio",
    description:
      "Perfecciona vueltas, combinaciones, técnica, musicalidad y desplazamientos.",
    icon: Music,
  },
  {
    title: "Avanzado",
    description:
      "Entrenamiento más intenso para presentaciones, coreografías y dominio escénico.",
    icon: Trophy,
  },
];

const benefits = [
  "Clases por niveles",
  "Ambiente familiar",
  "Eventos y presentaciones",
  "Instructores con experiencia",
  "Portal digital del alumno",
  "Seguimiento de asistencia",
];

export function Academia() {
  return (
    <div className="bg-txs-black text-white">
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-28">
        <div className="absolute inset-0">
          <video
            src="/academia/instructor.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-45"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-txs-black via-transparent to-black/40" />
          <div className="absolute -left-48 top-1/3 h-[520px] w-[520px] rounded-full bg-gold-500/20 blur-[130px]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.75fr] lg:items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-400"
              >
                <Sparkles className="h-4 w-4" />
                TXS Academy
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl"
              >
                Aprende a bailar con estilo{" "}
                <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700 bg-clip-text text-transparent">
                  texano
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300"
              >
                Clases de baile por niveles, comunidad, eventos, presentaciones
                y una experiencia premium para alumnos que quieren aprender,
                convivir y crecer en pista.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <Link to="/academia/inscripcion">
                  <Button variant="gold" className="gap-2 rounded-full px-7">
                    Inscribirme
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <a href="#galeria">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-full border-gold-500/30 px-7 text-gold-400 hover:bg-gold-500 hover:text-black"
                  >
                    Ver galería
                    <Play className="h-4 w-4" />
                  </Button>
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto aspect-[9/16] max-h-[620px] w-full max-w-[330px] overflow-hidden rounded-[2rem] border border-gold-500/30 bg-black shadow-2xl shadow-gold-500/10">
                <video
                  src="/academia/instructor.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold-400">
                    Instructor TXS
                  </p>
                  <h3 className="mt-2 text-2xl font-black">Movimiento real</h3>
                  <p className="mt-1 text-sm text-zinc-300">
                    Técnica, ritmo y confianza en cada clase.
                  </p>
                </div>
              </div>

              <div className="absolute -right-8 top-12 rounded-2xl border border-zinc-800 bg-black/70 p-4 backdrop-blur-xl">
                <p className="text-3xl font-black text-gold-400">100%</p>
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Energía TXS
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Alumnos", "28+"],
            ["Niveles", "3"],
            ["Eventos", "Live"],
            ["Experiencia", "Premium"],
          ].map(([label, value]) => (
            <Card key={label} className="border-gold-500/15 bg-zinc-950/80">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-black text-gold-400">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800/80 bg-zinc-950/50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
              <Music className="h-4 w-4" />
              Formación TXS
            </div>

            <h2 className="text-4xl font-black md:text-5xl">
              Clases para cada etapa de tu baile
            </h2>

            <p className="mt-4 text-zinc-400">
              Desde tus primeros pasos hasta presentaciones y coreografías con
              mayor nivel técnico.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {levels.map((level, index) => {
              const Icon = level.icon;

              return (
                <motion.div
                  key={level.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="h-full border-zinc-800 bg-zinc-950/80 transition hover:-translate-y-1 hover:border-gold-500/30 hover:shadow-2xl hover:shadow-gold-500/10">
                    <CardContent className="p-7">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                        <Icon className="h-6 w-6 text-gold-400" />
                      </div>

                      <h3 className="text-2xl font-black text-white">
                        {level.title}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        {level.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
            <Play className="h-4 w-4" />
            Demostraciones TXS
          </div>

          <h2 className="text-4xl font-black md:text-5xl">
            Aprende viendo movimiento real
          </h2>

          <p className="mt-4 text-zinc-400">
            Técnica, ritmo, práctica y demostraciones reales de clase con
            alumnos e instructor.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {demoVideos.map((video, index) => (
            <motion.div
              key={video.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="overflow-hidden rounded-[2rem] border border-gold-500/20 bg-zinc-950 shadow-2xl shadow-gold-500/5"
            >
              <div className="aspect-[9/16] bg-black">
                <video
                  src={video.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
                  TXS Academy
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  {video.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="galeria" className="container mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
              <Star className="h-4 w-4" />
              Galería TXS
            </div>

            <h2 className="text-4xl font-black md:text-5xl">
              Momentos reales de nuestra academia
            </h2>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Clases, convivencia, presentaciones y experiencias que forman
              parte de la comunidad TXS.
            </p>
          </div>

          <Link to="/academia/inscripcion">
            <Button
              variant="outline"
              className="rounded-full border-gold-500/30 text-gold-400"
            >
              Quiero formar parte
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {gallery.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              className={`group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 ${image.className}`}
            >
              <img
                src={image.src}
                alt={image.title}
                className={`h-full w-full object-cover ${image.objectPosition} transition duration-700 group-hover:scale-105`}
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
                  TXS Academy
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  {image.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-800/80 bg-black py-24">
        <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-gold-500/25 bg-zinc-950 shadow-2xl shadow-gold-500/10">
            <video
              src="/academia/instructor.mp4"
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
              <HeartHandshake className="h-4 w-4" />
              Más que clases
            </div>

            <h2 className="text-4xl font-black md:text-5xl">
              Una comunidad donde aprendes, bailas y disfrutas
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-400 leading-relaxed">
              TXS Academy combina técnica, disciplina, ambiente familiar y
              eventos para que cada alumno viva una experiencia completa dentro
              y fuera de clase.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-gold-400" />
                  <span className="text-sm font-semibold text-zinc-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/academia/inscripcion" className="mt-8 inline-block">
              <Button variant="gold" className="gap-2 rounded-full px-7">
                Quiero información
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-24">
        <Card className="overflow-hidden border-gold-500/25 bg-gradient-to-br from-gold-500/10 via-zinc-950 to-black">
          <CardContent className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-[1fr_0.8fr] lg:p-10">
            <div>
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
                  <CalendarDays className="h-4 w-4" />
                  Clases semanales
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
                  <Clock3 className="h-4 w-4" />
                  Horarios por grupo
                </span>
              </div>

              <h2 className="text-4xl font-black">
                ¿Listo para formar parte de TXS Academy?
              </h2>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Regístrate para acceder al portal del alumno, consultar tus
                clases, eventos, avisos y estado de membresía.
              </p>

              <Link to="/academia/inscripcion" className="mt-7 inline-block">
                <Button variant="gold" className="gap-2 rounded-full px-7">
                  Hablar con un instructor
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                <Users className="h-7 w-7 text-gold-400" />
              </div>

              <h3 className="text-2xl font-black">TXS Experience</h3>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Comunidad, disciplina, baile, convivencia y producción premium
                en un solo ecosistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
