// 📍 Ruta del archivo: src/components/alumno/PaymentModal.tsx

import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Mail, X } from "lucide-react";
import { supabase } from "@/src/lib/supabase";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
};

export function PaymentModal({
  isOpen,
  onClose,
  studentName,
}: PaymentModalProps) {
  const [message, setMessage] = useState(
    "Hola, quiero renovar mi membresía. Favor de indicarme el proceso de pago.",
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  async function handleSendInternalMessage() {
    setSending(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      setErrorMessage("No se pudo identificar tu sesión.");
      setSending(false);
      return;
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, full_name, email")
      .ilike("email", user.email)
      .maybeSingle();

    if (studentError || !studentData) {
      setErrorMessage("No se encontró tu perfil de alumno.");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("messages").insert({
      student_id: studentData.id,
      sender_email: studentData.email,
      sender_name: studentData.full_name,
      category: "pago",
      subject: "Solicitud de renovación de membresía",
      message,
      status: "pendiente",
    });

    setSending(false);

    if (error) {
      console.error(error);
      setErrorMessage("No se pudo enviar la solicitud.");
      return;
    }

    setSent(true);
  }

  function handleClose() {
    setSent(false);
    setErrorMessage("");
    setMessage(
      "Hola, quiero renovar mi membresía. Favor de indicarme el proceso de pago.",
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-gold-500/20 bg-[#090909] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-black text-white">Pagar Membresía</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Solicitud de pago para {studentName || "alumno TXS"}.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {sent ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} />
              </div>

              <h3 className="text-white font-bold text-xl">
                Solicitud enviada
              </h3>

              <p className="text-sm text-zinc-400 mt-2">
                Tu mensaje ya llegó a la Bandeja TXS. Administración revisará tu
                solicitud y actualizará tu membresía cuando confirme el pago.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gold-500 text-black flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="text-white font-bold">Pago pendiente</p>
                    <p className="text-sm text-zinc-400">
                      Tu membresía será actualizada cuando administración
                      confirme el pago.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <p className="text-sm text-zinc-400">
                  Envía una solicitud interna a administración. El mensaje
                  aparecerá directamente en la Bandeja TXS.
                </p>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-200 outline-none focus:border-gold-500/50"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}

              <button
                onClick={handleSendInternalMessage}
                disabled={sending}
                className="w-full h-12 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Enviar solicitud
                  </>
                )}
              </button>
            </>
          )}

          <a
            href={`mailto:facturacion@txshub.com?subject=${encodeURIComponent(
              "Renovación de membresía TXS HUB",
            )}&body=${encodeURIComponent(
              `Hola, quiero renovar mi membresía.

Alumno: ${studentName || "Alumno TXS"}

Favor de indicarme el proceso de pago.`,
            )}`}
            className="w-full h-12 rounded-xl border border-zinc-800 text-zinc-300 hover:border-gold-500/40 hover:text-gold-400 font-semibold flex items-center justify-center transition-all"
          >
            Enviar por correo
          </a>

          <button
            onClick={handleClose}
            className="w-full h-12 rounded-xl border border-zinc-800 text-zinc-300 hover:border-zinc-600 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
