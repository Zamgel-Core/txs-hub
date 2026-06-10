// 📍 Ruta del archivo: src/pages/admin/Reportes.tsx

import { type ElementType, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeDollarSign,
  CalendarClock,
  CircleDollarSign,
  FileBarChart2,
  Loader2,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import {
  getReportsData,
  ReportAttendance,
  ReportPayment,
  ReportStudent,
} from "@/src/services/reportsService";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const ANNUAL_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getMonthKey(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
}

function getLastSixMonths() {
  const months = [];

  for (let index = 5; index >= 0; index--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    months.push({
      key,
      name: monthNames[date.getMonth()],
    });
  }

  return months;
}

function isPaidPayment(payment: ReportPayment) {
  const status = String(payment.status || "").toLowerCase();
  return status === "pagado" || status === "paid";
}

function isMembershipPayment(payment: ReportPayment) {
  return (
    isPaidPayment(payment) &&
    String(payment.concept || "").toLowerCase().startsWith("membresía")
  );
}

function isAnnualFeePayment(payment: ReportPayment) {
  const concept = String(payment.concept || "").toLowerCase();
  return isPaidPayment(payment) && concept.includes("annual_fee");
}

function getAnnualStatus(student: ReportStudent) {
  const status = String(student.annual_fee_status || "pending").toLowerCase();

  if (status === "active") return "pagada";
  if (status === "expired") return "vencida";
  return "pendiente";
}

function getDaysRemaining(date: string | null) {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(`${date}T00:00:00`);
  targetDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "text-gold-500",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ElementType;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <Icon className={`mb-5 h-7 w-7 ${accent}`} />
        <p className="text-sm text-zinc-500">{title}</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{value}</h2>
        {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export function Reportes() {
  const [students, setStudents] = useState<ReportStudent[]>([]);
  const [payments, setPayments] = useState<ReportPayment[]>([]);
  const [attendance, setAttendance] = useState<ReportAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);

      const data = await getReportsData();

      setStudents(data.students);
      setPayments(data.payments);
      setAttendance(data.attendance);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      alert("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }

  const membershipPayments = useMemo(
    () => payments.filter(isMembershipPayment),
    [payments],
  );

  const annualFeePayments = useMemo(
    () => payments.filter(isAnnualFeePayment),
    [payments],
  );

  const monthlyData = useMemo(() => {
    const months = getLastSixMonths();

    return months.map((month) => {
      const monthlyMembershipPayments = membershipPayments.filter(
        (payment) => getMonthKey(payment.payment_date) === month.key,
      );

      const monthlyAnnualFeePayments = annualFeePayments.filter(
        (payment) => getMonthKey(payment.payment_date) === month.key,
      );

      const monthlyStudents = students.filter((student) => {
        return getMonthKey(student.created_at) <= month.key;
      });

      const membershipIncome = monthlyMembershipPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );

      const annualFeeIncome = monthlyAnnualFeePayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );

      return {
        name: month.name,
        membresias: membershipIncome,
        anualidades: annualFeeIncome,
        total: membershipIncome + annualFeeIncome,
        alumnos: monthlyStudents.length,
      };
    });
  }, [annualFeePayments, membershipPayments, students]);

  const membershipData = useMemo(() => {
    return [
      {
        name: "Activa",
        value: students.filter(
          (student) => student.membership_status === "activa",
        ).length,
      },
      {
        name: "Pendiente",
        value: students.filter(
          (student) => student.membership_status === "pendiente",
        ).length,
      },
      {
        name: "Vencida",
        value: students.filter(
          (student) => student.membership_status === "vencida",
        ).length,
      },
    ];
  }, [students]);

  const annualFeeData = useMemo(() => {
    return [
      {
        name: "Pagada",
        value: students.filter((student) => getAnnualStatus(student) === "pagada")
          .length,
      },
      {
        name: "Pendiente",
        value: students.filter(
          (student) => getAnnualStatus(student) === "pendiente",
        ).length,
      },
      {
        name: "Vencida",
        value: students.filter((student) => getAnnualStatus(student) === "vencida")
          .length,
      },
    ];
  }, [students]);

  const attendanceData = useMemo(() => {
    const months = getLastSixMonths();

    return months.map((month) => {
      const monthlyAttendance = attendance.filter(
        (record) => getMonthKey(record.attendance_date) === month.key,
      );

      const validRecords = monthlyAttendance.filter(
        (record) => record.status === "presente" || record.status === "retardo",
      );

      const average = monthlyAttendance.length
        ? Math.round((validRecords.length / monthlyAttendance.length) * 100)
        : 0;

      return {
        name: month.name,
        promedio: average,
      };
    });
  }, [attendance]);

  const totalMembershipIncome = membershipPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const totalAnnualFeeIncome = annualFeePayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const totalIncome = totalMembershipIncome + totalAnnualFeeIncome;

  const activeStudents = students.filter((student) => student.is_active).length;

  const attendanceAverage = attendance.length
    ? Math.round(
        (attendance.filter(
          (record) =>
            record.status === "presente" || record.status === "retardo",
        ).length /
          attendance.length) *
          100,
      )
    : 0;

  const paidAnnualFees = students.filter(
    (student) => getAnnualStatus(student) === "pagada",
  ).length;

  const pendingAnnualFees = students.filter(
    (student) => getAnnualStatus(student) === "pendiente",
  ).length;

  const expiredAnnualFees = students.filter(
    (student) => getAnnualStatus(student) === "vencida",
  ).length;

  const upcomingAnnualFees = students
    .filter((student) => {
      const days = getDaysRemaining(student.annual_fee_expires_at);
      return days !== null && days >= 0 && days <= 30;
    })
    .sort((a, b) => {
      return (
        new Date(`${a.annual_fee_expires_at || "2999-12-31"}T00:00:00`).getTime() -
        new Date(`${b.annual_fee_expires_at || "2999-12-31"}T00:00:00`).getTime()
      );
    })
    .slice(0, 5);

  const recentAnnualPayments = [...annualFeePayments]
    .sort(
      (a, b) =>
        new Date(`${b.payment_date}T00:00:00`).getTime() -
        new Date(`${a.payment_date}T00:00:00`).getTime(),
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando reportes reales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
            Centro financiero
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Reportes y Métricas
          </h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Análisis separado de membresías, anualidades, alumnos y asistencia.
            Las anualidades se muestran aquí sin contaminar el módulo de pagos.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          className="rounded-xl border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-400 transition hover:bg-gold-500 hover:text-black"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ingresos membresías"
          value={formatCurrency(totalMembershipIncome)}
          subtitle={`${membershipPayments.length} pago(s) de membresía`}
          icon={WalletCards}
          accent="text-emerald-400"
        />
        <StatCard
          title="Ingresos anualidades"
          value={formatCurrency(totalAnnualFeeIncome)}
          subtitle={`${annualFeePayments.length} anualidad(es) registrada(s)`}
          icon={ShieldCheck}
          accent="text-gold-500"
        />
        <StatCard
          title="Ingresos totales"
          value={formatCurrency(totalIncome)}
          subtitle="Membresías + anualidades"
          icon={BadgeDollarSign}
          accent="text-yellow-400"
        />
        <StatCard
          title="Asistencia promedio"
          value={`${attendanceAverage}%`}
          subtitle={`${attendance.length} registro(s) de asistencia`}
          icon={TrendingUp}
          accent="text-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard
          title="Alumnos activos"
          value={activeStudents}
          subtitle={`${students.length} alumno(s) registrados`}
          icon={Users}
          accent="text-blue-400"
        />
        <StatCard
          title="Anualidades pagadas"
          value={paidAnnualFees}
          subtitle={`${pendingAnnualFees} pendiente(s) · ${expiredAnnualFees} vencida(s)`}
          icon={CircleDollarSign}
          accent="text-emerald-400"
        />
        <StatCard
          title="Próximas anualidades"
          value={upcomingAnnualFees.length}
          subtitle="Vencen en los próximos 30 días"
          icon={CalendarClock}
          accent="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-500">
              Membresías y anualidades separadas para evitar confusiones.
            </p>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "#27272a" }}
                    contentStyle={{
                      backgroundColor: "#141414",
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === "membresias" ? "Membresías" : "Anualidades",
                    ]}
                  />
                  <Bar
                    dataKey="membresias"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="anualidades"
                    fill="#D4AF37"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-500">
              Total acumulado de alumnos registrados por mes.
            </p>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alumnos"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ fill: "#60a5fa", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados de Membresía</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className="h-[300px] w-full flex flex-col sm:flex-row items-center">
              <ResponsiveContainer
                width="100%"
                height="100%"
                className="flex-1"
              >
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 p-4">
                {membershipData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {entry.name}: {entry.value}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados de Anualidad</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className="h-[300px] w-full flex flex-col sm:flex-row items-center">
              <ResponsiveContainer
                width="100%"
                height="100%"
                className="flex-1"
              >
                <PieChart>
                  <Pie
                    data={annualFeeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {annualFeeData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={ANNUAL_COLORS[index % ANNUAL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 p-4">
                {annualFeeData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          ANNUAL_COLORS[index % ANNUAL_COLORS.length],
                      }}
                    />
                    {entry.name}: {entry.value}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asistencia Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-500">
              Porcentaje mensual de presentes y retardos.
            </p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="promedio"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anualidades recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-500">
              Últimos registros de anualidad encontrados en pagos.
            </p>

            {recentAnnualPayments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
                No hay anualidades registradas todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnnualPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          Anualidad TXS
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(payment.payment_date)} ·{" "}
                          {payment.method || "sin método"}
                        </p>
                      </div>

                      <p className="font-bold text-gold-400">
                        {formatCurrency(Number(payment.amount || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart2 className="h-5 w-5 text-gold-500" />
            Resumen financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Membresías
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {formatCurrency(totalMembershipIncome)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Controlado desde Pagos y Membresías.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Anualidades
              </p>
              <p className="mt-2 text-2xl font-bold text-gold-400">
                {formatCurrency(totalAnnualFeeIncome)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Separado para no alterar ingresos de membresías.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Total reportado
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatCurrency(totalIncome)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                En el futuro aquí podrá sumarse Tienda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
