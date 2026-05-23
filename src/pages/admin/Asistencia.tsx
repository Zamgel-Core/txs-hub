import { useState } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { mockAlumnos, mockGrupos } from "@/src/data";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export function Asistencia() {
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedFecha, setSelectedFecha] = useState(new Date().toISOString().split('T')[0]);

  // En una app real, leeríamos la tabla de Asistencia y cruzaríamos datos
  const alumnosGrupo = mockAlumnos.filter(a => selectedGrupo ? a.grupoId === selectedGrupo : false);

  const [asistencias, setAsistencias] = useState<Record<string, 'Presente' | 'Ausente' | 'Justificado'>>({});

  const handleMarcar = (alumnoId: string, estado: 'Presente' | 'Ausente' | 'Justificado') => {
    setAsistencias(prev => ({ ...prev, [alumnoId]: estado }));
  };

  const handlesGuardar = () => {
    alert("Asistencia guardada correctamente (Mock)");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white">Asistencia</h1>

      <Card className="border border-zinc-800/80 shadow-lg">
        <div className="p-4 sm:p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row gap-5 items-center bg-zinc-900/30 rounded-t-xl">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Grupo de Clase</label>
            <select 
              className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
            >
              <option value="">Selecciona un grupo para empezar...</option>
              {mockGrupos.map(g => (
                <option key={g.id} value={g.id}>{g.nombre} ({g.instructor})</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-[250px]">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Fecha</label>
            <input 
              type="date"
              className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
            />
          </div>
        </div>

        <CardContent className="p-0">
          {!selectedGrupo ? (
            <div className="py-24 px-4 text-center text-zinc-500 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none mix-blend-screen w-[300px]">
                <img src="/branding/sombrero_TSX.png" alt="" className="w-full h-auto grayscale" />
              </div>
              <div className="w-20 h-20 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-6 relative z-10 shadow-lg">
                <img src="/branding/sombrero_TSX.png" alt="" className="w-10 h-10 object-contain opacity-50" />
              </div>
              <p className="text-xl font-display font-medium text-zinc-300 relative z-10">Selecciona un grupo</p>
              <p className="text-sm mt-2 max-w-sm relative z-10">Elige un grupo de la lista para comenzar a pasar asistencia de los alumnos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-zinc-400 whitespace-nowrap">
                <thead className="bg-zinc-900/50 text-zinc-300 font-medium">
                  <tr>
                    <th className="px-6 py-4 w-full md:w-1/2">Alumno</th>
                    <th className="px-6 py-4 text-right">Marcar Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {alumnosGrupo.map((alumno) => (
                    <tr key={alumno.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-white">
                            {alumno.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white text-base md:text-sm">{alumno.nombre}</div>
                            <div className="text-xs text-zinc-500">{alumno.plan}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <Button 
                            variant={asistencias[alumno.id] === 'Presente' ? 'default' : 'outline'}
                            onClick={() => handleMarcar(alumno.id, 'Presente')}
                            size="sm"
                            className={`h-10 md:h-9 ${asistencias[alumno.id] === 'Presente' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md' : 'hover:text-emerald-500 hover:border-emerald-500'}`}
                          >
                            <Check className="w-5 h-5 md:w-4 md:h-4 sm:mr-2" /> <span className="hidden sm:inline">Presente</span>
                          </Button>
                          <Button 
                            variant={asistencias[alumno.id] === 'Ausente' ? 'default' : 'outline'}
                            onClick={() => handleMarcar(alumno.id, 'Ausente')}
                            size="sm"
                            className={`h-10 md:h-9 ${asistencias[alumno.id] === 'Ausente' ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md' : 'hover:text-red-500 hover:border-red-500'}`}
                          >
                            <X className="w-5 h-5 md:w-4 md:h-4 sm:mr-2" /> <span className="hidden sm:inline">Ausente</span>
                          </Button>
                          <Button 
                            variant={asistencias[alumno.id] === 'Justificado' ? 'default' : 'outline'}
                            onClick={() => handleMarcar(alumno.id, 'Justificado')}
                            size="sm"
                            className={`h-10 md:h-9 ${asistencias[alumno.id] === 'Justificado' ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md' : 'hover:text-amber-500 hover:border-amber-500'}`}
                          >
                            <AlertCircle className="w-5 h-5 md:w-4 md:h-4 sm:mr-2" /> <span className="hidden sm:inline">Justific.</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {alumnosGrupo.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-zinc-500">
                        No hay alumnos registrados en este grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {alumnosGrupo.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-zinc-800 flex justify-end bg-zinc-900/20 rounded-b-xl">
                  <Button variant="gold" onClick={handlesGuardar} className="w-full sm:w-auto h-12 sm:h-10">Guardar Lista de Asistencia</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
