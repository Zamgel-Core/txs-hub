import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Terminos() {
  return (
    <div className="min-h-screen bg-txs-black pt-24 pb-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-40 right-10 opacity-[0.03] pointer-events-none mix-blend-screen">
        <img src="/branding/sombrero_TSX.png" alt="" className="w-[400px] h-auto grayscale" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 relative z-10">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <Sparkles className="w-8 h-8 text-gold-500" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Términos y Condiciones</h1>
          <p className="text-zinc-400 text-lg">Última actualización: Mayo 2026</p>
        </div>

        <div className="bg-txs-card/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="prose prose-invert prose-zinc max-w-none">
            <h2 className="text-gold-500 font-display text-2xl mb-4">1. Uso del sistema TXS HUB</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              TXS HUB es la plataforma oficial de Texano Show para la gestión de alumnos, eventos y producciones. El uso de esta plataforma está sujeto a la aceptación de los presentes términos. Al acceder a su portal o utilizar nuestros servicios, usted acepta apegarse a estas normativas.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">2. Acceso a panel de alumnos</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              El acceso al portal de alumnos es exclusivo para personas inscritas activamente en la Academia Texano Show. Las credenciales de acceso son personales e intransferibles. El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">3. Registro de pagos</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Los pagos registrados en el sistema son finales. El registro de mensualidades, inscripciones o pagos especiales para eventos debe realizarse dentro de los periodos establecidos para mantener el estado de "Alumno Activo" y mantener el acceso a clases.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">4. Consulta de membresías</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              El estatus de las membresías refleja la situación actual del alumno. TXS HUB actualiza esta información en tiempo real conforme se procesan los pagos en recepción o mediante las vías oficiales de pago.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">5. Responsabilidad del usuario</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              El usuario se compromete a proporcionar información veraz durante su registro y mantener sus datos actualizados. El uso indebido de la plataforma, como intentos de modificación no autorizada de datos, resultará en la suspensión inmediata de la cuenta.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">6. Cambios en el servicio</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              Texano Show se reserva el derecho de modificar, suspender o discontinuar características de TXS HUB, notificando oportunamente a los usuarios a través del mismo portal de alumnos o vías de contacto registradas.
            </p>

            <h2 className="text-gold-500 font-display text-2xl mb-4">7. Contacto</h2>
            <p className="text-zinc-300 leading-relaxed">
              Para cualquier duda relacionada con estos términos y condiciones, por favor contáctenos en <a href="mailto:txshub@gmail.com" className="text-gold-400 hover:text-gold-300 transition-colors">txshub@gmail.com</a>.
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
