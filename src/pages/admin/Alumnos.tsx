import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { mockAlumnos, mockGrupos } from "@/src/data";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { EstadoAlumno } from "@/src/types";

export function Alumnos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoAlumno | "Todos">("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAlumnos = mockAlumnos.filter(a => {
    const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === "Todos" || a.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: EstadoAlumno) => {
    switch (estado) {
      case 'Pagado': return <Badge variant="success">Pagado</Badge>;
      case 'Pendiente': return <Badge variant="warning">Pendiente</Badge>;
      case 'Vencido': return <Badge variant="danger">Vencido</Badge>;
      case 'Inactivo': return <Badge variant="neutral">Inactivo</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  const handleNuevoAlumno = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Alumno guardado (Mock)");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Alumnos</h1>
        <Button variant="gold" className="gap-2 w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Agregar Alumno
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/20">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Buscar por nombre..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select 
              className="w-full sm:w-auto bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 md:h-10 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as EstadoAlumno | "Todos")}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Vencido">Vencido</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/50 text-zinc-300 font-medium whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Grupo</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Vencimiento</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredAlumnos.map((alumno) => {
                  const grupo = mockGrupos.find(g => g.id === alumno.grupoId);
                  return (
                    <tr key={alumno.id} className="hover:bg-zinc-900/30 transition-colors whitespace-nowrap">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                            {alumno.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{alumno.nombre}</div>
                            <div className="text-xs text-zinc-500">{alumno.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{alumno.telefono}</td>
                      <td className="px-6 py-4">
                        <span className="truncate max-w-[150px] inline-block align-bottom" title={grupo?.nombre}>
                          {grupo?.nombre || 'Sin grupo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{alumno.plan}</td>
                      <td className="px-6 py-4">
                        {getEstadoBadge(alumno.estado)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{alumno.fechaVencimiento}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gold-500 hover:text-gold-400">Editar</Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAlumnos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                      No se encontraron alumnos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nuevo Alumno">
        <form onSubmit={handleNuevoAlumno} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nombre completo</label>
              <Input required placeholder="Ej. Juan Pérez" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
              <Input type="email" required placeholder="juan@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Teléfono</label>
              <Input required placeholder="10 dígitos" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Grupo asignado</label>
              <select className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300">
                <option value="">Selecciona un grupo</option>
                {mockGrupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Plan de Pago</label>
              <select className="w-full bg-zinc-900/50 border border-zinc-800/80 text-base md:text-sm rounded-lg px-4 h-12 text-zinc-200 outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all duration-300">
                <option value="Semanal">Semanal ($150)</option>
                <option value="Quincenal">Quincenal ($280)</option>
                <option value="Mensualidad">Mensualidad ($500)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto h-12 sm:h-10">Cancelar</Button>
            <Button type="submit" variant="gold" className="w-full sm:w-auto h-12 sm:h-10">Guardar Alumno</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
