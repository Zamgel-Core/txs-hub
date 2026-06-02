// 📍 Ruta del archivo: src/components/auth/ProtectedRoute.tsx

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/src/lib/supabase";
import type { Role } from "@/src/types";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const allowedKey = useMemo(() => allowedRoles.join(","), [allowedRoles]);

  useEffect(() => {
    async function checkAccess() {
      setLoading(true);

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

      const role = profile?.role as Role | undefined;

      if (profile?.is_active && role && allowedRoles.includes(role)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    }

    checkAccess();
  }, [allowedKey]);

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
