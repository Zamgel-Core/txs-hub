// 📍 Ruta del archivo: src/pages/alumno/AlumnoPagos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Loader2,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { supabase } from "@/src/lib/supabase";
import { PaymentModal } from "@/src/components/alumno/PaymentModal";
import {
  getStudentPaymentPortalData,
  PaymentRecord,
  StudentPaymentPortalData,
} from "@/src/services/paymentsService";

type Student = NonNullable<StudentPaymentPortalData["student"]>;

function formatDate(date: string | null) {
  if (!date) return "Pendiente";

  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "completado" || normalized === "pagado") {
    return <Badge variant="success">Completado</Badge>;
  }

  if (normalized === "pendiente") {
    return <Badge variant="warning">Pendiente</Badge>;
  }

  return <Badge variant="danger">{status}</Badge>;
}

function getMembershipBadge(status: Student["membership_status"]) {
  if (status === "activa") return <Badge variant="success">Activa</Badge>;
  if (status === "pendiente") return <Badge variant="warning">Pendiente</Badge>;
  return <Badge variant="danger">Vencida</Badge>;
}

export function AlumnoPagos() {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (!student?.id) return;

    const refreshPayments = () => {
      loadPayments();
      window.dispatchEvent(new CustomEvent("txs:membership-live-changed"));
    };

    const channel = supabase
      .channel(`student-payments-realtime-${student.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `student_id=eq.${student.id}`,
        },
        refreshPayments,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
          filter: `id=eq.${student.id}`,
        },
        refreshPayments,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id]);

  async function loadPayments() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setStudent(null);
        setPayments([]);
        return;
      }

      const data = await getStudentPaymentPortalData(user.email);

      setStudent(data.student);
      setPayments(data.payments);
    } catch (error) {
      console.error("Error cargando pagos del alumno:", error);
      setStudent(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPaid = useMemo(() => {
    return payments
      .filter((payment) => payment.status === "pagado")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments]);

  const lastPayment = payments[0] || null;

  const currentPlan = student?.membership_type || "Sin plan";

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Historial de Pagos
          </h1>

          <p className="mt-1 text-zinc-400">
            Consulta tus pagos, membresía y próximos vencimientos.
          </p>
        </div>

        <Button
          variant="gold"
          className="w-full gap-2 shadow-lg shadow-gold-500/20 sm:w-auto"
          onClick={() => setPaymentModalOpen(true)}
        >
          <CreditCard className="h-4 w-4" />
          Pagar Membresía
        </Button>
      </div>

      {loading ? (
        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="flex min-h-[260px] flex-col items-center justify-center text-zinc-500">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-gold-500" />
            Cargando pagos reales...
          </CardContent>
        </Card>
      ) : !student ? (
        <Card className="bg-txs-card border-zinc-800">
          <CardContent className="p-10 text-center">
            <p className="text-zinc-400">
              No encontramos tu perfil de alumno asociado a este correo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="bg-txs-card border-zinc-800">
              <CardContent className="p-5">
                <ShieldCheck className="mb-4 h-6 w-6 text-emerald-400" />
                <p className="text-sm text-zinc-500">Estado</p>
                <div className="mt-2">
                  {getMembershipBadge(student.membership_status)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-txs-card border-zinc-800">
              <CardContent className="p-5">
                <CalendarClock className="mb-4 h-6 w-6 text-gold-500" />
                <p className="text-sm text-zinc-500">Vencimiento</p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {formatDate(student.membership_end_date)}
                </h2>
              </CardContent>
            </Card>

            <Card className="bg-txs-card border-zinc-800">
              <CardContent className="p-5">
                <Wallet className="mb-4 h-6 w-6 text-blue-400" />
                <p className="text-sm text-zinc-500">Plan actual</p>
                <h2 className="mt-2 text-xl font-bold capitalize text-white">
                  {currentPlan}
                </h2>
              </CardContent>
            </Card>

            <Card className="bg-txs-card border-zinc-800">
              <CardContent className="p-5">
                <DollarSign className="mb-4 h-6 w-6 text-emerald-400" />
                <p className="text-sm text-zinc-500">Total pagado</p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {formatMoney(totalPaid)}
                </h2>
              </CardContent>
            </Card>
          </div>

          {lastPayment && (
            <Card className="border-gold-500/20 bg-gradient-to-r from-gold-500/10 to-transparent">
              <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                <div>
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Último pago registrado
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {formatMoney(Number(lastPayment.amount || 0))}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {lastPayment.concept} ·{" "}
                    {formatDate(lastPayment.payment_date)}
                  </p>
                </div>

                {getStatusBadge(lastPayment.status)}
              </CardContent>
            </Card>
          )}

          <Card className="bg-txs-card border-zinc-800">
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10">
                    <ReceiptText className="h-8 w-8 text-gold-500" />
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    Sin pagos registrados
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-zinc-500">
                    Aún no existen pagos reales registrados para{" "}
                    <span className="font-semibold text-zinc-300">
                      {student.full_name}
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm text-zinc-400">
                      <thead className="whitespace-nowrap bg-zinc-900/50 font-medium text-zinc-300">
                        <tr>
                          <th className="px-6 py-4">Movimiento</th>
                          <th className="px-6 py-4">Fecha</th>
                          <th className="px-6 py-4">Concepto</th>
                          <th className="px-6 py-4">Método</th>
                          <th className="px-6 py-4 text-right">Monto</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-800/80">
                        {payments.map((payment, index) => (
                          <tr
                            key={payment.id}
                            className="whitespace-nowrap transition-colors hover:bg-zinc-900/30"
                          >
                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                              TXS-{String(index + 1).padStart(4, "0")}
                            </td>

                            <td className="px-6 py-4 font-mono text-xs">
                              {formatDate(payment.payment_date)}
                            </td>

                            <td className="px-6 py-4 font-medium text-zinc-200">
                              {payment.concept}
                            </td>

                            <td className="px-6 py-4 capitalize">
                              {payment.method}
                            </td>

                            <td className="px-6 py-4 text-right font-bold text-white">
                              {formatMoney(Number(payment.amount))}
                            </td>

                            <td className="px-6 py-4 text-center">
                              {getStatusBadge(payment.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-zinc-800/80 lg:hidden">
                    {payments.map((payment, index) => (
                      <div key={payment.id} className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-xs text-zinc-500">
                              TXS-{String(index + 1).padStart(4, "0")}
                            </p>

                            <h3 className="mt-1 font-bold text-white">
                              {payment.concept}
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                              {formatDate(payment.payment_date)}
                            </p>
                          </div>

                          {getStatusBadge(payment.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                            <p className="mb-1 text-xs text-zinc-500">Método</p>
                            <p className="capitalize text-zinc-200">
                              {payment.method}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                            <p className="mb-1 text-xs text-zinc-500">Monto</p>
                            <p className="font-bold text-white">
                              {formatMoney(Number(payment.amount))}
                            </p>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                            <p className="mb-1 text-xs text-zinc-500">Nota</p>
                            <p className="text-sm text-zinc-300">
                              {payment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl border border-zinc-800/50 bg-gradient-to-r from-zinc-900 to-txs-card p-6 shadow-xl md:flex-row md:p-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 shadow-inner">
                <DollarSign className="h-7 w-7" />
              </div>

              <div>
                <h3 className="mb-2 font-display text-xl font-bold text-white">
                  Pagos seguros
                </h3>

                <p className="max-w-lg text-sm text-zinc-400">
                  Por ahora, los pagos se registran por administración. Si ya
                  realizaste un pago y no aparece aquí, comunícate con TXS para
                  revisión.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="relative z-10 h-11 w-full whitespace-nowrap border-zinc-700 text-zinc-300 hover:bg-zinc-800 md:w-auto"
            >
              Solicitar revisión
              <ExternalLink className="ml-2 h-4 w-4 text-zinc-500" />
            </Button>
          </div>
        </>
      )}

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        studentName={student?.full_name}
      />
    </div>
  );
}
