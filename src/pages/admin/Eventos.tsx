import { Plus, MapPin, Calendar, Edit2, Trash2 } from "lucide-react";
import { mockEventos } from "@/src/data";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export function Eventos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Eventos</h1>
        <Button variant="gold" className="gap-2">
          <Plus className="w-4 h-4" /> Agregar Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEventos.map(evento => (
          <Card key={evento.id} className="flex flex-col overflow-hidden group">
            <div className="h-32 bg-zinc-900 border-b border-zinc-800 flex flex-col justify-center items-center text-center p-4 group-hover:bg-zinc-800/80 transition-colors">
               <span className="text-gold-500 text-sm font-bold uppercase">{new Date(evento.fecha).toLocaleString('es-ES', { month: 'short' })}</span>
               <span className="text-4xl font-display font-bold text-white">{new Date(evento.fecha).getDate() + 1}</span>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl group-hover:text-gold-500 transition-colors">{evento.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-2">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span>{evento.lugar}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>{evento.fecha}</span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 flex-1 line-clamp-3">{evento.descripcion}</p>
              
              <div className="flex items-center gap-2 justify-end mt-6 border-t border-zinc-800/50 pt-4">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white px-2">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
