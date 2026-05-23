import { CreditCard, DollarSign, Download, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { mockPagos } from "@/src/data";

export function AlumnoPagos() {
  const misPagos = mockPagos.slice(0, 3); // Simulating specific student's payments

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Historial de Pagos</h1>
          <p className="text-zinc-400 mt-1">Consulta tus recibos y estado de cuenta.</p>
        </div>
        <Button variant="gold" className="gap-2 shadow-lg shadow-gold-500/20">
          <CreditCard className="w-4 h-4" /> Pagar Membresía
        </Button>
      </div>

      <Card className="bg-txs-card border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {misPagos.map((pago, i) => (
                  <tr key={pago.id} className="hover:bg-zinc-900/30 transition-colors whitespace-nowrap">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      TXS-{1000 + i}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {new Date(pago.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-200">
                      {pago.plan}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-zinc-500" />
                        <span>{pago.metodo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      ${pago.monto} MXN
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="success">Completado</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-gold-500 hover:text-gold-400 hover:bg-gold-500/10 h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 bg-gradient-to-r from-zinc-900 to-txs-card border border-zinc-800/50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 p-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 relative z-10">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0 border border-blue-500/20 shadow-inner">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Pagos Automáticos Seguros</h3>
            <p className="text-sm text-zinc-400 max-w-lg">Puedes domiciliar tu tarjeta para que tu renovación sea automática. Nunca perderás acceso y ganarás más tiempo para bailar.</p>
          </div>
        </div>
        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 whitespace-nowrap relative z-10 w-full md:w-auto h-11">
          Configurar Tarjeta <ExternalLink className="w-4 h-4 ml-2 text-zinc-500" />
        </Button>
      </div>
    </div>
  );
}
