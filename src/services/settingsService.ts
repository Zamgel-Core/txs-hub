// 📍 Ruta del archivo: src/services/settingsService.ts

import { supabase } from "@/src/lib/supabase";

export type SystemSettings = {
  id: string;
  academy_name: string;
  academy_slogan: string | null;
  primary_color: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  instructor_name: string | null;
  weekly_price: number | null;
  biweekly_price: number | null;
  monthly_price: number | null;
  academy_address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  logo_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function getSystemSettings() {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SystemSettings;
}

export async function updateSystemSettings(
  settingsId: string,
  values: Partial<SystemSettings>,
) {
  const { error } = await supabase
    .from("system_settings")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settingsId);

  if (error) {
    throw new Error(error.message);
  }
}
