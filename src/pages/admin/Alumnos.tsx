// 📍 Ruta del archivo: src/pages/admin/Alumnos.tsx

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, RefreshCw, Edit, Save } from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";

import { supabase } from "@/src/lib/supabase";

type GroupLevel = "principiante" | "avanzado";

type Student = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  group_level: GroupLevel;
  temporary_password: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at?: string;
};

const EMPTY_FORM = {
  id: "",
  full_name: "",
  email: "",
  phone: "",
  group_level: "principiante" as GroupLevel,
  temporary_password: "",
  is_active: true,
  notes: "",
};

export function Alumnos() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<GroupLevel | "Todos">("Todos");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingStudent, setEditingStudent] =
    useState<typeof EMPTY_FORM>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  async function loadStudents() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("group_level", { ascending: true })
      .order("full_name", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("No se pudieron cargar los alumnos.");
      setStudents([]);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return students.filter((student) => {
      const matchesSearch =
        student.full_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        (student.phone || "").includes(term);

      const matchesGroup =
        filterGroup === "Todos" || student.group_level === filterGroup;

      return matchesSearch && matchesGroup;
    });
  }, [students, searchTerm, filterGroup]);

  function openEditModal(student: Student) {
    setEditingStudent({
      id: student.id,
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      group_level: student.group_level,
      temporary_password: student.temporary_password || "",
      is_active: student.is_active,
      notes: student.notes || "",
    });

    setIsModalOpen(true);
  }

  async function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("students")
      .update({
        full_name: editingStudent.full_name,
        email: editingStudent.email,
        phone: editingStudent.phone,
        group_level: editingStudent.group_level,
        temporary_password: editingStudent.temporary_password,
        is_active: editingStudent.is_active,
        notes: editingStudent.notes,
      })
      .eq("id", editingStudent.id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("No se pudo actualizar el alumno.");
      return;
    }

    setIsModalOpen(false);

    await loadStudents();

    alert("Alumno actualizado correctamente.");
  }

  const getGroupBadge = (group: GroupLevel) => {
    if (group === "avanzado") {
      return <Badge variant="success">Avanzado</Badge>;
    }

    return <Badge variant="warning">Principiante</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Activo</Badge>
    ) : (
      <Badge variant="neutral">Inactivo</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Alumnos
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            {students.length} alumnos registrados en TXS HUB
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="ghost"
            className="gap-2 w-full sm:w-auto"
            onClick={loadStudents}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>

          <Button variant="gold" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Agregar Alumno
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {message}
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/20">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

            <Input
              placeholder="Buscar por nombre, correo o teléfono..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-400" />

            <select
              className="w-full sm:w-auto bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 md:h-10 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
              value={filterGroup}
              onChange={(e) =>
                setFilterGroup(e.target.value as GroupLevel | "Todos")
              }
            >
              <option value="Todos">Todos los grupos</option>
              <option value="principiante">Principiante</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/50 text-zinc-300 font-medium whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Grupo</th>
                  <th className="px-6 py-4">Password temporal</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/80">
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-zinc-500"
                    >
                      Cargando alumnos...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-zinc-900/30 transition-colors whitespace-nowrap"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                            {student.full_name.charAt(0)}
                          </div>

                          <div>
                            <div className="font-medium text-white">
                              {student.full_name}
                            </div>

                            <div className="text-xs text-zinc-500">
                              ID: {student.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        {student.phone || "—"}
                      </td>

                      <td className="px-6 py-4">{student.email}</td>

                      <td className="px-6 py-4">
                        {getGroupBadge(student.group_level)}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-gold-300">
                        {student.temporary_password || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(student.is_active)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-gold-400 hover:text-gold-300"
                          onClick={() => openEditModal(student)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      No se encontraron alumnos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Editar Alumno"
      >
        <form onSubmit={handleSaveStudent} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Nombre completo</label>

              <Input
                value={editingStudent.full_name}
                onChange={(e) =>
                  setEditingStudent((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                Correo electrónico
              </label>

              <Input
                type="email"
                value={editingStudent.email}
                onChange={(e) =>
                  setEditingStudent((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Teléfono</label>

              <Input
                value={editingStudent.phone}
                onChange={(e) =>
                  setEditingStudent((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Grupo</label>

              <select
                value={editingStudent.group_level}
                onChange={(e) =>
                  setEditingStudent((prev) => ({
                    ...prev,
                    group_level: e.target.value as GroupLevel,
                  }))
                }
                className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
              >
                <option value="principiante">Principiante</option>

                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Password temporal</label>

              <Input
                value={editingStudent.temporary_password}
                onChange={(e) =>
                  setEditingStudent((prev) => ({
                    ...prev,
                    temporary_password: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Notas internas</label>

              <textarea
                rows={4}
                value={editingStudent.notes}
                onChange={(e) =>
                  setEditingStudent((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-200 outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all"
                placeholder="Notas administrativas..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingStudent.is_active}
                  onChange={(e) =>
                    setEditingStudent((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />

                <span className="text-sm text-zinc-300">Alumno activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="gold"
              disabled={saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />

              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
