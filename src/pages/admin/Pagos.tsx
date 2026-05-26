// 📍 Ruta: src/pages/admin/Pagos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Save,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";

import { supabase } from "@/src/lib/supabase";

type MembershipStatus = "activa" | "vencida" | "pendiente";

type MembershipType = "semanal" | "quincenal" | "mensual";

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string;

  membership_status: MembershipStatus;
  membership_type: MembershipType;

  membership_start_date: string | null;
  membership_end_date: string | null;

  last_payment_date: string | null;
  payment_notes: string | null;

  is_active: boolean;
};

export function Pagos() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  }

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return students.filter((student) => {
      return (
        student.full_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      );
    });
  }, [students, searchTerm]);

  function getStatusBadge(status: MembershipStatus) {
    if (status === "activa") {
      return <Badge variant="success">Activa</Badge>;
    }

    if (status === "pendiente") {
      return <Badge variant="warning">Pendiente</Badge>;
    }

    return <Badge variant="danger">Vencida</Badge>;
  }

  function getStatusIcon(status: MembershipStatus) {
    if (status === "activa") {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }

    if (status === "pendiente") {
      return <Clock3 className="w-5 h-5 text-yellow-500" />;
    }

    return <AlertCircle className="w-5 h-5 text-red-500" />;
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setIsModalOpen(true);
  }

  async function saveMembership() {
    if (!editingStudent) return;

    setSaving(true);

    const { error } = await supabase
      .from("students")
      .update({
        membership_status: editingStudent.membership_status,

        membership_type: editingStudent.membership_type,

        membership_start_date: editingStudent.membership_start_date,

        membership_end_date: editingStudent.membership_end_date,

        last_payment_date: editingStudent.last_payment_date,

        payment_notes: editingStudent.payment_notes,
      })
      .eq("id", editingStudent.id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("No se pudo actualizar.");
      return;
    }

    setIsModalOpen(false);

    await loadStudents();

    alert("Membresía actualizada.");
  }

  const activeCount = students.filter(
    (s) => s.membership_status === "activa",
  ).length;

  const expiredCount = students.filter(
    (s) => s.membership_status === "vencida",
  ).length;

  const pendingCount = students.filter(
    (s) => s.membership_status === "pendiente",
  ).length;

  if (loading) {
    return (
      <div className="text-center py-20 text-gold-400">
        Cargando membresías...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white">
          Pagos y Membresías
        </h1>

        <p className="text-zinc-400 mt-2">Control de membresías de alumnos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>

            <p className="text-zinc-500 text-sm">Membresías activas</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {activeCount}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>

            <p className="text-zinc-500 text-sm">Membresías vencidas</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {expiredCount}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock3 className="w-6 h-6 text-yellow-500" />
            </div>

            <p className="text-zinc-500 text-sm">Pagos pendientes</p>

            <h2 className="text-4xl font-bold text-white mt-2">
              {pendingCount}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-txs-card border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

              <Input
                placeholder="Buscar alumno..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="border border-zinc-800 rounded-2xl p-5 bg-zinc-900/30"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(student.membership_status)}

                      <h3 className="text-xl font-semibold text-white">
                        {student.full_name}
                      </h3>

                      {getStatusBadge(student.membership_status)}
                    </div>

                    <p className="text-sm text-zinc-500">{student.email}</p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="text-sm text-zinc-400">
                        Tipo:
                        <span className="text-white ml-1 capitalize">
                          {student.membership_type}
                        </span>
                      </div>

                      <div className="text-sm text-zinc-400">
                        Vence:
                        <span className="text-white ml-1">
                          {student.membership_end_date || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button
                      variant="gold"
                      className="gap-2"
                      onClick={() => openEditModal(student)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Gestionar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gestionar Membresía"
      >
        {editingStudent && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingStudent.full_name}
              </h3>

              <p className="text-zinc-500 text-sm">{editingStudent.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Estado</label>

              <select
                value={editingStudent.membership_status}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    membership_status: e.target.value as MembershipStatus,
                  })
                }
                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
              >
                <option value="activa">Activa</option>

                <option value="vencida">Vencida</option>

                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Tipo de membresía</label>

              <select
                value={editingStudent.membership_type}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    membership_type: e.target.value as MembershipType,
                  })
                }
                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
              >
                <option value="semanal">Semanal</option>

                <option value="quincenal">Quincenal</option>

                <option value="mensual">Mensual</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Inicio membresía
                </label>

                <Input
                  type="date"
                  value={editingStudent.membership_start_date || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      membership_start_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Fin membresía</label>

                <Input
                  type="date"
                  value={editingStudent.membership_end_date || ""}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      membership_end_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Último pago</label>

              <Input
                type="date"
                value={editingStudent.last_payment_date || ""}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    last_payment_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Notas de pago</label>

              <textarea
                rows={4}
                value={editingStudent.payment_notes || ""}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    payment_notes: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>

              <Button
                variant="gold"
                className="gap-2"
                disabled={saving}
                onClick={saveMembership}
              >
                <Save className="w-4 h-4" />

                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
