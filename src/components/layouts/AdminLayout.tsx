// 📍 Ruta del archivo: src/components/layouts/AdminLayout.tsx

import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Calendar,
  CalendarCheck,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Settings,
  UserCircle,
  Users,
  X,
  QrCode,
  ClipboardCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../ui/Button";
import { supabase } from "@/src/lib/supabase";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string>("admin");
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role) {
        setRole(data.role);
      }
    }

    loadRole();
  }, []);

  const navItems =
    role === "moderator"
      ? [
          { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
          { name: "Mi Perfil", path: "/admin/perfil", icon: UserCircle },
          { name: "Alumnos", path: "/admin/alumnos", icon: Users },
          { name: "Grupos", path: "/admin/grupos", icon: Users },
          {
            name: "Asistencia",
            path: "/admin/asistencia",
            icon: CalendarCheck,
          },
          { name: "Escáner QR", path: "/admin/escaner", icon: QrCode },
          {
            name: "Evaluaciones",
            path: "/admin/evaluaciones",
            icon: ClipboardCheck,
          },
          { name: "Mensajes", path: "/admin/mensajes", icon: Mail },
          { name: "Avisos", path: "/admin/avisos", icon: Megaphone },
          { name: "Eventos", path: "/admin/eventos", icon: Calendar },
          { name: "Reportes", path: "/admin/reportes", icon: FileBarChart },
        ]
      : [
          { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
          { name: "Mi Perfil", path: "/admin/perfil", icon: UserCircle },
          { name: "Alumnos", path: "/admin/alumnos", icon: Users },
          { name: "Grupos", path: "/admin/grupos", icon: Users },
          { name: "Pagos", path: "/admin/pagos", icon: CreditCard },
          {
            name: "Asistencia",
            path: "/admin/asistencia",
            icon: CalendarCheck,
          },
          {
            name: "Evaluaciones",
            path: "/admin/evaluaciones",
            icon: ClipboardCheck,
          },
          { name: "Mensajes", path: "/admin/mensajes", icon: Mail },
          { name: "Avisos", path: "/admin/avisos", icon: Megaphone },
          { name: "Eventos", path: "/admin/eventos", icon: Calendar },
          { name: "Reportes", path: "/admin/reportes", icon: FileBarChart },
          {
            name: "Configuración",
            path: "/admin/configuracion",
            icon: Settings,
          },
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
              {role === "moderator" ? "MOD" : "ADMIN"}
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
                item.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-lg text-base md:text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-gold-500/10 to-transparent text-gold-400 border border-gold-500/20 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-gold-500" : "text-zinc-500"
                    }`}
                  />

                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 mt-auto">
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-lg text-base md:text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Link>
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-300 hidden sm:inline-block">
                {role === "moderator" ? "Moderador TXS" : "Admin TXS"}
              </span>

              <Link
                to="/admin/perfil"
                className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-500 font-bold transition hover:scale-105 hover:bg-gold-500 hover:text-black"
                title="Mi Perfil"
              >
                {role === "moderator" ? "M" : "A"}
              </Link>
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
