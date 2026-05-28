// 📍 Ruta del archivo: src/services/membershipService.ts

import { supabase } from "@/src/lib/supabase";

export async function syncMembershipStatus() {
  const { error } = await supabase.rpc("sync_membership_status");

  if (error) {
    throw new Error(error.message);
  }
}
