/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/src/components/layouts/PublicLayout";
import { AdminLayout } from "@/src/components/layouts/AdminLayout";
import { AlumnoLayout } from "@/src/components/layouts/AlumnoLayout";
import { Landing } from "@/src/pages/public/Landing";
import { Terminos } from "@/src/pages/public/Terminos";
import { Privacidad } from "@/src/pages/public/Privacidad";
import { Reglamento } from "@/src/pages/public/Reglamento";
import { Login } from "@/src/pages/auth/Login";
import { AdminDashboard } from "@/src/pages/admin/AdminDashboard";
import { Alumnos } from "@/src/pages/admin/Alumnos";
import { Pagos } from "@/src/pages/admin/Pagos";
import { Asistencia } from "@/src/pages/admin/Asistencia";
import { Grupos } from "@/src/pages/admin/Grupos";
import { Avisos } from "@/src/pages/admin/Avisos";
import { Eventos } from "@/src/pages/admin/Eventos";
import { Reportes } from "@/src/pages/admin/Reportes";
import { Configuracion } from "@/src/pages/admin/Configuracion";
import { AlumnoDashboard } from "@/src/pages/alumno/AlumnoDashboard";
import { AlumnoEventos } from "@/src/pages/alumno/AlumnoEventos";
import { AlumnoPagos } from "@/src/pages/alumno/AlumnoPagos";
import { NotFound } from "@/src/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/reglamento" element={<Reglamento />} />
        </Route>

        <Route path="/login" element={<Login />} />

        {/* Rutas Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="alumnos" element={<Alumnos />} />
          <Route path="grupos" element={<Grupos />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* Rutas Alumno */}
        <Route path="/alumno" element={<AlumnoLayout />}>
          <Route index element={<AlumnoDashboard />} />
          <Route path="eventos" element={<AlumnoEventos />} />
          <Route path="pagos" element={<AlumnoPagos />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
