// 📍 Ruta: src/services/membershipPlansService.ts

import { supabase } from "@/src/lib/supabase";

export type MembershipDurationUnit = "days" | "weeks" | "months";

export type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration_count: number;
  duration_unit: MembershipDurationUnit;
  classes_per_day: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type MembershipPlanPayload = {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration_count: number;
  duration_unit: MembershipDurationUnit;
  classes_per_day: number;
  is_active: boolean;
  sort_order: number;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function createPlanSlug(name: string) {
  const slug = normalizeSlug(name);
  return slug || `plan-${Date.now()}`;
}

export function formatPlanDuration(
  plan: Pick<MembershipPlan, "duration_count" | "duration_unit">,
) {
  const count = Number(plan.duration_count || 0);

  if (plan.duration_unit === "days") {
    return count === 1 ? "1 día" : `${count} días`;
  }

  if (plan.duration_unit === "weeks") {
    return count === 1 ? "1 semana" : `${count} semanas`;
  }

  return count === 1 ? "1 mes" : `${count} meses`;
}

export function formatClassesPerDay(classesPerDay?: number | null) {
  const value = Number(classesPerDay || 1);

  if (value <= 1) return "1 clase por día";

  return `${value} clases por día`;
}

export async function getMembershipPlans(includeInactive = true) {
  let query = supabase
    .from("membership_plans")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("price", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as MembershipPlan[];
}

export async function createMembershipPlan(payload: MembershipPlanPayload) {
  const cleanPayload = {
    ...payload,
    slug: normalizeSlug(payload.slug || payload.name),
    classes_per_day: Math.max(1, Number(payload.classes_per_day || 1)),
  };

  const { error } = await supabase.from("membership_plans").insert(cleanPayload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateMembershipPlan(
  planId: string,
  payload: Partial<MembershipPlanPayload>,
) {
  const cleanPayload = {
    ...payload,
    ...(payload.slug ? { slug: normalizeSlug(payload.slug) } : {}),
    ...(payload.classes_per_day
      ? { classes_per_day: Math.max(1, Number(payload.classes_per_day)) }
      : {}),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("membership_plans")
    .update(cleanPayload)
    .eq("id", planId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteMembershipPlan(planId: string) {
  const { error } = await supabase
    .from("membership_plans")
    .delete()
    .eq("id", planId);

  if (error) {
    throw new Error(error.message);
  }
}
