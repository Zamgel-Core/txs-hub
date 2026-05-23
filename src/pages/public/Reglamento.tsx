import { BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Reglamento() {
  return (
    <div className="min-h-screen bg-txs-black pt-24 pb-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 opacity-[0.03] pointer-events-none mix-blend-screen">
        <img src="/branding/sombrero_TSX.png" alt="" className="w-[500px] h-auto grayscale" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 relative z-10">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <BookOpen className="w-8 h-8 text-gold-500" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Reglamento Interno</h1>
          <p className="text-zinc-400 text-lg">Políticas para alumnos y miembros de Texano Show</p>
        </div>

        <div className="bg-txs-card/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="prose prose-invert prose-zinc max-w-none">
            <h2 className="text-gold-500 font-display text-2xl mb-4">1. Pagos y membresías</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Las mensualidades y cuotas deben cubrirse puntualmente dentro de los primeros días del periodo correspondiente. El retraso en los pagos puede causar la suspensión temporal del acceso a clases y portal. Es responsabilidad del alumno guardar sus comprobantes hasta que el pago se refleje en su cuenta TXS HUB.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">2. Puntualidad</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Se requiere presentarse 10 minutos antes del inicio de cada clase para comenzar con el calentamiento a tiempo. Después de 15 minutos de iniciada la sesión, el pase a la clase quedará sujeto a la decisión del instructor para evitar interrupciones o lesiones por falta de calentamiento.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">3. Asistencia</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Para formaciones coreográficas y preparación para eventos, es indispensable mantener un porcentaje mínimo de asistencia del 80%. Las inasistencias por motivos de salud o fuerza mayor deben ser justificadas a la brevedad con el equipo de administración.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">4. Conducta</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              En las instalaciones y eventos de Texano Show se exige un comportamiento de respeto mutuo hacia instructores, personal administrativo, compañeros alumnos y asistentes. No se tolerará la discriminación, el acoso o cualquier actitud antideportiva.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">5. Uso del portal alumno</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              El alumno debe revisar periódicamente TXS HUB para estar al tanto de su estatus, avisos importantes y calendario de clases. Los requerimientos de vestuario, ensayos adicionales o cambios de horario se publicarán oficialmente por este medio.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">6. Eventos y avisos</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              La participación en eventos de producción, presentaciones y shows externos requiere compromiso total. El abandono de montajes sin causa justificada puede resultar en la no consideración para futuros eventos selectivos.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">7. Comunicación oficial</h2>
            <p className="text-zinc-300 leading-relaxed">
              Toda petición, queja o sugerencia formal deberá canalizarse a la administración mediante los canales oficiales, como el correo electrónico o directamente en recepción.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-gold-500 hover:text-gold-400 transition-colors font-medium border-b border-gold-500/30 hover:border-gold-500 pb-1">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
