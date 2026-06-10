// 📍 Ruta del archivo: src/hooks/useAdminDashboard.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { syncMembershipStatus } from "@/src/services/membershipService";

import { supabase } from "@/src/lib/supabase";
import {
  DashboardPayment,
  DashboardStudent,
  getDashboardData,
} from "@/src/services/dashboardService";

function getDaysRemaining(date: string | null) {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameMonth(date: string) {
  const currentDate = new Date();
  const targetDate = parseLocalDate(date);

  if (!targetDate) return false;

  return (
    currentDate.getMonth() === targetDate.getMonth() &&
    currentDate.getFullYear() === targetDate.getFullYear()
  );
}

function isToday(date: string) {
  return date === getTodayLocalDateString();
}


function isPaidPayment(payment: DashboardPayment) {
  const status = String(payment.status || "").toLowerCase();
  return status === "pagado" || status === "paid";
}

function isMembershipPayment(payment: DashboardPayment) {
  return (
    isPaidPayment(payment) &&
    String(payment.concept || "").toLowerCase().startsWith("membresía")
  );
}

export function useAdminDashboard() {
  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [payments, setPayments] = useState<DashboardPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTimeout = useRef<number | null>(null);

  const loadDashboard = useCallback(async (showMainLoader = false) => {
    try {
      if (showMainLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      await syncMembershipStatus();

      const data = await getDashboardData();

      setStudents(data.students);
      setPayments(data.payments);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      alert("No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (refreshTimeout.current) {
      window.clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = window.setTimeout(() => {
      void loadDashboard(false);
    }, 350);
  }, [loadDashboard]);

  useEffect(() => {
    void loadDashboard(true);
  }, [loadDashboard]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
        },
        scheduleRealtimeRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        scheduleRealtimeRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimeout.current) {
        window.clearTimeout(refreshTimeout.current);
      }

      void supabase.removeChannel(channel);
    };
  }, [scheduleRealtimeRefresh]);

  const stats = useMemo(() => {
    const totalStudents = students.length;

    const activeStudents = students.filter(
      (student) => student.is_active,
    ).length;

    const activeMemberships = students.filter(
      (student) => student.membership_status === "activa",
    ).length;

    const expiredMemberships = students.filter(
      (student) => student.membership_status === "vencida",
    ).length;

    const pendingMemberships = students.filter(
      (student) => student.membership_status === "pendiente",
    ).length;

    const beginners = students.filter(
      (student) => student.group_level === "principiante",
    ).length;

    const advanced = students.filter(
      (student) => student.group_level === "avanzado",
    ).length;

    const membershipPayments = payments.filter(isMembershipPayment);

    const incomeToday = membershipPayments
      .filter((payment) => isToday(payment.payment_date))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const incomeMonth = membershipPayments
      .filter((payment) => isSameMonth(payment.payment_date))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const upcomingExpirations = students
      .filter((student) => {
        const days = getDaysRemaining(student.membership_end_date);
        return days !== null && days >= 0 && days <= 7;
      })
      .sort((a, b) => {
        return (
          new Date(a.membership_end_date || "").getTime() -
          new Date(b.membership_end_date || "").getTime()
        );
      })
      .slice(0, 6);

    const membershipBreakdown = {
      semanal: students.filter(
        (student) => student.membership_type === "semanal",
      ).length,
      quincenal: students.filter(
        (student) => student.membership_type === "quincenal",
      ).length,
      mensual: students.filter(
        (student) => student.membership_type === "mensual",
      ).length,
    };

    const recentPayments = membershipPayments.slice(0, 8);

    const studentMap = new Map(
      students.map((student) => [student.id, student]),
    );

    return {
      totalStudents,
      activeStudents,
      activeMemberships,
      expiredMemberships,
      pendingMemberships,
      beginners,
      advanced,
      incomeToday,
      incomeMonth,
      upcomingExpirations,
      membershipBreakdown,
      recentPayments,
      studentMap,
    };
  }, [students, payments]);

  return {
    students,
    payments,
    loading,
    refreshing,
    stats,
    reload: () => loadDashboard(false),
  };
}
