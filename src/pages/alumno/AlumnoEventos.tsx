import { Calendar, MapPin, Search } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { mockEventos } from "@/src/data";

export function AlumnoEventos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Clases y Eventos</h1>
          <p className="text-zinc-400 mt-1">Explora las actividades preparadas para ti en TXS.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input placeholder="Buscar eventos..." className="pl-9 w-full sm:w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {mockEventos.map((evento, i) => (
          <Card key={evento.id} className="overflow-hidden border-zinc-800 bg-txs-card hover:border-gold-500/30 transition-all group shadow-sm">
            <div className="h-48 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-txs-card via-black/40 to-transparent z-10" />
              <img 
                src={`https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop&sig=${i}`} 
                alt={evento.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-txs-black/80 backdrop-blur-md border border-zinc-700/50 text-white font-medium py-1 px-3">
                  Evento Especial
                </Badge>
              </div>
            </div>
            <CardContent className="p-6 relative z-20">
              <div className="flex items-center gap-3 text-sm text-gold-500 mb-3 font-medium">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric'})}</span>
                </div>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{evento.titulo}</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed line-clamp-2">
                {evento.descripcion}
              </p>
              <div className="flex items-center gap-2 text-sm text-zinc-300 mb-6 border-t border-zinc-800/50 pt-4">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{evento.lugar}</span>
              </div>
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-gold-500 hover:text-txs-black hover:border-gold-500 transition-colors font-medium">
                Solicitar Acceso
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {/* Placeholder for regular class */}
        <Card className="overflow-hidden border-zinc-800 bg-txs-card hover:border-gold-500/30 transition-all group shadow-sm">
          <div className="h-48 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-txs-card via-black/40 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800&auto=format&fit=crop" 
              alt="Clase regular"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 z-20">
              <Badge className="bg-txs-black/80 backdrop-blur-md border border-zinc-700/50 text-white font-medium py-1 px-3">
                Clase Regular
              </Badge>
            </div>
          </div>
          <CardContent className="p-6 relative z-20">
            <div className="flex items-center gap-3 text-sm text-gold-500 mb-3 font-medium">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Todos los Jueves</span>
              </div>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Clase Intermedios</h3>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed line-clamp-2">
              Clase de técnica y secuencias avanzadas para nivel intermedio con la instructora María. Asegura tu lugar con tiempo.
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-6 border-t border-zinc-800/50 pt-4">
              <MapPin className="w-4 h-4" />
              <span>Salón Principal TXS</span>
            </div>
            <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-500 cursor-not-allowed">
              Inscrito
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
