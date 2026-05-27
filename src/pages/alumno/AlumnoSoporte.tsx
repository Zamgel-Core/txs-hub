// 📍 Ruta del archivo: src/pages/alumno/AlumnoSoporte.tsx

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";

import { supabase } from "@/src/lib/supabase";

type Student = {
  id: string;
  full_name: string;
  email: string;
};

type MessageItem = {
  id: string;
  student_id: string | null;
  sender_email: string;
  sender_name: string;
  category: "pago" | "ayuda" | "membresia" | "asistencia" | "otro";
  subject: string;
  message: string;
  status: "pendiente" | "leido" | "resuelto";
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
};

type MessageReply = {
  id: string;
  message_id: string;
  sender_role: "admin" | "alumno";
  sender_name: string;
  sender_email: string;
  reply: string;
  created_at: string;
};

const categoryOptions = [
  { value: "ayuda", label: "Ayuda general" },
  { value: "pago", label: "Pago" },
  { value: "membresia", label: "Membresía" },
  { value: "asistencia", label: "Asistencia" },
  { value: "otro", label: "Otro" },
] as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: MessageItem["status"]) {
  if (status === "pendiente") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (status === "leido") {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
}

export function AlumnoSoporte() {
  const [student, setStudent] = useState<Student | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replies, setReplies] = useState<Record<string, MessageReply[]>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [category, setCategory] = useState<MessageItem["category"]>("ayuda");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadSupportData();
  }, []);

  async function loadSupportData() {
    setLoading(true);
    setNotice("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setLoading(false);
      return;
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, full_name, email")
      .ilike("email", user.email)
      .maybeSingle();

    if (studentError || !studentData) {
      console.error(studentError);
      setLoading(false);
      return;
    }

    setStudent(studentData as Student);

    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_email", studentData.email)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error(messagesError);
      setLoading(false);
      return;
    }

    const messagesList = (messagesData as MessageItem[]) || [];

    setMessages(messagesList);

    const ids = messagesList.map((message) => message.id);

    if (ids.length > 0) {
      const { data: repliesData, error: repliesError } = await supabase
        .from("message_replies")
        .select("*")
        .in("message_id", ids)
        .order("created_at", { ascending: true });

      if (repliesError) {
        console.error(repliesError);
      } else {
        const groupedReplies: Record<string, MessageReply[]> = {};

        ((repliesData as MessageReply[]) || []).forEach((reply) => {
          if (!groupedReplies[reply.message_id]) {
            groupedReplies[reply.message_id] = [];
          }

          groupedReplies[reply.message_id].push(reply);
        });

        setReplies(groupedReplies);
      }
    }

    setLoading(false);
  }

  async function handleSendMessage() {
    setNotice("");

    if (!student) {
      setNotice("No se pudo identificar tu cuenta.");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setNotice("Escribe un asunto y un mensaje.");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      student_id: student.id,
      sender_email: student.email,
      sender_name: student.full_name,
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: "pendiente",
    });

    setSending(false);

    if (error) {
      console.error(error);
      setNotice("No se pudo enviar tu mensaje.");
      return;
    }

    setSubject("");
    setMessage("");
    setCategory("ayuda");

    setNotice("Mensaje enviado correctamente.");

    await loadSupportData();
  }

  async function sendReply(messageId: string) {
    const text = replyInputs[messageId];

    if (!text?.trim() || !student) return;

    const { error } = await supabase.from("message_replies").insert({
      message_id: messageId,
      sender_role: "alumno",
      sender_name: student.full_name,
      sender_email: student.email,
      reply: text.trim(),
    });

    if (error) {
      console.error(error);
      return;
    }

    await supabase
      .from("messages")
      .update({
        status: "pendiente",
      })
      .eq("id", messageId);

    setReplyInputs((prev) => ({
      ...prev,
      [messageId]: "",
    }));

    await loadSupportData();
  }

  const pendingMessages = useMemo(() => {
    return messages.filter((item) => item.status === "pendiente").length;
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-4" />
        Cargando soporte...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Soporte TXS
          </h1>

          <p className="text-zinc-500 mt-2">
            Envía solicitudes internas a administración y revisa tus mensajes.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Pendientes</p>

            <div className="flex items-center gap-2 mt-1">
              <Clock3 className="w-4 h-4 text-amber-400" />

              <span className="text-xl font-bold text-amber-400">
                {pendingMessages}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#121212] px-4 py-3">
            <p className="text-xs text-zinc-500">Total</p>

            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-zinc-400" />

              <span className="text-xl font-bold text-white">
                {messages.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="rounded-3xl border border-gold-500/20 bg-[#090909] overflow-hidden">
          <div className="p-5 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gold-500/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-gold-500" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Nuevo mensaje</h2>

                <p className="text-sm text-zinc-500">
                  Escribe a administración.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm text-zinc-500 mb-2 block">
                Categoría
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MessageItem["category"])
                }
                className="w-full h-12 rounded-xl border border-zinc-800 bg-[#111111] px-4 text-white outline-none focus:border-gold-500/40"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-500 mb-2 block">Asunto</label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Duda sobre mi membresía"
                className="w-full h-12 rounded-xl border border-zinc-800 bg-[#111111] px-4 text-white outline-none focus:border-gold-500/40"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-500 mb-2 block">
                Mensaje
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Describe tu solicitud..."
                className="w-full rounded-xl border border-zinc-800 bg-[#111111] p-4 text-white outline-none focus:border-gold-500/40 resize-none"
              />
            </div>

            {notice && (
              <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-3 text-sm text-gold-300">
                {notice}
              </div>
            )}

            <button
              onClick={handleSendMessage}
              disabled={sending}
              className="w-full h-12 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar mensaje
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-[#090909] overflow-hidden">
          <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Mis solicitudes</h2>

              <p className="text-sm text-zinc-500">
                Historial de mensajes enviados.
              </p>
            </div>

            <MessageSquare className="w-5 h-5 text-gold-500" />
          </div>

          <div className="divide-y divide-zinc-900">
            {messages.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">
                No has enviado mensajes todavía.
              </div>
            ) : (
              messages.map((item) => (
                <div key={item.id} className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-400 text-xs font-semibold capitalize">
                          {item.category}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusClass(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-white font-bold">{item.subject}</h3>

                      <p className="text-xs text-zinc-600 mt-1">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-300 whitespace-pre-wrap">
                    {item.message}
                  </div>

                  {replies[item.id]?.length > 0 && (
                    <div className="space-y-3 border-t border-zinc-900 pt-4">
                      {replies[item.id].map((reply) => (
                        <div
                          key={reply.id}
                          className={`rounded-2xl p-4 border ${
                            reply.sender_role === "admin"
                              ? "bg-blue-500/10 border-blue-500/20"
                              : "bg-zinc-900 border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="text-sm font-semibold text-white">
                              {reply.sender_role === "admin"
                                ? "Administración TXS"
                                : "Tú"}
                            </p>

                            <span className="text-xs text-zinc-500">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>

                          <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {reply.reply}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.status !== "resuelto" && (
                    <div className="border-t border-zinc-900 pt-4 space-y-3">
                      <textarea
                        value={replyInputs[item.id] || ""}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="Responder conversación..."
                        className="w-full rounded-2xl border border-zinc-800 bg-[#111111] px-4 py-3 min-h-[110px] outline-none focus:border-yellow-500/40"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={() => sendReply(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all"
                        >
                          Responder
                        </button>
                      </div>
                    </div>
                  )}

                  {item.status === "resuelto" && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                        <p className="text-sm text-emerald-300 font-medium">
                          Conversación resuelta por administración.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
