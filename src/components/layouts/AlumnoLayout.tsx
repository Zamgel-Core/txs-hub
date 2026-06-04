import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  TrendingUp,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../ui/Button";
import { supabase } from "@/src/lib/supabase";
import { getStudentAnnouncements } from "@/src/services/announcementsService";
import { PoweredByZamgel } from "@/src/components/common/PoweredByZamgel";

type Student = {
  id: string;
  full_name: string;
  email: string;
  membership_status: "activa" | "vencida" | "pendiente" | null;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "TX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getMembershipText(status: Student["membership_status"]) {
  if (status === "activa") return "Membresía Activa";
  if (status === "pendiente") return "Membresía Pendiente";
  return "Membresía Vencida";
}

function getMembershipClass(status: Student["membership_status"]) {
  if (status === "activa") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
  }

  if (status === "pendiente") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  return "border-red-500/20 bg-red-500/10 text-red-400";
}

export function AlumnoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    loadStudentHeader();
  }, []);

  useEffect(() => {
    if (!student?.id) return;

    loadUnreadAnnouncements(student.id);

    const channel = supabase
      .channel(`student-announcements-${student.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          loadUnreadAnnouncements(student.id);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcement_reads",
          filter: `student_id=eq.${student.id}`,
        },
        () => {
          loadUnreadAnnouncements(student.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id]);

  useEffect(() => {
    if (!student?.id) return;

    const handleAnnouncementsReadChanged = () => {
      loadUnreadAnnouncements(student.id);
    };

    window.addEventListener(
      "txs:announcements-read-changed",
      handleAnnouncementsReadChanged,
    );

    return () => {
      window.removeEventListener(
        "txs:announcements-read-changed",
        handleAnnouncementsReadChanged,
      );
    };
  }, [student?.id]);

  async function loadStudentHeader() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setStudent(null);
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, email, membership_status")
      .ilike("email", user.email)
      .maybeSingle();

    if (error) {
      console.error("Error cargando header alumno:", error);
      setStudent(null);
      return;
    }

    setStudent(data as Student | null);
  }

  async function loadUnreadAnnouncements(studentId: string) {
    try {
      const data = await getStudentAnnouncements(studentId);
      const unread = data.filter(
        (announcement) => !announcement.read_at,
      ).length;
      setUnreadAnnouncements(unread);

      window.dispatchEvent(new CustomEvent("txs:announcements-live-changed"));
    } catch (error) {
      console.error("Error cargando contador de avisos:", error);
      setUnreadAnnouncements(0);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const studentName = student?.full_name || "Alumno TXS";
  const initials = getInitials(studentName);

  const navItems = [
    { name: "Mi Portal", path: "/alumno", icon: LayoutDashboard },
    { name: "Mi Perfil", path: "/alumno/perfil", icon: UserCircle },
    {
      name: "Avisos",
      path: "/alumno/avisos",
      icon: Bell,
      badge: unreadAnnouncements,
    },
    { name: "Clases y Eventos", path: "/alumno/eventos", icon: Calendar },
    { name: "Mi Progreso", path: "/alumno/progreso", icon: TrendingUp },
    { name: "Historial de Pagos", path: "/alumno/pagos", icon: CreditCard },
    { name: "Soporte", path: "/alumno/soporte", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-txs-black flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-txs-card border-r border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/80 bg-txs-card relative overflow-hidden">
          <div className="flex items-center">
            <div className="absolute -left-10 -top-10 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

            <img
              src="/branding/logo_TSX.png"
              alt="TXS Logo"
              className="h-10 w-auto relative z-10"
            />

            <span className="font-display font-bold text-lg tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 relative z-10 ml-3 hidden md:block lg:hidden xl:block">
              PORTAL
            </span>
          </div>

          <button
            className="md:hidden text-zinc-400 hover:text-white p-2 rounded-md hover:bg-zinc-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive =
                item.path === "/alumno"
                  ? location.pathname === "/alumno"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 md:py-3 rounded-lg text-base md:text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-gold-500/10 to-transparent text-gold-400 border border-gold-500/20 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive ? "text-gold-500" : "text-zinc-500"
                      }`}
                    />

                    {item.name}
                  </span>

                  {item.badge && item.badge > 0 ? (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-black text-[11px] font-bold flex items-center justify-center shadow-[0_0_18px_rgba(212,175,55,0.35)]">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-lg text-base md:text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-500/5 via-txs-black to-txs-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0 mix-blend-screen">
          <img
            src="/branding/sombrero_TSX.png"
            alt=""
            className="w-[600px] h-auto grayscale"
          />
        </div>

        <header className="h-20 bg-txs-card/80 backdrop-blur-lg border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <Link
                to="/alumno/avisos"
                className="relative hidden sm:flex w-10 h-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/10 transition-all"
              >
                <Bell className="w-4 h-4" />

                {unreadAnnouncements > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gold-500 text-black text-[10px] font-bold flex items-center justify-center shadow-[0_0_18px_rgba(212,175,55,0.5)]">
                    {unreadAnnouncements > 99 ? "99+" : unreadAnnouncements}
                  </span>
                )}
              </Link>

              <div
                className={`hidden sm:inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${getMembershipClass(
                  student?.membership_status || "vencida",
                )}`}
              >
                {getMembershipText(student?.membership_status || "vencida")}
              </div>

              <div className="flex items-center gap-3 sm:border-l border-zinc-800 sm:pl-4 h-8">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-zinc-200 leading-tight">
                    {studentName}
                  </div>

                  <div className="text-xs text-zinc-500">Alumno TXS</div>
                </div>

                <Link
                  to="/alumno/perfil"
                  className="w-10 h-10 md:w-9 md:h-9 rounded-full border border-gold-500/40 bg-gold-500 text-black flex items-center justify-center font-bold text-sm transition hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                  title="Mi Perfil"
                >
                  {initials}
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex text-zinc-500 hover:text-red-400 transition-colors bg-zinc-900/50 p-2 rounded-full hover:bg-red-500/10 ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 text-zinc-100 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1">
            <Outlet />
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-800/60 text-center">
            <a
              href="https://zamgelcore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-orange-400 transition-colors"
            >
              <img
                src="/branding/zamgelcore-zc-logo.png"
                alt="Zamgel Core"
                className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />

              <span>
                Powered by <span className="font-semibold">Zamgel Core</span> ↗
              </span>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
