import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const dataMensual = [
  { name: 'Ene', ingresos: 15000, alumnos: 120 },
  { name: 'Feb', ingresos: 18000, alumnos: 135 },
  { name: 'Mar', ingresos: 16500, alumnos: 130 },
  { name: 'Abr', ingresos: 21000, alumnos: 155 },
  { name: 'May', ingresos: 24000, alumnos: 180 },
  { name: 'Jun', ingresos: 28000, alumnos: 210 },
];

const dataAsistenciaPromedio = [
  { name: 'Sem 1', promedio: 85 },
  { name: 'Sem 2', promedio: 90 },
  { name: 'Sem 3', promedio: 88 },
  { name: 'Sem 4', promedio: 95 },
];

const dataEstados = [
  { name: 'Pagado', value: 80 },
  { name: 'Pendiente', value: 15 },
  { name: 'Vencido', value: 5 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function Reportes() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Reportes y Métricas</h1>
      <p className="text-zinc-400">Rendimiento general de la academia (Datos Mock)</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Bar dataKey="ingresos" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Alumnos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Line type="monotone" dataKey="alumnos" stroke="#60a5fa" strokeWidth={3} dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados de Membresía</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className="h-[300px] w-full flex flex-col sm:flex-row items-center">
              <ResponsiveContainer width="100%" height="100%" className="flex-1">
                <PieChart>
                  <Pie
                    data={dataEstados}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataEstados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-row sm:flex-col gap-4 mt-4 sm:mt-0 justify-center w-full sm:w-auto">
                 {dataEstados.map((entry, index) => (
                   <div key={entry.name} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                     <span className="text-sm text-zinc-300">{entry.name} ({entry.value}%)</span>
                   </div>
                 ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asistencia Promedio (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataAsistenciaPromedio}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line type="stepAfter" dataKey="promedio" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
