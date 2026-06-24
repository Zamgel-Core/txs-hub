// 📍 Ruta del archivo: src/services/storeService.ts

import { supabase } from "@/src/lib/supabase";

export type StoreCategory = "bebida" | "vestimenta" | "otro";
export type StorePaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";

export type StoreProduct = {
  id: string;
  name: string;
  category: StoreCategory;
  variant_label: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StoreSale = {
  id: string;
  product_id: string;
  student_id: string | null;
  buyer_name: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: StorePaymentMethod | string;
  sale_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  store_products?: {
    name: string;
    category: StoreCategory;
    variant_label: string | null;
  } | null;
  students?: {
    full_name: string;
    email: string;
  } | null;
};

export type StoreInventoryMovement = {
  id: string;
  product_id: string;
  movement_type: "sale" | "stock_in" | "stock_out" | "adjustment";
  quantity_delta: number;
  previous_stock: number;
  new_stock: number;
  unit_cost: number | null;
  reason: string | null;
  sale_id: string | null;
  created_by: string | null;
  created_at: string;
  store_products?: {
    name: string;
    variant_label: string | null;
  } | null;
};

export type StoreBuyerStudent = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

export type CreateStoreProductPayload = {
  name: string;
  category: StoreCategory;
  variantLabel?: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  notes?: string | null;
};

export type UpdateStoreProductPayload = Partial<CreateStoreProductPayload> & {
  isActive?: boolean;
};

export type RegisterStoreSalePayload = {
  productId: string;
  quantity: number;
  buyerName: string;
  studentId: string | null;
  paymentMethod: StorePaymentMethod;
  saleDate: string;
  notes: string;
};

export type AdjustStoreInventoryPayload = {
  productId: string;
  quantityDelta: number;
  reason: string;
  unitCost?: number | null;
};

const productSelect =
  "id, name, category, variant_label, price, cost, stock, min_stock, is_active, notes, created_at, updated_at";

const saleSelect =
  "id, product_id, student_id, buyer_name, quantity, unit_price, total_amount, payment_method, sale_date, notes, created_by, created_at, store_products(name, category, variant_label), students(full_name, email)";

const movementSelect =
  "id, product_id, movement_type, quantity_delta, previous_stock, new_stock, unit_cost, reason, sale_id, created_by, created_at, store_products(name, variant_label)";

export async function getStoreProducts() {
  const { data, error } = await supabase
    .from("store_products")
    .select(productSelect)
    .order("category", { ascending: true })
    .order("name", { ascending: true })
    .order("variant_label", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []) as StoreProduct[];
}

export async function createStoreProduct(payload: CreateStoreProductPayload) {
  const { error } = await supabase.from("store_products").insert({
    name: payload.name.trim(),
    category: payload.category,
    variant_label: payload.variantLabel?.trim() || null,
    price: payload.price,
    cost: payload.cost,
    stock: payload.stock,
    min_stock: payload.minStock,
    notes: payload.notes?.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function updateStoreProduct(
  productId: string,
  payload: UpdateStoreProductPayload,
) {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.name !== undefined) updatePayload.name = payload.name.trim();
  if (payload.category !== undefined) updatePayload.category = payload.category;
  if (payload.variantLabel !== undefined) {
    updatePayload.variant_label = payload.variantLabel?.trim() || null;
  }
  if (payload.price !== undefined) updatePayload.price = payload.price;
  if (payload.cost !== undefined) updatePayload.cost = payload.cost;
  if (payload.stock !== undefined) updatePayload.stock = payload.stock;
  if (payload.minStock !== undefined) updatePayload.min_stock = payload.minStock;
  if (payload.notes !== undefined) updatePayload.notes = payload.notes?.trim() || null;
  if (payload.isActive !== undefined) updatePayload.is_active = payload.isActive;

  const { error } = await supabase
    .from("store_products")
    .update(updatePayload)
    .eq("id", productId);

  if (error) throw new Error(error.message);
}

export async function getRecentStoreSales(limit = 25) {
  const { data, error } = await supabase
    .from("store_sales")
    .select(saleSelect)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data || []) as unknown as StoreSale[];
}

export async function getStoreInventoryMovements(limit = 25) {
  const { data, error } = await supabase
    .from("store_inventory_movements")
    .select(movementSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data || []) as unknown as StoreInventoryMovement[];
}

export async function getStoreBuyerStudents() {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, email, phone")
    .eq("is_deleted", false)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []) as StoreBuyerStudent[];
}

export async function registerStoreSale(payload: RegisterStoreSalePayload) {
  const { error } = await supabase.rpc("register_store_sale", {
    p_product_id: payload.productId,
    p_quantity: payload.quantity,
    p_buyer_name: payload.buyerName || null,
    p_student_id: payload.studentId,
    p_payment_method: payload.paymentMethod,
    p_sale_date: payload.saleDate,
    p_notes: payload.notes || null,
  });

  if (error) throw new Error(error.message);
}

export async function adjustStoreInventory(
  payload: AdjustStoreInventoryPayload,
) {
  const { error } = await supabase.rpc("adjust_store_inventory", {
    p_product_id: payload.productId,
    p_quantity_delta: payload.quantityDelta,
    p_reason: payload.reason || null,
    p_unit_cost: payload.unitCost ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function getStoreData() {
  const [products, recentSales, movements, students] = await Promise.all([
    getStoreProducts(),
    getRecentStoreSales(25),
    getStoreInventoryMovements(25),
    getStoreBuyerStudents(),
  ]);

  return {
    products,
    recentSales,
    movements,
    students,
  };
}
