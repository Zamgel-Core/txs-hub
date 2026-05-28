// 📍 Ruta del archivo: src/pages/admin/Reportes.tsx

import { useEffect, useMemo, useState } from "react";
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
import { Loader2 } from "lucide-react";

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

function getMonthKey(date: string) {
  const parsedDate = new Date(date);
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: string) {
  const parsedDate = new Date(date);
  return monthNames[parsedDate.getMonth()];
}

function getLastSixMonths() {
  const months = [];

  for (let index = 5; index >= 0; index--) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    months.push({
      key,
      name: monthNames[date.getMonth()],
    });
  }

  return months;
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

  const monthlyData = useMemo(() => {
    const months = getLastSixMonths();

    return months.map((month) => {
      const monthlyPayments = payments.filter(
        (payment) => getMonthKey(payment.payment_date) === month.key,
      );

      const monthlyStudents = students.filter((student) => {
        return getMonthKey(student.created_at) <= month.key;
      });

      return {
        name: month.name,
        ingresos: monthlyPayments.reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        ),
        alumnos: monthlyStudents.length,
      };
    });
  }, [payments, students]);

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

  const totalIncome = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

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
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Reportes y Métricas
        </h1>
        <p className="mt-2 text-zinc-400">
          Datos reales conectados a pagos, alumnos y asistencia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Ingresos totales</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {formatCurrency(totalIncome)}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Alumnos activos</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {activeStudents}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Asistencia promedio</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {attendanceAverage}%
            </h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
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
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar
                    dataKey="ingresos"
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
            <div className="h-[300px] w-full">
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
            <CardTitle>Asistencia Promedio</CardTitle>
          </CardHeader>
          <CardContent>
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
      </div>
    </div>
  );
}
