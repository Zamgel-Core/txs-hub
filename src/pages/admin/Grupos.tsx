import { Plus, Users, Clock, UserCheck } from "lucide-react";
import { mockGrupos, mockAlumnos } from "@/src/data";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export function Grupos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Grupos</h1>
        <Button variant="gold" className="gap-2">
          <Plus className="w-4 h-4" /> Agregar Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGrupos.map(grupo => {
          const alumnosCount = mockAlumnos.filter(a => a.grupoId === grupo.id).length;
          return (
            <Card key={grupo.id} className="hover:border-gold-500/50 transition-colors">
              <CardHeader className="bg-zinc-900/30 border-b border-zinc-800/50 pb-4">
                <CardTitle className="text-xl text-white">{grupo.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <UserCheck className="w-4 h-4 text-gold-500" />
                  <span>Instructor: <strong className="text-zinc-200">{grupo.instructor}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Clock className="w-4 h-4 text-gold-500" />
                  <span>Horario: <strong className="text-zinc-200">{grupo.horario}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Users className="w-4 h-4 text-gold-500" />
                  <span>Alumnos Inscritos: <strong className="text-zinc-200">{alumnosCount}</strong></span>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/50 mt-4">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Ver alumnos</Button>
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">Editar grupo</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
