// 📍 Ruta: src/pages/public/AcademiaInscripcion.tsx

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HelpCircle,
  MapPin,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

const WHATSAPP_NUMBER = "528991019210";

const faqs = [
  {
    question: "¿Necesito experiencia para entrar?",
    answer:
      "No. Tenemos clases para principiantes y alumnos que empiezan desde cero.",
  },
  {
    question: "¿Qué estilos enseñan?",
    answer:
      "Principalmente baile texano/norteño, cumbia, técnica de pareja, vueltas, ritmo y estilo social.",
  },
  {
    question: "¿Qué edades aceptan?",
    answer:
      "La información exacta se confirma directo con el instructor según grupo y disponibilidad.",
  },
  {
    question: "¿Cuáles son los costos?",
    answer:
      "Los costos se manejan directamente con el instructor para darte información actualizada.",
  },
  {
    question: "¿Dónde están ubicados?",
    answer:
      "TXS Academy se encuentra en Reynosa, Tamaulipas. La ubicación exacta se confirma por WhatsApp.",
  },
];

const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Sábado"];

export function AcademiaInscripcion() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    city: "",
    experience: "Nunca he bailado",
    goal: "Aprender desde cero",
    attendanceType: "Solo",
    schedule: "Noche",
    source: "Facebook",
    eventsInfo: "Sí",
    message: "",
  });

  const [availableDays, setAvailableDays] = useState<string[]>([]);

  function toggleDay(day: string) {
    setAvailableDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  }

  const selectedDaysText =
    availableDays.length > 0 ? availableDays.join(", ") : "Sin especificar";

  const whatsappUrl = useMemo(() => {
    const message = `Hola TXS Academy, me interesa ingresar a la academia.

Nombre: ${form.name || "Sin especificar"}
Edad: ${form.age || "Sin especificar"}
Ciudad: ${form.city || "Sin especificar"}

Experiencia:
${form.experience}

Objetivo:
${form.goal}

Asistiré:
${form.attendanceType}

Horario preferido:
${form.schedule}

Días disponibles:
${selectedDaysText}

Conocí TXS por:
${form.source}

¿Deseo información de eventos/presentaciones?
${form.eventsInfo}

Mensaje adicional:
${form.message || "Me gustaría recibir información sobre grupos, horarios, costos y disponibilidad."}

Quedo atento(a), gracias.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [form, selectedDaysText]);

  return (
    <div className="bg-txs-black text-white">
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0">
          <img
            src="/academia/2.jpeg"
            alt="TXS Academy"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-gold-500/20 blur-[130px]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
              <Sparkles className="h-4 w-4" />
              Inscripción TXS Academy
            </div>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              Solicita información para unirte a{" "}
              <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700 bg-clip-text text-transparent">
                TXS Academy
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Contesta unas preguntas rápidas y genera un mensaje directo para
              WhatsApp. El instructor te confirmará costos, disponibilidad y el
              grupo ideal para ti.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/50 px-4 py-2 text-sm text-zinc-300">
                <MessageCircle className="h-4 w-4 text-gold-400" />
                WhatsApp directo
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/50 px-4 py-2 text-sm text-zinc-300">
                <Clock3 className="h-4 w-4 text-gold-400" />
                Respuesta por instructor
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/50 px-4 py-2 text-sm text-zinc-300">
                <MapPin className="h-4 w-4 text-gold-400" />
                Reynosa, Tamaulipas
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-400">
              <HelpCircle className="h-4 w-4" />
              Preguntas frecuentes
            </div>

            <h2 className="text-4xl font-black">Antes de inscribirte</h2>

            <p className="mt-3 text-zinc-400">
              Información rápida para resolver dudas comunes antes de contactar
              al instructor.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                className="border-zinc-800 bg-zinc-950/80"
              >
                <CardContent className="p-5">
                  <h3 className="font-bold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-gold-500/25 bg-gradient-to-br from-gold-500/10 via-zinc-950 to-black shadow-2xl shadow-gold-500/10">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                <User className="h-7 w-7 text-gold-400" />
              </div>

              <h2 className="text-3xl font-black">Formulario inteligente</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Tus respuestas se enviarán como mensaje predeterminado por
                WhatsApp para que el instructor pueda orientarte mejor.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Nombre
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Tu nombre"
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Edad
                  </label>
                  <input
                    value={form.age}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        age: event.target.value,
                      }))
                    }
                    placeholder="Ej. 25"
                    className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Ciudad
                  </label>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    placeholder="Ej. Reynosa"
                    className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Experiencia bailando
                </label>
                <select
                  value={form.experience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      experience: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50"
                >
                  <option>Nunca he bailado</option>
                  <option>Menos de 6 meses</option>
                  <option>6 meses a 1 año</option>
                  <option>Más de 1 año</option>
                  <option>Ya tomo clases actualmente</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  ¿Qué buscas?
                </label>
                <select
                  value={form.goal}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      goal: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50"
                >
                  <option>Aprender desde cero</option>
                  <option>Mejorar técnica</option>
                  <option>Bailar socialmente</option>
                  <option>Presentaciones</option>
                  <option>Competencias</option>
                  <option>Todo lo anterior</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  ¿Asistirás?
                </label>
                <select
                  value={form.attendanceType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      attendanceType: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50"
                >
                  <option>Solo</option>
                  <option>Con pareja</option>
                  <option>Con amigos</option>
                  <option>Aún no lo sé</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Horario preferido
                </label>
                <select
                  value={form.schedule}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      schedule: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50"
                >
                  <option>Mañana</option>
                  <option>Tarde</option>
                  <option>Noche</option>
                  <option>Flexible</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-300">
                  ¿Qué días puedes asistir?
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {weekDays.map((day) => {
                    const active = availableDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-gold-500/50 bg-gold-500/15 text-gold-400"
                            : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700 hover:text-white"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  ¿Cómo conociste TXS?
                </label>
                <select
                  value={form.source}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      source: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50"
                >
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>Evento</option>
                  <option>Recomendación</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  ¿Te gustaría recibir información de eventos y presentaciones?
                </label>
                <select
                  value={form.eventsInfo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      eventsInfo: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white outline-none transition focus:border-gold-500/50"
                >
                  <option>Sí</option>
                  <option>No</option>
                  <option>Tal vez después</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Mensaje adicional
                </label>
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Ej. Me gustaría saber costos, horarios disponibles y cómo puedo empezar."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-zinc-800 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10"
                />
              </div>

              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <Button
                  variant="gold"
                  className="h-12 w-full gap-2 rounded-full text-sm font-bold"
                >
                  Enviar por WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>

              <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="h-4 w-4 text-gold-400" />
                  Mensaje que se enviará
                </div>

                <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-500">
                  Hola TXS Academy, me interesa ingresar a la academia.
                  {"\n\n"}
                  Nombre: {form.name || "Sin especificar"}
                  {"\n"}
                  Edad: {form.age || "Sin especificar"}
                  {"\n"}
                  Ciudad: {form.city || "Sin especificar"}
                  {"\n\n"}
                  Experiencia: {form.experience}
                  {"\n"}
                  Objetivo: {form.goal}
                  {"\n"}
                  Asistiré: {form.attendanceType}
                  {"\n"}
                  Horario preferido: {form.schedule}
                  {"\n"}
                  Días disponibles: {selectedDaysText}
                  {"\n"}
                  Conocí TXS por: {form.source}
                  {"\n"}
                  Eventos/presentaciones: {form.eventsInfo}
                  {"\n\n"}
                  Mensaje adicional:{" "}
                  {form.message ||
                    "Me gustaría recibir información sobre grupos, horarios, costos y disponibilidad."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-24">
        <Card className="overflow-hidden border-gold-500/20 bg-zinc-950/80">
          <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                ¿Quieres ver primero la academia?
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Puedes regresar a la galería, videos y detalles antes de enviar
                tu mensaje.
              </p>
            </div>

            <Link to="/academia">
              <Button variant="outline" className="gap-2 rounded-full">
                Volver a Academia
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
