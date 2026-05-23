import { Users, DollarSign, CalendarCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { mockAlumnos, mockPagos } from "@/src/data";
import { Badge } from "@/src/components/ui/Badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";

const dataIngresos = [
  { name: 'Lun', total: 1200 },
  { name: 'Mar', total: 800 },
  { name: 'Mié', total: 1500 },
  { name: 'Jue', total: 950 },
  { name: 'Vie', total: 2100 },
  { name: 'Sáb', total: 3200 },
  { name: 'Dom', total: 0 },
];

const dataAsistencia = [
  { name: 'Sem 1', asistentes: 120 },
  { name: 'Sem 2', asistentes: 135 },
  { name: 'Sem 3', asistentes: 110 },
  { name: 'Sem 4', asistentes: 145 },
];

export function AdminDashboard() {
  const alumnosActivos = mockAlumnos.filter(a => a.estado === 'Pagado' || a.estado === 'Pendiente').length;
  const alumnosVencidos = mockAlumnos.filter(a => a.estado === 'Vencido').length;
  const ingresosSemana = mockPagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Alumnos Activos</CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-white">{alumnosActivos}</div>
            <p className="text-xs text-zinc-500 mt-1">+2% desde el mes pasado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Alumnos Vencidos</CardTitle>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-red-500">{alumnosVencidos}</div>
            <p className="text-xs text-zinc-500 mt-1">Requieren seguimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Ingresos (Semana)</CardTitle>
            <DollarSign className="w-4 h-4 text-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-white">${ingresosSemana.toLocaleString()}</div>
            <p className="text-xs text-zinc-500 mt-1">En {mockPagos.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Asistencia Hoy</CardTitle>
            <CalendarCheck className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-white">45</div>
            <p className="text-xs text-zinc-500 mt-1">De 50 esperados</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Semanales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataIngresos}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Bar dataKey="total" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asistencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataAsistencia}>
                  <defs>
                    <linearGradient id="colorAsistentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="asistentes" stroke="#10b981" fillOpacity={1} fill="url(#colorAsistentes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Próximos a vencer</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {mockAlumnos.filter(a => a.estado === 'Pendiente' || a.estado === 'Vencido').slice(0, 5).map(alumno => (
                <div key={alumno.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
                      {alumno.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{alumno.nombre}</p>
                      <p className="text-xs text-zinc-500">{alumno.plan}</p>
                    </div>
                  </div>
                  <Badge variant={alumno.estado === 'Vencido' ? 'danger' : 'warning'}>
                    {alumno.fechaVencimiento}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Últimos Pagos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {mockPagos.slice(0, 5).map(pago => {
                const alumno = mockAlumnos.find(a => a.id === pago.alumnoId);
                return (
                  <div key={pago.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-xs">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{alumno?.nombre || 'Desconocido'}</p>
                        <p className="text-xs text-zinc-500">{pago.metodo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${pago.monto}</p>
                      <p className="text-xs text-zinc-500">{new Date(pago.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
