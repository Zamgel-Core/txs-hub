import { Sparkles, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function Privacidad() {
  return (
    <div className="min-h-screen bg-txs-black pt-24 pb-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-40 left-10 opacity-[0.03] pointer-events-none mix-blend-screen transform -scale-x-100">
        <img src="/branding/sombrero_TSX.png" alt="" className="w-[400px] h-auto grayscale" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 relative z-10">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <Shield className="w-8 h-8 text-gold-500" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Aviso de Privacidad</h1>
          <p className="text-zinc-400 text-lg">Última actualización: Mayo 2026</p>
        </div>

        <div className="bg-txs-card/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="prose prose-invert prose-zinc max-w-none">
            <h2 className="text-gold-500 font-display text-2xl mb-4">1. Datos que se recopilan</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              En TXS HUB recopilamos información personal necesaria para la gestión de su cuenta y participación en la Academia y Eventos. Esto incluye: datos de identificación (nombre completo), información de contacto (correo electrónico, teléfono), historial de pagos y registro de asistencias a clases.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">2. Uso de la información</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Su información será utilizada primordialmente para los siguientes fines: creación y mantenimiento de su perfil de alumno, registro y seguimiento de pagos, control de asistencias, envío de comunicados oficiales sobre eventos y clases, y para brindar soporte relacionado con su estancia en la academia.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">3. Protección de datos</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. Su información se encuentra resguardada en los servidores seguros de TXS HUB.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">4. Acceso de alumnos</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Usted tiene el derecho de acceder a sus datos personales mediante el Portal del Alumno. A través de este medio podrá consultar su información actual, historial de eventos, pagos y asistencias. Toda modificación relevante en sus datos será notificada y replicada en el sistema.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">5. Conservación de información</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Los datos personales se conservarán mientras su cuenta como alumno o cliente activo se mantenga vigente, y por el periodo adicional establecido en la legislación aplicable para cumplir con nuestras obligaciones legales y administrativas.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">6. Contacto para dudas</h2>
            <p className="text-zinc-300 leading-relaxed">
              Si tiene preguntas sobre este Aviso de Privacidad o el tratamiento de sus datos, puede comunicarse con nosotros enviando un correo a <a href="mailto:txshub@gmail.com" className="text-gold-400 hover:text-gold-300 transition-colors">txshub@gmail.com</a>.
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
