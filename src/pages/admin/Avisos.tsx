import { Plus, Bell, Calendar as CalendarIcon } from "lucide-react";
import { mockAvisos } from "@/src/data";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

export function Avisos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Avisos y Comunicados</h1>
        <Button variant="gold" className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo Aviso
        </Button>
      </div>

      <div className="space-y-4">
        {mockAvisos.map(aviso => (
          <Card key={aviso.id} className="hover:border-gold-500/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-gold-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-lg text-white">{aviso.titulo}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-2">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{aviso.fecha}</span>
                  </div>
                  <p className="text-zinc-400 text-sm">{aviso.contenido}</p>
                </div>
                <div>
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">Editar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
