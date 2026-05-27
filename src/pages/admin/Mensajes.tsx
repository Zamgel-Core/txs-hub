// 📍 Ruta del archivo: src/pages/admin/Mensajes.tsx

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  Search,
  Send,
  X,
} from "lucide-react";

import { supabase } from "@/src/lib/supabase";

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClasses(status: MessageItem["status"]) {
  if (status === "pendiente") {
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  }

  if (status === "leido") {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }

  return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
}

function getCategoryClasses(category: MessageItem["category"]) {
  if (category === "pago") {
    return "bg-gold-500/10 text-gold-400 border border-gold-500/20";
  }

  if (category === "ayuda") {
    return "bg-red-500/10 text-red-400 border border-red-500/20";
  }

  if (category === "membresia") {
    return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  }

  if (category === "asistencia") {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }

  return "bg-zinc-800 text-zinc-300 border border-zinc-700";
}

export function Mensajes() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replies, setReplies] = useState<Record<string, MessageReply[]>>({});

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessages([]);
      setReplies({});
      setLoading(false);
      return;
    }

    const messagesData = (data as MessageItem[]) || [];
    setMessages(messagesData);

    const ids = messagesData.map((message) => message.id);

    if (ids.length === 0) {
      setReplies({});
      setLoading(false);
      return;
    }

    const { data: repliesData, error: repliesError } = await supabase
      .from("message_replies")
      .select("*")
      .in("message_id", ids)
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error(repliesError);
      setReplies({});
      setLoading(false);
      return;
    }

    const groupedReplies: Record<string, MessageReply[]> = {};

    ((repliesData as MessageReply[]) || []).forEach((reply) => {
      if (!groupedReplies[reply.message_id]) {
        groupedReplies[reply.message_id] = [];
      }

      groupedReplies[reply.message_id].push(reply);
    });

    setReplies(groupedReplies);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("messages")
      .update({
        status: "leido",
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await loadMessages();
  }

  async function markAsResolved(id: string) {
    const { error } = await supabase
      .from("messages")
      .update({
        status: "resuelto",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await loadMessages();
  }

  async function saveReply() {
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: replyError } = await supabase
      .from("message_replies")
      .insert({
        message_id: selectedMessage.id,
        sender_role: "admin",
        sender_name: "Administración TXS",
        sender_email: user?.email || "admin@txshub.com",
        reply: replyText.trim(),
      });

    if (replyError) {
      console.error(replyError);
      setSendingReply(false);
      return;
    }

    const { error: statusError } = await supabase
      .from("messages")
      .update({
        status: "leido",
      })
      .eq("id", selectedMessage.id);

    if (statusError) {
      console.error(statusError);
    }

    setSendingReply(false);
    setSelectedMessage(null);
    setReplyText("");

    await loadMessages();
  }

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      const matchesSearch =
        item.sender_name.toLowerCase().includes(search.toLowerCase()) ||
        item.sender_email.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const pendingCount = messages.filter(
    (message) => message.status === "pendiente",
  ).length;

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Bandeja TXS
          </h1>

          <p className="text-zinc-500 mt-2">
            Mensajes internos enviados por alumnos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-zinc-500 mb-1">Pendientes</p>

            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-amber-400" />

              <span className="text-xl font-bold text-amber-400">
                {pendingCount}
              </span>
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Total</p>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" />

              <span className="text-xl font-bold text-white">
                {messages.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#090909] border border-yellow-500/20 rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-900 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />

            <input
              type="text"
              placeholder="Buscar mensaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-yellow-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
          >
            <option value="all">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="leido">Leídos</option>
            <option value="resuelto">Resueltos</option>
          </select>
        </div>

        <div className="divide-y divide-zinc-900">
          {loading ? (
            <div className="py-24 text-center text-zinc-500">
              Cargando mensajes...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-24 text-center text-zinc-500">
              No hay mensajes registrados.
            </div>
          ) : (
            filteredMessages.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 hover:bg-[#0d0d0d] transition-all"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryClasses(
                          item.category,
                        )}`}
                      >
                        {item.category}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>

                      <span className="text-xs text-zinc-600">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">
                      {item.subject}
                    </h2>

                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
                      <span className="text-zinc-300 font-medium">
                        {item.sender_name}
                      </span>

                      <span className="text-zinc-500">{item.sender_email}</span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/30 p-4">
                      <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {replies[item.id]?.length > 0 && (
                      <div className="mt-5 space-y-3 border-t border-zinc-900 pt-4">
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
                                  : reply.sender_name}
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
                  </div>

                  <div className="flex flex-row xl:flex-col gap-3 xl:min-w-[180px]">
                    {item.status === "pendiente" && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="flex-1 xl:w-full h-11 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-black font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Marcar leído
                      </button>
                    )}

                    {item.status !== "resuelto" && (
                      <button
                        onClick={() => markAsResolved(item.id)}
                        className="flex-1 xl:w-full h-11 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolver
                      </button>
                    )}

                    <button
                      disabled={item.status === "resuelto"}
                      onClick={() => {
                        setSelectedMessage(item);
                        setReplyText("");
                      }}
                      className={`flex-1 xl:w-full h-11 rounded-xl border font-semibold transition-all flex items-center justify-center gap-2 ${
                        item.status === "resuelto"
                          ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "border-zinc-800 text-zinc-300 hover:border-yellow-500/30 hover:text-yellow-400"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-gold-500/20 bg-[#090909] overflow-hidden">
            <div className="p-6 border-b border-zinc-900 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Responder mensaje
                </h2>

                <p className="text-zinc-500 mt-1">
                  {selectedMessage.sender_name}
                </p>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="w-10 h-10 rounded-xl border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-4 text-zinc-300 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                placeholder="Escribe la respuesta para el alumno..."
                className="w-full rounded-2xl border border-zinc-800 bg-[#111111] p-4 text-white outline-none focus:border-gold-500/40"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="h-12 px-5 rounded-xl border border-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>

                <button
                  onClick={saveReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="h-12 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {sendingReply ? "Guardando..." : "Enviar respuesta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
