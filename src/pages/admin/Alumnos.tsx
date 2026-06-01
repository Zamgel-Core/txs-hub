// 📍 Ruta del archivo: src/pages/admin/Alumnos.tsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  CalendarDays,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Users,
  X,
} from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  group_level: string;
  temporary_password: string;
  is_active: boolean;
  group_id?: string | null;
  membership_status?: string | null;
  membership_type?: string | null;
  membership_start_date?: string | null;
  membership_end_date?: string | null;
  last_payment_date?: string | null;
  payment_notes?: string | null;
}

interface Group {
  id: string;
  name: string;
  schedule: string;
  level: string;
  days?: string | null;
  sort_order?: number | null;
}

interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  duration_count: number;
  duration_unit: "days" | "weeks" | "months";
  classes_per_day?: number | null;
  is_active: boolean;
  sort_order?: number | null;
}

const emptyForm = {
  id: "",
  full_name: "",
  email: "",
  phone: "",
  group_id: "",
  temporary_password: "",
  is_active: true,
  membership_status: "vencida",
  membership_type: "",
  membership_start_date: "",
  membership_end_date: "",
  last_payment_date: "",
  payment_notes: "",
};

function formatDateLocal(date?: string | null) {
  if (!date) return "Sin fecha";

  const cleanDate = String(date).trim();
  if (!cleanDate) return "Sin fecha";

  const dateOnly = cleanDate.includes("T")
    ? cleanDate.split("T")[0]
    : cleanDate;
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) return "Sin fecha";

  const parsed = new Date(year, month - 1, day);

  if (Number.isNaN(parsed.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function normalizeDateInput(date?: string | null) {
  if (!date) return "";
  return String(date).includes("T") ? String(date).split("T")[0] : String(date);
}

function getMembershipBadge(status?: string | null) {
  const normalized = String(status || "vencida").toLowerCase();

  if (normalized === "activa") {
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
  }

  if (normalized === "pausada") {
    return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  }

  if (normalized === "cancelada") {
    return "bg-zinc-500/15 text-zinc-300 border-zinc-600/30";
  }

  return "bg-red-500/20 text-red-400 border-red-500/20";
}

function getMembershipLabel(status?: string | null) {
  const normalized = String(status || "vencida").toLowerCase();

  if (normalized === "activa") return "Activa";
  if (normalized === "pausada") return "Pausada";
  if (normalized === "cancelada") return "Cancelada";

  return "Vencida";
}

export function Alumnos() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const [form, setForm] = useState(emptyForm);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadMembershipPlans();
  }, []);

  async function loadGroups() {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setGroups(data || []);
  }

  async function loadMembershipPlans() {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setMembershipPlans(data || []);
  }

  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setStudents(data || []);
    setLoading(false);
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const safePhone = student.phone || "";
      const safeEmail = student.email || "";
      const safeName = student.full_name || "";

      const matchesSearch =
        safeName.toLowerCase().includes(search.toLowerCase()) ||
        safeEmail.toLowerCase().includes(search.toLowerCase()) ||
        safePhone.includes(search);

      const matchesGroup =
        selectedGroupFilter === "all"
          ? true
          : student.group_id === selectedGroupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [students, search, selectedGroupFilter]);

  function getGroupInfo(groupId?: string | null) {
    if (!groupId) {
      return {
        name: "Sin grupo",
        schedule: "Sin horario",
        days: "",
        level: "",
      };
    }

    const group = groups.find((g) => g.id === groupId);

    if (!group) {
      return {
        name: "Sin grupo",
        schedule: "Sin horario",
        days: "",
        level: "",
      };
    }

    return {
      name: group.name,
      schedule: group.schedule,
      days: group.days || "",
      level: group.level || "",
    };
  }

  function getPlanName(slug?: string | null) {
    if (!slug) return "Sin plan";

    const plan = membershipPlans.find((item) => item.slug === slug);

    return plan?.name || slug;
  }

  function openCreateModal() {
    setModalMode("create");
    setShowTemporaryPassword(false);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setModalMode("edit");
    setShowTemporaryPassword(false);

    setForm({
      id: student.id,
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      group_id: student.group_id || "",
      temporary_password: student.temporary_password || "",
      is_active: student.is_active,
      membership_status: student.membership_status || "vencida",
      membership_type: student.membership_type || "",
      membership_start_date: normalizeDateInput(student.membership_start_date),
      membership_end_date: normalizeDateInput(student.membership_end_date),
      last_payment_date: normalizeDateInput(student.last_payment_date),
      payment_notes: student.payment_notes || "",
    });

    setIsModalOpen(true);
  }

  async function handleCreateStudent() {
    try {
      setCreating(true);

      if (
        !form.full_name ||
        !form.email ||
        !form.phone ||
        !form.group_id ||
        !form.temporary_password
      ) {
        alert("Completa todos los campos.");
        return;
      }

      const selectedGroup = groups.find((group) => group.id === form.group_id);

      if (!selectedGroup) {
        alert("Grupo inválido.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-student-user",
        {
          body: {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            group_id: selectedGroup.id,
            group_level: selectedGroup.level,
            temporary_password: form.temporary_password,
          },
        },
      );

      if (error) {
        console.error(error);
        alert("Error creando alumno.");
        return;
      }

      console.log(data);

      await loadStudents();

      setForm(emptyForm);
      setIsModalOpen(false);

      alert("Alumno creado correctamente.");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado.");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateStudent() {
    try {
      setSaving(true);

      if (!form.id || !form.full_name || !form.email || !form.phone) {
        alert("Completa nombre, correo y teléfono.");
        return;
      }

      const selectedGroup = groups.find((group) => group.id === form.group_id);

      const { error } = await supabase
        .from("students")
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          group_id: form.group_id || null,
          group_level: selectedGroup?.level || "principiante",
          temporary_password: form.temporary_password,
          is_active: form.is_active,
          membership_status: form.membership_status || "vencida",
          membership_type: form.membership_type || null,
          membership_start_date: form.membership_start_date || null,
          membership_end_date: form.membership_end_date || null,
          last_payment_date: form.last_payment_date || null,
          payment_notes: form.payment_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", form.id);

      if (error) {
        console.error(error);
        alert("No se pudo actualizar el alumno.");
        return;
      }

      await loadStudents();

      setForm(emptyForm);
      setIsModalOpen(false);

      alert("Alumno actualizado correctamente.");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-3 sm:px-5 lg:px-6 2xl:px-10 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Alumnos
          </h1>

          <p className="text-zinc-500 mt-2">
            {students.length} alumnos registrados en TXS HUB
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={loadStudents}
            className="flex items-center justify-center gap-2 border border-zinc-800 hover:border-yellow-500/40 px-4 py-3 rounded-xl transition-all"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>

          <button
            onClick={openCreateModal}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} />
            Agregar Alumno
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto bg-[#090909] border border-yellow-500/20 rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-900 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />

            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-yellow-500/40"
            />
          </div>

          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
          >
            <option value="all">Todos los grupos</option>

            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} • {group.schedule}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden xl:block overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[13%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[8%]" />
              <col className="w-[5%]" />
              <col className="w-[5%]" />
            </colgroup>
            <thead className="bg-[#0d0d0d]">
              <tr className="text-left text-zinc-500 text-sm">
                <th className="px-3 py-4">Nombre</th>
                <th className="px-3 py-4">Teléfono</th>
                <th className="px-3 py-4">Correo</th>
                <th className="px-3 py-4">Grupo</th>
                <th className="px-3 py-4">Horario</th>
                <th className="px-3 py-4">Membresía</th>
                <th className="px-3 py-4">Estado</th>
                <th className="px-3 py-4">Password</th>
                <th className="px-3 py-4 text-center">Editar</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-zinc-500">
                    Cargando alumnos...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const groupInfo = getGroupInfo(student.group_id);

                  return (
                    <tr
                      key={student.id}
                      className="border-t border-zinc-900 hover:bg-[#0d0d0d] transition-all"
                    >
                      <td className="px-3 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0">
                            {student.full_name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold leading-tight break-words">
                              {student.full_name}
                            </p>

                            <p className="text-xs text-zinc-500 mt-1">
                              ID: {student.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-5 text-zinc-300 truncate">
                        {student.phone}
                      </td>

                      <td className="px-3 py-5 text-zinc-300 truncate">
                        {student.email}
                      </td>

                      <td className="px-3 py-5">
                        <span className="inline-block max-w-full truncate bg-zinc-800 text-zinc-200 px-2 py-1 rounded-full text-xs">
                          {groupInfo.name}
                        </span>
                      </td>

                      <td className="px-3 py-5 text-zinc-500">
                        <p>{groupInfo.schedule}</p>
                        {groupInfo.days && (
                          <p className="text-xs text-zinc-600 mt-1">
                            {groupInfo.days}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-bold ${getMembershipBadge(
                              student.membership_status,
                            )}`}
                          >
                            {getMembershipLabel(student.membership_status)}
                          </span>

                          <p className="text-xs text-zinc-300 truncate">
                            {getPlanName(student.membership_type)}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Vence:{" "}
                            {formatDateLocal(student.membership_end_date)}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            student.is_active
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {student.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-3 py-5 text-yellow-400 font-semibold truncate">
                        {student.temporary_password || "—"}
                      </td>

                      <td className="px-3 py-5 text-center">
                        <button
                          onClick={() => openEditModal(student)}
                          title="Editar alumno"
                          aria-label="Editar alumno"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-zinc-500">
                    No se encontraron alumnos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="xl:hidden divide-y divide-zinc-900">
          {loading ? (
            <div className="py-16 text-center text-zinc-500">
              Cargando alumnos...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              No se encontraron alumnos.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const groupInfo = getGroupInfo(student.group_id);

              return (
                <div key={student.id} className="p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0">
                        {student.full_name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-white font-bold leading-tight">
                          {student.full_name}
                        </h3>

                        <p className="text-xs text-zinc-500 mt-1">
                          ID: {student.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                        student.is_active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {student.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                      <p className="text-zinc-500 text-xs mb-1">Correo</p>
                      <p className="text-zinc-200 break-all">{student.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                        <p className="text-zinc-500 text-xs mb-1">Teléfono</p>
                        <p className="text-zinc-200">{student.phone}</p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                        <p className="text-zinc-500 text-xs mb-1">Password</p>
                        <p className="text-yellow-400 font-semibold">
                          {student.temporary_password || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                      <p className="text-zinc-500 text-xs mb-1">Grupo</p>
                      <p className="text-zinc-200 font-semibold">
                        {groupInfo.name}
                      </p>
                      <p className="text-zinc-500 text-xs mt-1">
                        {groupInfo.days
                          ? `${groupInfo.days} • ${groupInfo.schedule}`
                          : groupInfo.schedule}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-zinc-500 text-xs mb-1">
                            Membresía
                          </p>
                          <p className="text-zinc-200 font-semibold">
                            {getPlanName(student.membership_type)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${getMembershipBadge(
                            student.membership_status,
                          )}`}
                        >
                          {getMembershipLabel(student.membership_status)}
                        </span>
                      </div>

                      <p className="text-zinc-500 text-xs mt-2">
                        Inicio: {formatDateLocal(student.membership_start_date)}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        Vence: {formatDateLocal(student.membership_end_date)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(student)}
                    className="w-full h-11 rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit size={16} />
                    Editar alumno
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#090909] border border-yellow-500/20 rounded-3xl">
            <div className="flex items-center justify-between px-5 sm:px-8 py-6 border-b border-zinc-900">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  {modalMode === "create" ? "Nuevo Alumno" : "Editar Alumno"}
                </h2>

                <p className="text-zinc-500 mt-1">
                  {modalMode === "create"
                    ? "Crear acceso completo al portal."
                    : "Actualizar información administrativa y membresía del alumno."}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-11 h-11 rounded-xl border border-zinc-800 flex items-center justify-center hover:border-red-500/40 transition-all shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-8 space-y-6">
              <div className="rounded-3xl border border-zinc-900 bg-black/25 p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <div>
                    <h3 className="font-black">Datos del alumno</h3>
                    <p className="text-sm text-zinc-500">
                      Información general y acceso al portal.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-500 mb-2 block">
                    Nombre completo
                  </label>

                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm text-zinc-500 mb-2 block">
                      Correo electrónico
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-500 mb-2 block">
                      Teléfono
                    </label>

                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-500 mb-2 block">
                    Grupo asignado
                  </label>

                  <select
                    value={form.group_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        group_id: e.target.value,
                      })
                    }
                    className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                  >
                    <option value="">Selecciona un grupo...</option>

                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} • {group.days || "Sin días"} •{" "}
                        {group.schedule}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-zinc-500 mb-2 block">
                    Password temporal
                  </label>

                  <div className="relative">
                    <input
                      type={showTemporaryPassword ? "text" : "password"}
                      value={form.temporary_password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          temporary_password: e.target.value,
                        })
                      }
                      className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 pr-12 outline-none focus:border-yellow-500/40"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowTemporaryPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-yellow-400"
                      aria-label={
                        showTemporaryPassword
                          ? "Ocultar password temporal"
                          : "Mostrar password temporal"
                      }
                      title={
                        showTemporaryPassword
                          ? "Ocultar password temporal"
                          : "Mostrar password temporal"
                      }
                    >
                      {showTemporaryPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {modalMode === "edit" && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />

                    <span className="text-sm text-zinc-300">Alumno activo</span>
                  </label>
                )}
              </div>

              {modalMode === "edit" && (
                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-yellow-400" />
                    <div>
                      <h3 className="font-black">Ajuste manual de membresía</h3>
                      <p className="text-sm text-zinc-500">
                        Usa esta sección para corregir fechas si un pago o
                        vencimiento se registró mal.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                    Esto actualiza la membresía actual del alumno. No modifica
                    el historial de pagos.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm text-zinc-500 mb-2 block">
                        Estado de membresía
                      </label>

                      <select
                        value={form.membership_status}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            membership_status: e.target.value,
                          })
                        }
                        className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                      >
                        <option value="activa">Activa</option>
                        <option value="vencida">Vencida</option>
                        <option value="pausada">Pausada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-500 mb-2 block">
                        Plan / tipo de membresía
                      </label>

                      <select
                        value={form.membership_type}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            membership_type: e.target.value,
                          })
                        }
                        className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                      >
                        <option value="">Sin plan asignado</option>

                        {membershipPlans.map((plan) => (
                          <option key={plan.id} value={plan.slug}>
                            {plan.name}
                            {!plan.is_active ? " (inactivo)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-sm text-zinc-500 mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Fecha inicio
                      </label>

                      <input
                        type="date"
                        value={form.membership_start_date}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            membership_start_date: e.target.value,
                          })
                        }
                        className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-500 mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Fecha vencimiento
                      </label>

                      <input
                        type="date"
                        value={form.membership_end_date}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            membership_end_date: e.target.value,
                          })
                        }
                        className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-500 mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Último pago
                      </label>

                      <input
                        type="date"
                        value={form.last_payment_date}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            last_payment_date: e.target.value,
                          })
                        }
                        className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-500 mb-2 block">
                      Notas de membresía / pago
                    </label>

                    <textarea
                      value={form.payment_notes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          payment_notes: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Ej. Corrección manual: pago real fue el 09 de mayo, no el 09 de junio."
                      className="w-full resize-none bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 sm:px-8 py-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border border-zinc-800 rounded-xl hover:border-red-500/40 transition-all"
              >
                Cancelar
              </button>

              {modalMode === "create" ? (
                <button
                  onClick={handleCreateStudent}
                  disabled={creating}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Users size={18} />
                      Crear Alumno
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleUpdateStudent}
                  disabled={saving}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar cambios
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
