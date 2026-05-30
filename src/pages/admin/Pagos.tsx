// 📍 Ruta del archivo: src/pages/admin/Pagos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Filter,
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
import { supabase } from "@/src/lib/supabase";

import {
  getPaymentsAdminData,
  registerAdminPayment,
  MembershipStatus,
  MembershipType,
  PaymentMethod,
  PaymentRecord,
  PaymentStudent,
} from "@/src/services/paymentsService";

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(date: string | null) {
  if (!date) return null;

  const cleanDate = String(date).trim();
  if (!cleanDate) return null;

  const [year, month, day] = cleanDate.split("T")[0].split("-").map(Number);

  if (!year || !month || !day) return null;

  const parsedDate = new Date(year, month - 1, day);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
}

const today = getTodayLocalDateString();

const membershipPrices: Record<MembershipType, number> = {
  semanal: 150,
  quincenal: 280,
  mensual: 500,
};

const emptyPaymentForm = {
  membershipType: "mensual" as MembershipType,
  method: "efectivo" as PaymentMethod,
  amount: String(membershipPrices.mensual),
  paymentDate: today,
  notes: "",
};

function formatDate(date: string | null) {
  const parsedDate = parseLocalDate(date);

  if (!parsedDate) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function getDaysRemaining(date: string | null) {
  const endDate = parseLocalDate(date);

  if (!endDate) return null;

  const currentDate = parseLocalDate(today);

  if (!currentDate) return null;

  return Math.ceil(
    (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function isToday(date: string) {
  return date === today;
}

function isSameMonth(date: string) {
  const currentDate = parseLocalDate(today);
  const targetDate = parseLocalDate(date);

  if (!currentDate || !targetDate) return false;

  return (
    currentDate.getMonth() === targetDate.getMonth() &&
    currentDate.getFullYear() === targetDate.getFullYear()
  );
}

function getStatusBadge(status: MembershipStatus) {
  if (status === "activa") return <Badge variant="success">Activa</Badge>;
  if (status === "pendiente") return <Badge variant="warning">Pendiente</Badge>;
  return <Badge variant="danger">Vencida</Badge>;
}

function getStatusIcon(status: MembershipStatus) {
  if (status === "activa") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }

  if (status === "pendiente") {
    return <Clock3 className="h-5 w-5 text-yellow-500" />;
  }

  return <AlertCircle className="h-5 w-5 text-red-500" />;
}

function getStudentPaymentMeta(student: PaymentStudent) {
  const days = getDaysRemaining(student.membership_end_date);

  if (days === null) {
    return {
      label: "Sin vencimiento",
      className: "text-zinc-500",
    };
  }

  if (days < 0) {
    return {
      label: `Vencida hace ${Math.abs(days)} día(s)`,
      className: "text-red-400",
    };
  }

  if (days === 0) {
    return {
      label: "Vence hoy",
      className: "text-amber-400",
    };
  }

  if (days <= 7) {
    return {
      label: `${days} día(s) restantes`,
      className: "text-amber-400",
    };
  }

  return {
    label: `${days} día(s) restantes`,
    className: "text-emerald-400",
  };
}

export function Pagos() {
  const [students, setStudents] = useState<PaymentStudent[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<PaymentStudent | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | MembershipStatus>(
    "todos",
  );
  const [typeFilter, setTypeFilter] = useState<"todos" | MembershipType>(
    "todos",
  );
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-payments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          loadPaymentData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          loadPaymentData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadPaymentData() {
    try {
      setLoading(true);
      const data = await getPaymentsAdminData();

      setStudents(data.students);
      setRecentPayments(data.recentPayments);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      alert("No se pudieron cargar los pagos.");
    } finally {
      setLoading(false);
    }
  }

  function openPaymentModal(student: PaymentStudent) {
    const membershipType = student.membership_type || "mensual";

    setSelectedStudent(student);
    setPaymentForm({
      ...emptyPaymentForm,
      membershipType,
      amount: String(membershipPrices[membershipType]),
    });
    setIsModalOpen(true);
  }

  function handleMembershipTypeChange(membershipType: MembershipType) {
    setPaymentForm({
      ...paymentForm,
      membershipType,
      amount: String(membershipPrices[membershipType]),
    });
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
      await loadPaymentData();

      alert("Pago registrado y membresía actualizada.");
    } catch (error) {
      console.error("Error registrando pago:", error);
      alert("No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return students.filter((student) => {
      const matchesSearch =
        student.full_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.phone.includes(term);

      const matchesStatus =
        statusFilter === "todos" || student.membership_status === statusFilter;

      const matchesType =
        typeFilter === "todos" || student.membership_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [students, searchTerm, statusFilter, typeFilter]);

  const activeCount = students.filter(
    (student) => student.membership_status === "activa",
  ).length;

  const expiredCount = students.filter(
    (student) => student.membership_status === "vencida",
  ).length;

  const pendingCount = students.filter(
    (student) => student.membership_status === "pendiente",
  ).length;

  const incomeToday = recentPayments
    .filter((payment) => isToday(payment.payment_date))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const incomeMonth = recentPayments
    .filter((payment) => isSameMonth(payment.payment_date))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const upcomingExpirations = students
    .filter((student) => {
      const days = getDaysRemaining(student.membership_end_date);
      return days !== null && days >= 0 && days <= 7;
    })
    .sort((a, b) => {
      return (
        (parseLocalDate(a.membership_end_date)?.getTime() || 0) -
        (parseLocalDate(b.membership_end_date)?.getTime() || 0)
      );
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando pagos reales...
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
            Control premium de pagos, renovaciones, vencimientos e historial
            real de TXS.
          </p>
        </div>

        <Button variant="outline" className="gap-2" onClick={loadPaymentData}>
          <Loader2 className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <CheckCircle2 className="mb-5 h-7 w-7 text-emerald-500" />
            <p className="text-sm text-zinc-500">Activas</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {activeCount}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertCircle className="mb-5 h-7 w-7 text-red-500" />
            <p className="text-sm text-zinc-500">Vencidas</p>
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

        <Card className="border-emerald-500/10">
          <CardContent className="p-6">
            <Wallet className="mb-5 h-7 w-7 text-emerald-400" />
            <p className="text-sm text-zinc-500">Ingresos hoy</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {formatMoney(incomeToday)}
            </h2>
          </CardContent>
        </Card>

        <Card className="border-gold-500/10">
          <CardContent className="p-6">
            <BadgeDollarSign className="mb-5 h-7 w-7 text-gold-500" />
            <p className="text-sm text-zinc-500">Ingresos mes</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {formatMoney(incomeMonth)}
            </h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Control de alumnos
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Busca, filtra y registra pagos reales.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                <div className="relative w-full lg:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Buscar alumno..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as "todos" | MembershipStatus,
                    )
                  }
                  className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none focus:border-gold-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activa">Activas</option>
                  <option value="vencida">Vencidas</option>
                  <option value="pendiente">Pendientes</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as "todos" | MembershipType,
                    )
                  }
                  className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none focus:border-gold-500"
                >
                  <option value="todos">Todos los planes</option>
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
              <Filter className="h-4 w-4" />
              {filteredStudents.length} alumno(s) encontrados
            </div>

            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const meta = getStudentPaymentMeta(student);

                return (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-gold-500/30"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {getStatusIcon(student.membership_status)}

                          <h3 className="text-xl font-semibold text-white">
                            {student.full_name}
                          </h3>

                          {getStatusBadge(student.membership_status)}
                        </div>

                        <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-2 xl:grid-cols-4">
                          <p className="break-all">
                            Correo:{" "}
                            <span className="text-zinc-200">
                              {student.email}
                            </span>
                          </p>

                          <p>
                            Teléfono:{" "}
                            <span className="text-zinc-200">
                              {student.phone}
                            </span>
                          </p>

                          <p>
                            Plan:{" "}
                            <span className="capitalize text-zinc-200">
                              {student.membership_type || "Sin plan"}
                            </span>
                          </p>

                          <p>
                            Vence:{" "}
                            <span className={meta.className}>
                              {formatDate(student.membership_end_date)} ·{" "}
                              {meta.label}
                            </span>
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="gold"
                        className="gap-2 whitespace-nowrap"
                        onClick={() => openPaymentModal(student)}
                      >
                        <CreditCard className="h-4 w-4" />
                        Registrar pago
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
                  <p className="text-zinc-500">
                    No se encontraron alumnos con esos filtros.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Próximos vencimientos
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Renovaciones en 7 días.
                  </p>
                </div>

                <CalendarClock className="h-6 w-6 text-amber-400" />
              </div>

              {upcomingExpirations.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-800 p-5 text-center text-sm text-zinc-500">
                  No hay vencimientos próximos.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingExpirations.map((student) => {
                    const meta = getStudentPaymentMeta(student);

                    return (
                      <div
                        key={student.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                      >
                        <p className="font-semibold text-white">
                          {student.full_name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {formatDate(student.membership_end_date)}
                        </p>
                        <p
                          className={`mt-2 text-sm font-semibold ${meta.className}`}
                        >
                          {meta.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Pagos recientes
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Últimos movimientos.
                  </p>
                </div>

                <ReceiptText className="h-6 w-6 text-gold-500" />
              </div>

              {recentPayments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-800 p-5 text-center text-sm text-zinc-500">
                  Sin pagos registrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.slice(0, 8).map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {payment.students?.full_name || "Alumno"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {payment.concept} · {payment.method}
                          </p>
                        </div>

                        <p className="font-bold text-emerald-400">
                          {formatMoney(Number(payment.amount || 0))}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        {formatDate(payment.payment_date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
                    handleMembershipTypeChange(
                      event.target.value as MembershipType,
                    )
                  }
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-gold-500/50"
                >
                  <option value="semanal">Semanal · $150</option>
                  <option value="quincenal">Quincenal · $280</option>
                  <option value="mensual">Mensual · $500</option>
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
                  className="[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Resumen</p>
                  <p className="mt-1 font-semibold capitalize text-white">
                    Membresía {paymentForm.membershipType}
                  </p>
                </div>

                <p className="text-2xl font-bold text-gold-500">
                  {formatMoney(Number(paymentForm.amount || 0))}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                Notas / referencia
              </label>

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
                placeholder="Ej. Transferencia, folio, comentario administrativo..."
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
