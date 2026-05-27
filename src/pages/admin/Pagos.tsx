// 📍 Ruta del archivo: src/pages/admin/Pagos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  ReceiptText,
  Search,
  Wallet,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";

import {
  getPaymentStudents,
  registerAdminPayment,
  MembershipStatus,
  MembershipType,
  PaymentMethod,
  PaymentStudent,
} from "@/src/services/paymentsService";

const today = new Date().toISOString().slice(0, 10);

const emptyPaymentForm = {
  membershipType: "mensual" as MembershipType,
  method: "efectivo" as PaymentMethod,
  amount: "0",
  paymentDate: today,
  notes: "",
};

function formatDate(date: string | null) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status: MembershipStatus) {
  if (status === "activa") return <Badge variant="success">Activa</Badge>;
  if (status === "pendiente") return <Badge variant="warning">Pendiente</Badge>;
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

export function Pagos() {
  const [students, setStudents] = useState<PaymentStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<PaymentStudent | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await getPaymentStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los alumnos.");
    } finally {
      setLoading(false);
    }
  }

  function openPaymentModal(student: PaymentStudent) {
    setSelectedStudent(student);
    setPaymentForm({
      ...emptyPaymentForm,
      membershipType: student.membership_type || "mensual",
    });
    setIsModalOpen(true);
  }

  async function handleRegisterPayment() {
    if (!selectedStudent) return;

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }

    try {
      setSaving(true);

      await registerAdminPayment({
        studentId: selectedStudent.id,
        membershipType: paymentForm.membershipType,
        method: paymentForm.method,
        amount,
        paymentDate: paymentForm.paymentDate,
        notes: paymentForm.notes,
      });

      setIsModalOpen(false);
      setSelectedStudent(null);
      await loadStudents();

      alert("Pago registrado y membresía actualizada.");
    } catch (error) {
      console.error(error);
      alert("No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return students.filter((student) => {
      return (
        student.full_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.phone.includes(term)
      );
    });
  }, [students, searchTerm]);

  const activeCount = students.filter(
    (student) => student.membership_status === "activa",
  ).length;

  const expiredCount = students.filter(
    (student) => student.membership_status === "vencida",
  ).length;

  const pendingCount = students.filter(
    (student) => student.membership_status === "pendiente",
  ).length;

  const recentlyPaidCount = students.filter(
    (student) => student.last_payment_date === today,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando pagos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Pagos y Membresías
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Registra pagos reales, actualiza membresías automáticamente y
            mantiene el historial operativo de TXS.
          </p>
        </div>

        <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Pagos registrados hoy
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {recentlyPaidCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <CheckCircle2 className="mb-5 h-7 w-7 text-emerald-500" />
            <p className="text-sm text-zinc-500">Membresías activas</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {activeCount}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertCircle className="mb-5 h-7 w-7 text-red-500" />
            <p className="text-sm text-zinc-500">Membresías vencidas</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {expiredCount}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Clock3 className="mb-5 h-7 w-7 text-yellow-500" />
            <p className="text-sm text-zinc-500">Pendientes</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {pendingCount}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Wallet className="mb-5 h-7 w-7 text-gold-500" />
            <p className="text-sm text-zinc-500">Total alumnos</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {students.length}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Control de alumnos
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Selecciona un alumno para registrar su pago.
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Buscar alumno..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-gold-500/30"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusIcon(student.membership_status)}

                      <h3 className="text-xl font-semibold text-white">
                        {student.full_name}
                      </h3>

                      {getStatusBadge(student.membership_status)}
                    </div>

                    <div className="grid gap-2 text-sm text-zinc-400 md:grid-cols-2 lg:grid-cols-4">
                      <p>
                        Correo:{" "}
                        <span className="text-zinc-200">{student.email}</span>
                      </p>

                      <p>
                        Teléfono:{" "}
                        <span className="text-zinc-200">{student.phone}</span>
                      </p>

                      <p>
                        Tipo:{" "}
                        <span className="capitalize text-zinc-200">
                          {student.membership_type || "Sin tipo"}
                        </span>
                      </p>

                      <p>
                        Vence:{" "}
                        <span className="text-zinc-200">
                          {formatDate(student.membership_end_date)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    className="gap-2"
                    onClick={() => openPaymentModal(student)}
                  >
                    <CreditCard className="h-4 w-4" />
                    Registrar pago
                  </Button>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
                <p className="text-zinc-500">
                  No se encontraron alumnos con esa búsqueda.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar pago"
      >
        {selectedStudent && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedStudent.full_name}
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                Vencimiento actual:{" "}
                <span className="text-white">
                  {formatDate(selectedStudent.membership_end_date)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Tipo de membresía
                </label>

                <select
                  value={paymentForm.membershipType}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      membershipType: event.target.value as MembershipType,
                    })
                  }
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-gold-500/50"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Método</label>

                <select
                  value={paymentForm.method}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      method: event.target.value as PaymentMethod,
                    })
                  }
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-gold-500/50"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Monto</label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Fecha de pago</label>

                <Input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentDate: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Notas</label>

              <textarea
                rows={4}
                value={paymentForm.notes}
                onChange={(event) =>
                  setPaymentForm({
                    ...paymentForm,
                    notes: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none focus:border-gold-500/50"
                placeholder="Notas internas del pago..."
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
                onClick={handleRegisterPayment}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ReceiptText className="h-4 w-4" />
                )}

                {saving ? "Registrando..." : "Registrar pago"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
