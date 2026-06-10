// 📍 Ruta: src/App.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/src/components/layouts/PublicLayout";
import { AdminLayout } from "@/src/components/layouts/AdminLayout";
import { AlumnoLayout } from "@/src/components/layouts/AlumnoLayout";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { ScrollToTop } from "@/src/components/common/ScrollToTop";

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
import { Mensajes } from "@/src/pages/admin/Mensajes";
import { Evaluaciones } from "@/src/pages/admin/Evaluaciones";
import { SocialModeracion } from "@/src/pages/admin/SocialModeracion";

import { AlumnoDashboard } from "@/src/pages/alumno/AlumnoDashboard";
import { AlumnoEventos } from "@/src/pages/alumno/AlumnoEventos";
import { AlumnoPagos } from "@/src/pages/alumno/AlumnoPagos";
import { AlumnoSoporte } from "@/src/pages/alumno/AlumnoSoporte";
import { AlumnoAvisos } from "@/src/pages/alumno/AlumnoAvisos";
import { AlumnoProgreso } from "@/src/pages/alumno/AlumnoProgreso";
import { AlumnoSocial } from "@/src/pages/alumno/AlumnoSocial";

import { Academia } from "@/src/pages/public/Academia";
import { AcademiaInscripcion } from "@/src/pages/public/AcademiaInscripcion";
import { EventosPublicos } from "@/src/pages/public/EventosPublicos";
import { Producciones } from "@/src/pages/public/Producciones";
import { Palapa } from "@/src/pages/public/Palapa";

import { MiPerfil } from "@/src/pages/shared/MiPerfil";
import { SocialProfile } from "@/src/pages/shared/SocialProfile";

import { NotFound } from "@/src/pages/NotFound";

import { EscanerQR } from "@/src/pages/admin/EscanerQR";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/academia" element={<Academia />} />
          <Route
            path="/academia/inscripcion"
            element={<AcademiaInscripcion />}
          />
          <Route path="/eventos" element={<EventosPublicos />} />
          <Route path="/producciones" element={<Producciones />} />
          <Route path="/palapa" element={<Palapa />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/reglamento" element={<Reglamento />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "moderator"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="alumnos" element={<Alumnos />} />

          <Route
            path="grupos"
            element={
              <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                <Grupos />
              </ProtectedRoute>
            }
          />

          <Route
            path="pagos"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Pagos />
              </ProtectedRoute>
            }
          />

          <Route path="asistencia" element={<Asistencia />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
          <Route path="escaner" element={<EscanerQR />} />
          <Route path="mensajes" element={<Mensajes />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="social" element={<SocialModeracion />} />
          <Route path="social/perfil/:studentId" element={<SocialProfile />} />

          <Route
            path="configuracion"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Configuracion />
              </ProtectedRoute>
            }
          />

          <Route path="perfil" element={<MiPerfil mode="admin" />} />
        </Route>

        <Route
          path="/alumno"
          element={
            <ProtectedRoute allowedRoles={["alumno"]}>
              <AlumnoLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AlumnoDashboard />} />
          <Route path="avisos" element={<AlumnoAvisos />} />
          <Route path="progreso" element={<AlumnoProgreso />} />
          <Route path="social" element={<AlumnoSocial />} />
          <Route path="social/perfil/:studentId" element={<SocialProfile />} />
          <Route path="eventos" element={<AlumnoEventos />} />
          <Route path="pagos" element={<AlumnoPagos />} />
          <Route path="soporte" element={<AlumnoSoporte />} />
          <Route path="perfil" element={<MiPerfil mode="alumno" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
