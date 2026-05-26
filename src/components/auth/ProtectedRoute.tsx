// 📍 Ruta del archivo: src/components/auth/ProtectedRoute.tsx

import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/src/lib/supabase";

type Role = "admin" | "alumno";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (profile && profile.is_active && allowedRoles.includes(profile.role)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    }

    checkAccess();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-txs-black flex items-center justify-center text-gold-400">
        Cargando portal...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
