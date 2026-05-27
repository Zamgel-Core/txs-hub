// 📍 Ruta del archivo: src/pages/alumno/AlumnoPagos.tsx

import { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Loader2,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { supabase } from "@/src/lib/supabase";
import { PaymentModal } from "@/src/components/alumno/PaymentModal";

type Student = {
  id: string;
  full_name: string;
  email: string;
  membership_status: "activa" | "vencida" | "pendiente" | null;
  membership_type: "semanal" | "quincenal" | "mensual" | null;
};

type Payment = {
  id: string;
  student_id: string;
  payment_date: string;
  concept: string;
  method: string;
  amount: number;
  status: string;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
};

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

  return <Badge variant="neutral">{status}</Badge>;
}

export function AlumnoPagos() {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setStudent(null);
      setPayments([]);
      setLoading(false);
      return;
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, full_name, email, membership_status, membership_type")
      .ilike("email", user.email)
      .maybeSingle();

    if (studentError || !studentData) {
      console.error("Error cargando alumno:", studentError);
      setStudent(null);
      setPayments([]);
      setLoading(false);
      return;
    }

    setStudent(studentData as Student);

    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", studentData.id)
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Error cargando pagos:", paymentsError);
      setPayments([]);
    } else {
      setPayments((paymentsData as Payment[]) || []);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Historial de Pagos
          </h1>

          <p className="text-zinc-400 mt-1">
            Consulta tus recibos y estado de cuenta.
          </p>
        </div>

        <Button
          variant="gold"
          className="gap-2 shadow-lg shadow-gold-500/20"
          onClick={() => setPaymentModalOpen(true)}
        >
          <CreditCard className="w-4 h-4" />
          Pagar Membresía
        </Button>
      </div>

      <Card className="bg-txs-card border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-4" />
              Cargando pagos reales...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
                <ReceiptText className="w-8 h-8 text-gold-500" />
              </div>

              <h2 className="text-xl font-bold text-white">
                Sin pagos registrados
              </h2>

              <p className="text-zinc-500 mt-2 max-w-md mx-auto">
                Aún no existen pagos reales registrados para{" "}
                <span className="text-zinc-300 font-semibold">
                  {student?.full_name || "este alumno"}
                </span>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/50 text-zinc-300 font-medium whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-4">ID Transacción</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Concepto / Plan</th>
                      <th className="px-6 py-4">Método</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Comprobante</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800/80">
                    {payments.map((payment, index) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-zinc-900/30 transition-colors whitespace-nowrap"
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

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-zinc-500" />
                            <span>{payment.method}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right font-bold text-white">
                          {formatMoney(Number(payment.amount))}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(payment.status)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {payment.receipt_url ? (
                            <a
                              href={payment.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center text-gold-500 hover:text-gold-400 hover:bg-gold-500/10 h-8 w-8 rounded-lg"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-xs">
                              Sin archivo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-zinc-800/80">
                {payments.map((payment, index) => (
                  <div key={payment.id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs text-zinc-500">
                          TXS-{String(index + 1).padStart(4, "0")}
                        </p>

                        <h3 className="text-white font-bold mt-1">
                          {payment.concept}
                        </h3>

                        <p className="text-sm text-zinc-500 mt-1">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>

                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                        <p className="text-xs text-zinc-500 mb-1">Método</p>
                        <p className="text-zinc-200">{payment.method}</p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                        <p className="text-xs text-zinc-500 mb-1">Monto</p>
                        <p className="text-white font-bold">
                          {formatMoney(Number(payment.amount))}
                        </p>
                      </div>
                    </div>

                    {payment.receipt_url ? (
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-11 rounded-xl border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-black font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Ver comprobante
                      </a>
                    ) : (
                      <div className="text-sm text-zinc-600 text-center">
                        Sin comprobante adjunto.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 bg-gradient-to-r from-zinc-900 to-txs-card border border-zinc-800/50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 p-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 relative z-10">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0 border border-blue-500/20 shadow-inner">
            <DollarSign className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Pagos Automáticos Seguros
            </h3>

            <p className="text-sm text-zinc-400 max-w-lg">
              Próximamente podrás domiciliar tu tarjeta para renovaciones
              automáticas. Por ahora, tus pagos serán registrados por
              administración.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 whitespace-nowrap relative z-10 w-full md:w-auto h-11"
        >
          Configurar Tarjeta
          <ExternalLink className="w-4 h-4 ml-2 text-zinc-500" />
        </Button>
      </div>
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        studentName={student?.full_name}
      />
    </div>
  );
}
