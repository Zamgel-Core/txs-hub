// 📍 Ruta del archivo: src/services/txsConfigService.ts

import { supabase } from "@/src/lib/supabase";

export type TXSLevel = {
  id: string;
  level_number: number;
  name: string;
  min_points: number;
  max_points: number | null;
  badge_label: string | null;
  description: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
};

export type TXSPointRule = {
  id: string;
  source_type: string;
  label: string;
  points: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function getTXSLevels() {
  const { data, error } = await supabase
    .from("txs_levels")
    .select("*")
    .order("level_number", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []) as TXSLevel[];
}

export async function updateTXSLevel(id: string, values: Partial<TXSLevel>) {
  const { error } = await supabase
    .from("txs_levels")
    .update({
      name: values.name,
      min_points: values.min_points,
      max_points: values.max_points,
      badge_label: values.badge_label,
      description: values.description,
      color: values.color,
      is_active: values.is_active,
      sort_order: values.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getTXSPointRules() {
  const { data, error } = await supabase
    .from("txs_point_rules")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []) as TXSPointRule[];
}

export async function updateTXSPointRule(
  id: string,
  values: Partial<TXSPointRule>,
) {
  const { error } = await supabase
    .from("txs_point_rules")
    .update({
      label: values.label,
      points: values.points,
      description: values.description,
      is_active: values.is_active,
      sort_order: values.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
