import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, CreditCard, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/Button";

export function AlumnoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Mi Portal", path: "/alumno", icon: LayoutDashboard },
    { name: "Clases y Eventos", path: "/alumno/eventos", icon: Calendar },
    { name: "Historial de Pagos", path: "/alumno/pagos", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-txs-black flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-txs-card border-r border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/80 bg-txs-card relative overflow-hidden">
          <div className="flex items-center">
            <div className="absolute -left-10 -top-10 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <img src="/branding/logo_TSX.png" alt="TXS Logo" className="h-10 w-auto relative z-10" />
            <span className="font-display font-bold text-lg tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 relative z-10 ml-3 hidden md:block lg:hidden xl:block">PORTAL</span>
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
              const isActive = location.pathname === item.path;
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
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-gold-500' : 'text-zinc-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 mt-auto">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-lg text-base md:text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all duration-300">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-500/5 via-txs-black to-txs-black">
        {/* Sombrero Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0 mix-blend-screen">
          <img src="/branding/sombrero_TSX.png" alt="" className="w-[600px] h-auto grayscale" />
        </div>
        
        <header className="h-20 bg-txs-card/80 backdrop-blur-lg border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <div className="hidden sm:inline-flex px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                Membresía Activa
              </div>
              <div className="flex items-center gap-3 sm:border-l border-zinc-800 sm:pl-4 h-8">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-zinc-200 leading-tight">Alejandro Martínez</div>
                  <div className="text-xs text-zinc-500">Alumno TXS</div>
                </div>
                <div className="w-10 h-10 md:w-9 md:h-9 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 relative">
                  <img src="https://ui-avatars.com/api/?name=Alejandro+Martinez&background=D4AF37&color=0B0B0B&bold=true" alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              <Link to="/login" className="hidden sm:flex text-zinc-500 hover:text-red-400 transition-colors bg-zinc-900/50 p-2 rounded-full hover:bg-red-500/10 ml-1">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 text-zinc-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
