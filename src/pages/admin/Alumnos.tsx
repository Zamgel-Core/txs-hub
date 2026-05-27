// 📍 Ruta del archivo: src/pages/admin/Alumnos.tsx

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  Edit,
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
}

interface Group {
  id: string;
  name: string;
  schedule: string;
  level: string;
  days?: string | null;
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
};

export function Alumnos() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadStudents();
    loadGroups();
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

  function openCreateModal() {
    setModalMode("create");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setModalMode("edit");

    setForm({
      id: student.id,
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      group_id: student.group_id || "",
      temporary_password: student.temporary_password || "",
      is_active: student.is_active,
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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
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

      <div className="bg-[#090909] border border-yellow-500/20 rounded-3xl overflow-hidden">
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

        <div className="hidden lg:block overflow-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-[#0d0d0d]">
              <tr className="text-left text-zinc-500 text-sm">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Grupo real</th>
                <th className="px-6 py-4">Horario</th>
                <th className="px-6 py-4">Password temporal</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-zinc-500">
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
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0">
                            {student.full_name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold leading-tight">
                              {student.full_name}
                            </p>

                            <p className="text-xs text-zinc-500 mt-1">
                              ID: {student.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {student.phone}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {student.email}
                      </td>

                      <td className="px-6 py-5">
                        <span className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm">
                          {groupInfo.name}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-zinc-500">
                        <p>{groupInfo.schedule}</p>
                        {groupInfo.days && (
                          <p className="text-xs text-zinc-600 mt-1">
                            {groupInfo.days}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 text-yellow-400 font-semibold">
                        {student.temporary_password || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            student.is_active
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {student.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openEditModal(student)}
                          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-all"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-zinc-500">
                    No se encontraron alumnos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-zinc-900">
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
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#090909] border border-yellow-500/20 rounded-3xl">
            <div className="flex items-center justify-between px-5 sm:px-8 py-6 border-b border-zinc-900">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  {modalMode === "create" ? "Nuevo Alumno" : "Editar Alumno"}
                </h2>

                <p className="text-zinc-500 mt-1">
                  {modalMode === "create"
                    ? "Crear acceso completo al portal."
                    : "Actualizar información administrativa del alumno."}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-11 h-11 rounded-xl border border-zinc-800 flex items-center justify-center hover:border-red-500/40 transition-all shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-8 space-y-5">
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

                <input
                  type="text"
                  value={form.temporary_password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      temporary_password: e.target.value,
                    })
                  }
                  className="w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-yellow-500/40"
                />
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
