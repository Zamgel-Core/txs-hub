import { useState } from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { mockAlumnos, mockPagos } from "@/src/data";

export function Pagos() {
  const [selectedAlumno, setSelectedAlumno] = useState("");
  const [plan, setPlan] = useState("");
  const [metodo, setMetodo] = useState("");

  const handlePago = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumno || !plan || !metodo) return;
    alert("Pago registrado correctamente (Mock)");
    setSelectedAlumno("");
    setPlan("");
    setMetodo("");
  };

  const totalIngresado = mockPagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Pagos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border border-zinc-800/80 shadow-lg">
          <CardHeader>
            <CardTitle>Registrar Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePago} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Alumno</label>
                <select 
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
                  value={selectedAlumno}
                  onChange={(e) => setSelectedAlumno(e.target.value)}
                  required
                >
                  <option value="">Selecciona un alumno...</option>
                  {mockAlumnos.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} - Adeudo: ${a.adeudo}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Plan / Monto</label>
                <select 
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  required
                >
                  <option value="">Selecciona plan...</option>
                  <option value="Semanal $150">Semanal ($150)</option>
                  <option value="Quincenal $280">Quincenal ($280)</option>
                  <option value="Mensualidad $500">Mensualidad ($500)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Método de Pago</label>
                <select 
                  className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  required
                >
                  <option value="">Selecciona método...</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <Button type="submit" variant="gold" className="w-full mt-6 h-12 text-lg md:text-base md:h-10">
                Confirmar Pago
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col border border-zinc-800/80 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Historial Reciente</CardTitle>
            <div className="text-left sm:text-right">
              <span className="text-sm text-zinc-400">Total Ingresado (Mock)</span>
              <p className="text-2xl font-bold font-display text-gold-500 shadow-sm">${totalIngresado.toLocaleString()}</p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-zinc-400 whitespace-nowrap">
                <thead className="bg-zinc-900/50 text-zinc-300 font-medium">
                  <tr>
                    <th className="px-6 py-4">Alumno</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Método</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {mockPagos.map((pago) => {
                    const alumno = mockAlumnos.find(a => a.id === pago.alumnoId);
                    return (
                      <tr key={pago.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-200">{alumno?.nombre || 'Desconocido'}</td>
                        <td className="px-6 py-4">{pago.plan}</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-zinc-500" />
                          {pago.metodo}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{new Date(pago.fecha).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-white">${pago.monto}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
