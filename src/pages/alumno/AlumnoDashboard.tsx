import { Calendar, CreditCard, Bell, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { mockAlumnos, mockAvisos, mockEventos } from "@/src/data";
import { Link } from "react-router-dom";

export function AlumnoDashboard() {
  const alumno = mockAlumnos[0];

  return (
    <div className="space-y-8">
      {/* Premium CTA and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gold-500/10 via-txs-card to-zinc-900/80 p-8 sm:p-10 rounded-2xl border border-zinc-800/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-gold-500/20 transition-all duration-700"></div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 mb-3 drop-shadow-md">
              ¡Hola, {alumno.nombre.split(' ')[0]}!
            </h1>
            <p className="text-zinc-400 text-lg font-light">Es un buen día para bailar. Tienes <strong className="text-white font-medium">2 clases</strong> programadas para esta semana.</p>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <Button variant="gold" size="lg" className="w-full md:w-auto gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] text-md h-12 px-8 transition-all duration-300">
              <CreditCard className="w-5 h-5" /> Pagar Membresía
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Cards: Estado, Fecha vencimiento, Próximo Pago, Asistencia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant="success">Al corriente</Badge>
            </div>
            <p className="text-sm text-zinc-500">Estado Actual</p>
            <p className="text-xl font-bold text-white font-display mt-1">Membresía Activa</p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gold-500" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">Fecha de Vencimiento</p>
            <p className="text-xl font-bold text-white font-display mt-1">{alumno.fechaVencimiento}</p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-zinc-300" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">Próximo Pago</p>
            <p className="text-xl font-bold text-white font-display mt-1">$500 MXN</p>
          </CardContent>
        </Card>

        <Card className="bg-txs-card border-zinc-800/80 hover:border-gold-500/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">Asistencia Mensual</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl font-bold text-white font-display">95%</p>
              <span className="text-xs text-zinc-500">12/13 clases</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avisos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white">Avisos Recientes</h2>
            <Button variant="link" className="text-gold-500 hover:text-gold-400 text-sm h-auto p-0">Ver todos</Button>
          </div>
          <div className="space-y-4">
            {mockAvisos.map(aviso => (
              <Card key={aviso.id} className="border-l-4 border-l-gold-500 bg-txs-card border-y-zinc-800 border-r-zinc-800 hover:bg-zinc-900/50 transition-colors">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bell className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{aviso.titulo}</h3>
                    <p className="text-sm text-zinc-400 mb-2">{aviso.contenido}</p>
                    <p className="text-xs font-mono text-zinc-500">{aviso.fecha}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Asistencia Resumen */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white">Asistencia Reciente</h2>
          </div>
          <Card className="bg-txs-card border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/80">
                {[
                  { fecha: 'Ayer', clase: 'Principiantes L/M', estado: 'Presente' },
                  { fecha: '18 May', clase: 'Salsa Cubana', estado: 'Presente' },
                  { fecha: '15 May', clase: 'Principiantes L/M', estado: 'Ausente' },
                  { fecha: '11 May', clase: 'Principiantes L/M', estado: 'Presente' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.estado === 'Presente' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.clase}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{item.fecha}</p>
                      </div>
                    </div>
                    <Badge variant={item.estado === 'Presente' ? 'success' : 'danger'}>{item.estado}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Próximos Eventos Slider/Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-4">
          <h2 className="text-xl font-display font-bold text-white">Próximos Eventos</h2>
          <Link to="/alumno/eventos">
            <Button variant="link" className="text-gold-500 hover:text-gold-400 text-sm h-auto p-0">Ver calendario completo</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {mockEventos.map((evento, i) => (
            <Card key={evento.id} className="overflow-hidden bg-txs-card border-zinc-800 hover:border-gold-500/40 transition-all group">
              <div className="h-40 w-full relative bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-t from-txs-card to-transparent z-10" />
                <img 
                  src={`https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600&auto=format&fit=crop&sig=${i}`} 
                  alt={evento.titulo}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 duration-500"
                />
                <div className="absolute top-4 left-4 z-20 bg-txs-black/80 backdrop-blur-md border border-zinc-700/50 rounded-lg px-3 py-2 text-center pointer-events-none">
                  <p className="text-xs font-bold text-gold-500 uppercase leading-none mb-1">
                    {new Date(evento.fecha).toLocaleString('es-ES', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-display font-bold text-white leading-none">
                    {new Date(evento.fecha).getDate() + 1}
                  </p>
                </div>
              </div>
              <CardContent className="p-5 relative z-20">
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-gold-500 transition-colors line-clamp-1">{evento.titulo}</h3>
                <div className="space-y-2 mb-5">
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" /> 20:00 hrs
                  </p>
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" /> <span className="line-clamp-1">{evento.lugar}</span>
                  </p>
                </div>
                <Button variant="outline" className="w-full border-zinc-700 hover:bg-gold-500 hover:text-txs-black hover:border-gold-500 transition-colors font-medium">
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
