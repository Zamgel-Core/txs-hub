import { Building2, CreditCard, Bell, Save } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";

export function Configuracion() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Configuración mock guardada con éxito.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Configuración</h1>
          <p className="text-zinc-400 mt-1">Administra los ajustes generales del sistema.</p>
        </div>
        <Button variant="gold" className="gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" /> Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            <button className="flex items-center gap-3 px-4 py-3 bg-zinc-800/80 text-gold-500 rounded-lg text-sm font-medium w-full text-left whitespace-nowrap lg:whitespace-normal">
              <Building2 className="w-5 h-5 flex-shrink-0" /> General
            </button>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 text-zinc-400 rounded-lg text-sm font-medium transition-colors w-full text-left whitespace-nowrap lg:whitespace-normal">
              <CreditCard className="w-5 h-5 flex-shrink-0" /> Métodos de Pago
            </button>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 text-zinc-400 rounded-lg text-sm font-medium transition-colors w-full text-left whitespace-nowrap lg:whitespace-normal">
              <Bell className="w-5 h-5 flex-shrink-0" /> Notificaciones
            </button>
          </nav>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Academia</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">Actualiza el nombre, logo y colores principales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Nombre del Sistema</label>
                <Input defaultValue="TXS HUB" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Frase principal</label>
                <Input defaultValue="El centro de control para alumnos, pagos, eventos y experiencias de Texano Show." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Color Primario (Dorado)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-zinc-700 bg-[#D4AF37]"></div>
                  <Input defaultValue="#D4AF37" className="w-32" />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-800/50">
                <label className="text-sm font-medium text-zinc-300">Logo de la Academia</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold font-display cursor-not-allowed">
                    TXS
                  </div>
                  <Button variant="outline" className="text-zinc-300 border-zinc-700">Cambiar Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planes por defecto</CardTitle>
              <CardDescription className="text-zinc-400 text-sm">Maneja los planes base a mostrar al inscribir alumnos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input defaultValue="Semanal" className="flex-1" />
                <Input defaultValue="150" type="number" className="w-32" />
              </div>
              <div className="flex items-center gap-4">
                <Input defaultValue="Quincenal" className="flex-1" />
                <Input defaultValue="280" type="number" className="w-32" />
              </div>
              <div className="flex items-center gap-4">
                <Input defaultValue="Mensualidad" className="flex-1" />
                <Input defaultValue="500" type="number" className="w-32" />
              </div>
              <Button variant="ghost" className="text-gold-500 hover:text-gold-400 mt-2 px-0">+ Agregar plan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
