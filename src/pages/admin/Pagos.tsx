// 📍 Ruta del archivo: src/pages/admin/Pagos.tsx

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeDollarSign,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Filter,
  Loader2,
  ReceiptText,
  Search,
  UploadCloud,
  ExternalLink,
  X,
  UserCheck,
  Wallet,
} from "lucide-react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { supabase } from "@/src/lib/supabase";

import {
  getCurrentPaymentUser,
  getPaymentStaffProfiles,
  getPaymentsAdminData,
  getStudentPaymentHistory,
  getOverlappingMembershipPayment,
  registerAdminPayment,
  MembershipStatus,
  MembershipType,
  PaymentMethod,
  PaymentRecord,
  PaymentStaffProfile,
  PaymentStudent,
} from "@/src/services/paymentsService";
import {
  getMembershipPlans,
  formatPlanDuration,
  formatClassesPerDay,
  type MembershipPlan,
} from "@/src/services/membershipPlansService";

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

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);

  return nextDate;
}

function getUpcomingSunday(date: Date) {
  const day = date.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;

  return addDays(date, daysUntilSunday);
}

function getPreviousSunday(date: Date) {
  const day = date.getDay();

  return addDays(date, -day);
}

function getSuggestedMembershipEndDate(
  startDateValue: string,
  plan?: MembershipPlan | null,
) {
  const startDate = parseLocalDate(startDateValue);

  if (!startDate || !plan) return startDateValue || today;

  if (plan.duration_unit === "weeks") {
    const firstSunday = getUpcomingSunday(startDate);
    const extraWeeks = Math.max(Number(plan.duration_count || 1) - 1, 0);

    return toLocalDateString(addDays(firstSunday, extraWeeks * 7));
  }

  if (plan.duration_unit === "days") {
    const targetDate = addDays(
      startDate,
      Math.max(Number(plan.duration_count || 1) - 1, 0),
    );
    const sunday = getPreviousSunday(targetDate);

    if (sunday.getTime() < startDate.getTime()) {
      return toLocalDateString(getUpcomingSunday(startDate));
    }

    return toLocalDateString(sunday);
  }

  const targetDate = addMonths(
    startDate,
    Math.max(Number(plan.duration_count || 1), 1),
  );
  const sunday = getPreviousSunday(targetDate);

  if (sunday.getTime() < startDate.getTime()) {
    return toLocalDateString(getUpcomingSunday(startDate));
  }

  return toLocalDateString(sunday);
}

function getSuggestedMembershipStartDate(student?: PaymentStudent | null) {
  const currentEndDate = parseLocalDate(student?.membership_end_date || null);
  const currentDate = parseLocalDate(today);

  if (
    currentEndDate &&
    currentDate &&
    currentEndDate.getTime() >= currentDate.getTime()
  ) {
    return toLocalDateString(addDays(currentEndDate, 1));
  }

  return today;
}

const today = getTodayLocalDateString();

const emptyPaymentForm = {
  membershipType: "" as MembershipType,
  method: "efectivo" as PaymentMethod,
  amount: "",
  paymentDate: today,
  membershipStartDate: today,
  membershipEndDate: today,
  notes: "",
  receiptFile: null as File | null,
  receiptPreviewUrl: "",
  receivedByUserId: "",
  receivedByNameManual: "",
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

function getStaffDisplayName(staff?: PaymentStaffProfile | null) {
  if (!staff) return "";
  return staff.full_name || staff.email || "Usuario TXS";
}

function getRoleLabel(role?: string | null) {
  if (role === "admin") return "Admin";
  if (role === "moderator") return "Moderador";
  if (role === "staff") return "Staff";
  return "Personal";
}

function getPaymentReceiverLabel(payment: PaymentRecord) {
  return payment.received_by_name || payment.registered_by_name || "No especificado";
}

function getPaymentRegisteredLabel(payment: PaymentRecord) {
  return payment.registered_by_name || "Sistema / Admin";
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

function isYesterday(date: string) {
  const currentDate = parseLocalDate(today);

  if (!currentDate) return false;

  return date === toLocalDateString(addDays(currentDate, -1));
}

function isDateInRange(date: string, startDate: string, endDate: string) {
  const targetDate = parseLocalDate(date);
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!targetDate || !start || !end) return false;

  return (
    targetDate.getTime() >= start.getTime() &&
    targetDate.getTime() <= end.getTime()
  );
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

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

function getWeekEnd(date: Date) {
  const weekEnd = getWeekStart(date);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return weekEnd;
}

function isSameWeek(date: string) {
  const currentDate = parseLocalDate(today);
  const targetDate = parseLocalDate(date);

  if (!currentDate || !targetDate) return false;

  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);

  return (
    targetDate.getTime() >= weekStart.getTime() &&
    targetDate.getTime() <= weekEnd.getTime()
  );
}

function getDerivedMembershipStatus(student: PaymentStudent): MembershipStatus {
  const days = getDaysRemaining(student.membership_end_date);

  if (days === null) return student.membership_status || "pendiente";

  if (days >= 0) return "activa";

  return "vencida";
}

function hasDateRangeOverlap(
  startA: string | null,
  endA: string | null,
  startB: string | null,
  endB: string | null,
) {
  const parsedStartA = parseLocalDate(startA);
  const parsedEndA = parseLocalDate(endA);
  const parsedStartB = parseLocalDate(startB);
  const parsedEndB = parseLocalDate(endB);

  if (!parsedStartA || !parsedEndA || !parsedStartB || !parsedEndB) {
    return false;
  }

  return (
    parsedStartA.getTime() <= parsedEndB.getTime() &&
    parsedEndA.getTime() >= parsedStartB.getTime()
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
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<PaymentStaffProfile[]>([]);
  const [currentPaymentUser, setCurrentPaymentUser] = useState<PaymentStaffProfile | null>(null);
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
  const [recentPaymentsFilter, setRecentPaymentsFilter] = useState<
    "todos" | "hoy" | "ayer" | "semana" | "mes" | "rango"
  >("semana");
  const [customStartDate, setCustomStartDate] = useState(today);
  const [customEndDate, setCustomEndDate] = useState(today);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<PaymentStudent | null>(
    null,
  );
  const [historyPayments, setHistoryPayments] = useState<PaymentRecord[]>([]);

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
      const [data, plans, staff, currentUser] = await Promise.all([
        getPaymentsAdminData(),
        getMembershipPlans(false),
        getPaymentStaffProfiles(),
        getCurrentPaymentUser(),
      ]);

      setStudents(data.students);
      setRecentPayments(data.recentPayments);
      setMembershipPlans(plans);
      setStaffProfiles(staff);
      setCurrentPaymentUser(currentUser);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      alert("No se pudieron cargar los pagos.");
    } finally {
      setLoading(false);
    }
  }

  function getDefaultPlan(student?: PaymentStudent | null) {
    if (student?.membership_type) {
      const currentPlan = membershipPlans.find(
        (plan) => plan.slug === student.membership_type && plan.is_active,
      );

      if (currentPlan) return currentPlan;
    }

    return membershipPlans[0] || null;
  }

  function openPaymentModal(student: PaymentStudent) {
    const defaultPlan = getDefaultPlan(student);
    const suggestedStartDate = getSuggestedMembershipStartDate(student);
    const suggestedEndDate = getSuggestedMembershipEndDate(
      suggestedStartDate,
      defaultPlan,
    );

    setSelectedStudent(student);
    const defaultReceiverId =
      currentPaymentUser?.id || staffProfiles[0]?.id || "manual";

    setPaymentForm({
      ...emptyPaymentForm,
      membershipType: defaultPlan?.slug || "",
      amount: defaultPlan ? String(defaultPlan.price) : "",
      membershipStartDate: suggestedStartDate,
      membershipEndDate: suggestedEndDate,
      receivedByUserId: defaultReceiverId,
      receivedByNameManual: "",
    });
    setIsModalOpen(true);
  }

  function handleMembershipTypeChange(membershipType: MembershipType) {
    const selectedPlan = membershipPlans.find(
      (plan) => plan.slug === membershipType,
    );
    const suggestedEndDate = getSuggestedMembershipEndDate(
      paymentForm.membershipStartDate,
      selectedPlan,
    );

    setPaymentForm({
      ...paymentForm,
      membershipType,
      amount: selectedPlan ? String(selectedPlan.price) : paymentForm.amount,
      membershipEndDate: suggestedEndDate,
    });
  }

  function handleMembershipStartDateChange(membershipStartDate: string) {
    const selectedPlan = membershipPlans.find(
      (plan) => plan.slug === paymentForm.membershipType,
    );

    setPaymentForm({
      ...paymentForm,
      membershipStartDate,
      membershipEndDate: getSuggestedMembershipEndDate(
        membershipStartDate,
        selectedPlan,
      ),
    });
  }

  async function openHistoryModal(student: PaymentStudent) {
    try {
      setHistoryStudent(student);
      setIsHistoryModalOpen(true);
      setLoadingHistory(true);

      const payments = await getStudentPaymentHistory(student.id);
      setHistoryPayments(payments);
    } catch (error) {
      console.error("Error cargando historial del alumno:", error);
      alert("No se pudo cargar el historial del alumno.");
    } finally {
      setLoadingHistory(false);
    }
  }

  function closeHistoryModal() {
    setIsHistoryModalOpen(false);
    setHistoryStudent(null);
    setHistoryPayments([]);
  }

  function handleReceiptFileChange(file: File | null) {
    if (!file) {
      if (paymentForm.receiptPreviewUrl) {
        URL.revokeObjectURL(paymentForm.receiptPreviewUrl);
      }

      setPaymentForm({
        ...paymentForm,
        receiptFile: null,
        receiptPreviewUrl: "",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida del comprobante.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      alert("El comprobante no debe pesar más de 6 MB.");
      return;
    }

    if (paymentForm.receiptPreviewUrl) {
      URL.revokeObjectURL(paymentForm.receiptPreviewUrl);
    }

    setPaymentForm({
      ...paymentForm,
      receiptFile: file,
      receiptPreviewUrl: URL.createObjectURL(file),
    });
  }

  const overlapsCurrentMembership = Boolean(
    selectedStudent &&
      getDerivedMembershipStatus(selectedStudent) === "activa" &&
      hasDateRangeOverlap(
        paymentForm.membershipStartDate,
        paymentForm.membershipEndDate,
        selectedStudent.membership_start_date,
        selectedStudent.membership_end_date,
      ),
  );

  async function handleRegisterPayment() {
    if (!selectedStudent) return;

    const amount = Number(paymentForm.amount);

    if (!paymentForm.membershipType) {
      alert("Selecciona un plan de membresía.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }

    if (!paymentForm.paymentDate) {
      alert("Selecciona la fecha de pago.");
      return;
    }

    if (!paymentForm.membershipStartDate) {
      alert("Selecciona la fecha de inicio.");
      return;
    }

    if (!paymentForm.membershipEndDate) {
      alert("Selecciona la fecha de vencimiento.");
      return;
    }

    const startDate = parseLocalDate(paymentForm.membershipStartDate);
    const endDate = parseLocalDate(paymentForm.membershipEndDate);

    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      alert("La fecha de vencimiento no puede ser menor a la fecha de inicio.");
      return;
    }

    if (overlapsCurrentMembership) {
      alert(
        `No se puede registrar otro pago para la misma vigencia. La membresía actual de ${selectedStudent.full_name} cubre del ${formatDate(selectedStudent.membership_start_date)} al ${formatDate(selectedStudent.membership_end_date)}. Para cobrar la siguiente semana, usa una fecha de inicio posterior al vencimiento actual.`,
      );
      return;
    }

    try {
      const overlappingPayment = await getOverlappingMembershipPayment({
        studentId: selectedStudent.id,
        membershipStartDate: paymentForm.membershipStartDate,
        membershipEndDate: paymentForm.membershipEndDate,
      });

      if (overlappingPayment) {
        alert(
          `Este alumno ya tiene un pago registrado para una vigencia que se cruza con las fechas seleccionadas (${formatDate(overlappingPayment.membership_start_date || overlappingPayment.payment_date)} al ${formatDate(overlappingPayment.membership_end_date || overlappingPayment.payment_date)}). Ajusta el periodo antes de continuar.`,
        );
        return;
      }
    } catch (error) {
      console.error("Error verificando pagos duplicados:", error);
      alert("No se pudo verificar si existe un pago para esta misma vigencia. Intenta de nuevo.");
      return;
    }

    const selectedReceiver = staffProfiles.find(
      (staff) => staff.id === paymentForm.receivedByUserId,
    );
    const receivedByName =
      paymentForm.receivedByUserId === "manual"
        ? paymentForm.receivedByNameManual.trim()
        : getStaffDisplayName(selectedReceiver);

    if (!receivedByName) {
      alert("Indica quién recibió o registró el pago.");
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
        membershipStartDate: paymentForm.membershipStartDate,
        membershipEndDate: paymentForm.membershipEndDate,
        notes: paymentForm.notes,
        receiptFile: paymentForm.receiptFile,
        receivedByUserId:
          paymentForm.receivedByUserId === "manual"
            ? null
            : paymentForm.receivedByUserId || null,
        receivedByName,
        registeredByUserId: currentPaymentUser?.id || null,
        registeredByName: getStaffDisplayName(currentPaymentUser) || receivedByName,
      });

      setIsModalOpen(false);
      setSelectedStudent(null);
      await loadPaymentData();

      alert("Pago registrado y membresía actualizada.");
    } catch (error) {
      console.error("Error registrando pago:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el pago.",
      );
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

      const derivedStatus = getDerivedMembershipStatus(student);

      const matchesStatus =
        statusFilter === "todos" || derivedStatus === statusFilter;

      const matchesType =
        typeFilter === "todos" || student.membership_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [students, searchTerm, statusFilter, typeFilter]);

  const activeCount = students.filter(
    (student) => getDerivedMembershipStatus(student) === "activa",
  ).length;

  const expiredCount = students.filter(
    (student) => getDerivedMembershipStatus(student) === "vencida",
  ).length;

  const pendingCount = students.filter(
    (student) => getDerivedMembershipStatus(student) === "pendiente",
  ).length;

  const paymentsToday = recentPayments.filter((payment) =>
    isToday(payment.payment_date),
  );
  const paymentsWeek = recentPayments.filter((payment) =>
    isSameWeek(payment.payment_date),
  );
  const paymentsMonth = recentPayments.filter((payment) =>
    isSameMonth(payment.payment_date),
  );

  const incomeToday = paymentsToday.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const incomeWeek = paymentsWeek.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const incomeMonth = paymentsMonth.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const filteredRecentPayments = recentPayments.filter((payment) => {
    if (recentPaymentsFilter === "hoy") return isToday(payment.payment_date);
    if (recentPaymentsFilter === "ayer")
      return isYesterday(payment.payment_date);
    if (recentPaymentsFilter === "semana")
      return isSameWeek(payment.payment_date);
    if (recentPaymentsFilter === "mes")
      return isSameMonth(payment.payment_date);
    if (recentPaymentsFilter === "rango") {
      return isDateInRange(
        payment.payment_date,
        customStartDate,
        customEndDate,
      );
    }

    return true;
  });

  const filteredRecentIncome = filteredRecentPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

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

  const selectedPlan = membershipPlans.find(
    (plan) => plan.slug === paymentForm.membershipType,
  );

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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <CheckCircle2 className="mb-5 h-7 w-7 text-emerald-500" />
            <p className="text-sm text-zinc-500">Activas por fecha</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {activeCount}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertCircle className="mb-5 h-7 w-7 text-red-500" />
            <p className="text-sm text-zinc-500">Vencidas por fecha</p>
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
            <CalendarClock className="mb-5 h-7 w-7 text-amber-400" />
            <p className="text-sm text-zinc-500">Vencen en 7 días</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {upcomingExpirations.length}
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
            <p className="mt-1 text-xs text-zinc-500">
              {paymentsToday.length} pago(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardContent className="p-6">
            <CalendarDays className="mb-5 h-7 w-7 text-emerald-400" />
            <p className="text-sm text-zinc-500">Ingresos semana</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {formatMoney(incomeWeek)}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {paymentsWeek.length} pago(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-gold-500/10">
          <CardContent className="p-6">
            <BadgeDollarSign className="mb-5 h-7 w-7 text-gold-500" />
            <p className="text-sm text-zinc-500">Ingresos mes</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {formatMoney(incomeMonth)}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {paymentsMonth.length} pago(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-gold-500/10">
          <CardContent className="p-6">
            <ReceiptText className="mb-5 h-7 w-7 text-gold-500" />
            <p className="text-sm text-zinc-500">Movimientos cargados</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {recentPayments.length}
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
                  {membershipPlans.map((plan) => (
                    <option key={plan.id} value={plan.slug}>
                      {plan.name}
                    </option>
                  ))}
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
                const derivedStatus = getDerivedMembershipStatus(student);

                return (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-gold-500/30"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {getStatusIcon(derivedStatus)}

                          <h3 className="text-xl font-semibold text-white">
                            {student.full_name}
                          </h3>

                          {getStatusBadge(derivedStatus)}
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

                      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                        <Button
                          variant="outline"
                          className="gap-2 whitespace-nowrap"
                          onClick={() => openHistoryModal(student)}
                        >
                          <ReceiptText className="h-4 w-4" />
                          Historial
                        </Button>

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
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Pagos recientes
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Movimientos filtrados por periodo.
                  </p>
                </div>

                <ReceiptText className="h-6 w-6 text-gold-500" />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 xl:grid-cols-6">
                {[
                  { value: "hoy", label: "Hoy" },
                  { value: "ayer", label: "Ayer" },
                  { value: "semana", label: "Semana" },
                  { value: "mes", label: "Mes" },
                  { value: "rango", label: "Rango" },
                  { value: "todos", label: "Todos" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setRecentPaymentsFilter(
                        option.value as
                          | "todos"
                          | "hoy"
                          | "ayer"
                          | "semana"
                          | "mes"
                          | "rango",
                      )
                    }
                    className={`rounded-xl border px-3 py-2 font-semibold transition ${
                      recentPaymentsFilter === option.value
                        ? "border-gold-500 bg-gold-500 text-black"
                        : "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-gold-500/50 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {recentPaymentsFilter === "rango" && (
                <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Desde
                    </label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(event) =>
                        setCustomStartDate(event.target.value)
                      }
                      className="[color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Hasta
                    </label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(event) => setCustomEndDate(event.target.value)}
                      className="[color-scheme:dark]"
                    />
                  </div>
                </div>
              )}

              <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Resumen del filtro
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatMoney(filteredRecentIncome)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {filteredRecentPayments.length} movimiento(s) mostrado(s)
                    </p>
                  </div>
                </div>
              </div>

              {filteredRecentPayments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-800 p-5 text-center text-sm text-zinc-500">
                  Sin pagos en este periodo.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredRecentPayments.map((payment) => (
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

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span>{formatDate(payment.payment_date)}</span>
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5" />
                          Recibió: {getPaymentReceiverLabel(payment)}
                        </span>
                        {payment.receipt_url && (
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-gold-400 hover:text-gold-300"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver comprobante
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        title="Historial de pagos"
      >
        {historyStudent && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-4">
              <p className="text-xs uppercase tracking-widest text-gold-400">
                Alumno
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                {historyStudent.full_name}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Vencimiento actual:{" "}
                {formatDate(historyStudent.membership_end_date)}
              </p>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center rounded-2xl border border-zinc-800 p-8 text-zinc-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando historial...
              </div>
            ) : historyPayments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                Este alumno todavía no tiene pagos registrados.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Total pagado
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-400">
                      {formatMoney(
                        historyPayments.reduce(
                          (sum, payment) => sum + Number(payment.amount || 0),
                          0,
                        ),
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Movimientos
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {historyPayments.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Último pago
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDate(historyPayments[0]?.payment_date || null)}
                    </p>
                  </div>
                </div>

                <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
                  {historyPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <p className="font-semibold text-white">
                            {payment.concept ||
                              payment.plan_name_snapshot ||
                              "Pago"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDate(payment.payment_date)} ·{" "}
                            {payment.method || "sin método"}
                          </p>
                        </div>

                        <p className="text-lg font-bold text-emerald-400">
                          {formatMoney(Number(payment.amount || 0))}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-zinc-500 sm:grid-cols-2">
                        <p>
                          Inicio:{" "}
                          <span className="text-zinc-300">
                            {formatDate(payment.membership_start_date || null)}
                          </span>
                        </p>
                        <p>
                          Vence:{" "}
                          <span className="text-zinc-300">
                            {formatDate(payment.membership_end_date || null)}
                          </span>
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                          <p className="text-zinc-500">Recibió</p>
                          <p className="mt-1 font-semibold text-zinc-200">
                            {getPaymentReceiverLabel(payment)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                          <p className="text-zinc-500">Registró</p>
                          <p className="mt-1 font-semibold text-zinc-200">
                            {getPaymentRegisteredLabel(payment)}
                          </p>
                        </div>
                      </div>

                      {payment.receipt_url && (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-300 transition hover:border-gold-500/60 hover:bg-gold-500/20"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver comprobante de transferencia
                        </a>
                      )}

                      {payment.notes && (
                        <p className="mt-3 rounded-xl border border-zinc-800 bg-black/30 p-3 text-xs text-zinc-400">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={closeHistoryModal}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
                  {membershipPlans.map((plan) => (
                    <option key={plan.id} value={plan.slug}>
                      {plan.name} · {formatMoney(Number(plan.price))} ·{" "}
                      {formatPlanDuration(plan)} ·{" "}
                      {formatClassesPerDay(plan.classes_per_day)}
                    </option>
                  ))}
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

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gold-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Recibido / registrado por</p>
                  <p className="text-xs text-zinc-500">Selecciona admin, moderador o staff que recibió el pago.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={paymentForm.receivedByUserId}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      receivedByUserId: event.target.value,
                    })
                  }
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-gold-500/50"
                >
                  {staffProfiles.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {getStaffDisplayName(staff)} · {getRoleLabel(staff.role)}
                    </option>
                  ))}
                  <option value="manual">Escribir nombre manualmente</option>
                </select>

                {paymentForm.receivedByUserId === "manual" && (
                  <Input
                    value={paymentForm.receivedByNameManual}
                    onChange={(event) =>
                      setPaymentForm({
                        ...paymentForm,
                        receivedByNameManual: event.target.value,
                      })
                    }
                    placeholder="Nombre de quien recibió el pago"
                  />
                )}
              </div>

              {currentPaymentUser && (
                <p className="mt-3 text-xs text-zinc-500">
                  Sesión actual: {getStaffDisplayName(currentPaymentUser)} · {getRoleLabel(currentPaymentUser.role)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Monto cobrado</label>

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

                {selectedPlan && (
                  <p className="text-xs text-zinc-500">
                    Sugerido por el plan:{" "}
                    {formatMoney(Number(selectedPlan.price || 0))}
                  </p>
                )}
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

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Inicio de membresía
                </label>

                <Input
                  type="date"
                  value={paymentForm.membershipStartDate}
                  onChange={(event) =>
                    handleMembershipStartDateChange(event.target.value)
                  }
                  className="[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Vencimiento</label>

                <Input
                  type="date"
                  value={paymentForm.membershipEndDate}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      membershipEndDate: event.target.value,
                    })
                  }
                  className="[color-scheme:dark]"
                />

                <p className="text-xs text-zinc-500">
                  El sistema sugiere domingo, pero el admin puede ajustar.
                </p>
              </div>
            </div>

            {overlapsCurrentMembership && selectedStudent && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-red-300">Pago bloqueado para esta misma vigencia</p>
                    <p className="mt-1 text-xs leading-5 text-red-200/80">
                      La membresía actual ya cubre del {formatDate(selectedStudent.membership_start_date)} al {formatDate(selectedStudent.membership_end_date)}. Puedes registrar el siguiente pago usando una fecha de inicio posterior al vencimiento actual.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Resumen</p>
                  <p className="mt-1 font-semibold text-white">
                    {selectedPlan
                      ? `Membresía ${selectedPlan.name}`
                      : "Selecciona un plan"}
                  </p>

                  {selectedPlan && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Duración: {formatPlanDuration(selectedPlan)} ·{" "}
                      {formatClassesPerDay(selectedPlan.classes_per_day)}
                    </p>
                  )}

                  {selectedPlan && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Vigencia: {formatDate(paymentForm.membershipStartDate)} →{" "}
                      {formatDate(paymentForm.membershipEndDate)}
                    </p>
                  )}
                </div>

                <p className="text-2xl font-bold text-gold-500">
                  {formatMoney(Number(paymentForm.amount || 0))}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Comprobante de pago
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Ideal para transferencias. Se guardará junto al pago para reportes y conciliación bancaria.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-300 transition hover:border-gold-500/60 hover:bg-gold-500/20">
                  <UploadCloud className="h-4 w-4" />
                  Subir captura
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleReceiptFileChange(event.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>

              {paymentForm.receiptFile && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-black/30 p-3 sm:flex-row sm:items-center">
                  {paymentForm.receiptPreviewUrl && (
                    <img
                      src={paymentForm.receiptPreviewUrl}
                      alt="Vista previa del comprobante"
                      className="h-24 w-full rounded-lg object-cover sm:w-28"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {paymentForm.receiptFile.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {(paymentForm.receiptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReceiptFileChange(null)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-red-500/50 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                    Quitar
                  </button>
                </div>
              )}
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
                disabled={saving || membershipPlans.length === 0 || overlapsCurrentMembership}
                onClick={handleRegisterPayment}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ReceiptText className="h-4 w-4" />
                )}

                {saving ? "Registrando..." : paymentForm.receiptFile ? "Registrar pago con comprobante" : "Registrar pago"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
