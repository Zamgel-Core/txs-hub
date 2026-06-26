// 📍 Ruta del archivo: src/services/storeService.ts

import ExcelJS from "exceljs";

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
    cost: number;
  } | null;
  students?: {
    full_name: string;
    email: string;
  } | null;
};

export type StoreInventoryMovementType =
  | "sale"
  | "stock_in"
  | "stock_out"
  | "adjustment"
  | "gift"
  | "internal_use"
  | "waste";

export type StoreInventoryMovement = {
  id: string;
  product_id: string;
  movement_type: StoreInventoryMovementType;
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

export type StoreOutputType = "sale" | "gift" | "internal_use" | "waste";

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

export type RegisterStoreOutputPayload = {
  outputType: Exclude<StoreOutputType, "sale">;
  productId: string;
  quantity: number;
  recipientName: string;
  outputDate: string;
  notes: string;
  unitCost?: number | null;
};

const productSelect =
  "id, name, category, variant_label, price, cost, stock, min_stock, is_active, notes, created_at, updated_at";

const saleSelect =
  "id, product_id, student_id, buyer_name, quantity, unit_price, total_amount, payment_method, sale_date, notes, created_by, created_at, store_products(name, category, variant_label, cost), students(full_name, email)";

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


export async function getStoreSalesByDateRange(
  startDate: string,
  endDate: string,
  limit = 500,
) {
  const { data, error } = await supabase
    .from("store_sales")
    .select(saleSelect)
    .gte("sale_date", startDate)
    .lt("sale_date", endDate)
    .order("sale_date", { ascending: false })
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


export async function getStoreInventoryMovementsByDateRange(
  startDate: string,
  endDate: string,
  limit = 500,
) {
  const { data, error } = await supabase
    .from("store_inventory_movements")
    .select(movementSelect)
    .gte("created_at", startDate)
    .lt("created_at", endDate)
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

export function getStoreOutputTypeLabel(type: StoreOutputType | StoreInventoryMovement["movement_type"] | string) {
  const labels: Record<string, string> = {
    sale: "Venta",
    gift: "Regalo",
    internal_use: "Consumo interno",
    waste: "Merma",
    stock_in: "Entrada",
    stock_out: "Salida",
    adjustment: "Ajuste",
  };

  return labels[type] || type;
}

export function inferStoreMovementOutputType(movement: Pick<StoreInventoryMovement, "movement_type" | "reason">): StoreInventoryMovementType {
  if (["gift", "internal_use", "waste"].includes(movement.movement_type)) {
    return movement.movement_type as StoreInventoryMovementType;
  }

  const reason = (movement.reason || "").toLowerCase();

  if (reason.includes("[regalo]")) return "gift";
  if (reason.includes("[consumo interno]")) return "internal_use";
  if (reason.includes("[merma]")) return "waste";

  return movement.movement_type;
}

export async function registerStoreOutput(payload: RegisterStoreOutputPayload) {
  const label = getStoreOutputTypeLabel(payload.outputType);
  const recipient = payload.recipientName.trim();
  const notes = payload.notes.trim();
  const reasonParts = [`[${label}]`];

  if (recipient) reasonParts.push(`Para: ${recipient}`);
  if (notes) reasonParts.push(notes);
  reasonParts.push(`Fecha: ${payload.outputDate}`);

  await adjustStoreInventory({
    productId: payload.productId,
    quantityDelta: -Math.abs(payload.quantity),
    reason: reasonParts.join(" · "),
    unitCost: payload.unitCost ?? null,
  });
}


export async function getAllStoreSales(limit = 5000) {
  const { data, error } = await supabase
    .from("store_sales")
    .select(saleSelect)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data || []) as unknown as StoreSale[];
}

export async function getAllStoreInventoryMovements(limit = 5000) {
  const { data, error } = await supabase
    .from("store_inventory_movements")
    .select(movementSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data || []) as unknown as StoreInventoryMovement[];
}

function formatExcelDate(value: string | null | undefined) {
  if (!value) return "";

  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStoreProductDisplayName(product: {
  name: string;
  variant_label: string | null;
}) {
  return product.variant_label
    ? `${product.name} · ${product.variant_label}`
    : product.name;
}

function getStoreProductStatus(product: StoreProduct) {
  if (!product.is_active) return "Inactivo";
  if (Number(product.stock || 0) <= 0) return "Agotado";
  if (Number(product.stock || 0) <= Number(product.min_stock || 0)) {
    return "Stock bajo";
  }

  return "Correcto";
}

function getSaleEstimatedProfit(sale: StoreSale) {
  const unitCost = Number(sale.store_products?.cost || 0);
  const quantity = Number(sale.quantity || 0);
  const revenue = Number(sale.total_amount || 0);

  return revenue - unitCost * quantity;
}

function getStoreSaleBuyerName(sale: StoreSale) {
  return sale.students?.full_name || sale.buyer_name || "Venta general";
}


export type StoreExcelExportOptions = {
  startDate?: string;
  endDate?: string;
};

function normalizeDateStart(value?: string) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
}

function normalizeDateEnd(value?: string) {
  if (!value) return null;
  return new Date(`${value}T23:59:59.999`);
}

function isDateInsideRange(value: string, startDate?: string, endDate?: string) {
  const date = new Date(value);
  const start = normalizeDateStart(startDate);
  const end = normalizeDateEnd(endDate);

  if (start && date < start) return false;
  if (end && date > end) return false;

  return true;
}

function formatExcelShortDate(value?: string) {
  if (!value) return "Todo el historial";

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type ExcelCellValue = string | number | boolean | Date | null | undefined;

const TXS_EXCEL_COLORS = {
  black: "FF111111",
  dark: "FF18181B",
  gold: "FFEAB308",
  goldDark: "FFB8860B",
  white: "FFFFFFFF",
  zinc: "FF71717A",
  emerald: "FF10B981",
  red: "FFEF4444",
  sky: "FF0EA5E9",
};

const moneyFormat = '"$"#,##0.00';
const integerFormat = '#,##0';

function downloadExcelBuffer(buffer: BlobPart, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function setSheetDefaults(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.properties.defaultRowHeight = 22;

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        size: 11,
        color: { argb: TXS_EXCEL_COLORS.dark },
      };

      cell.alignment = {
        vertical: "middle",
        wrapText: true,
      };
    });
  });
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 24;

  row.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.black },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TXS_EXCEL_COLORS.gold },
    };

    cell.border = {
      top: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
      left: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
      bottom: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
      right: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
    };
  });
}

function styleTitleCell(cell: ExcelJS.Cell, size = 18) {
  cell.font = {
    name: "Calibri",
    size,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.white },
  };

  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TXS_EXCEL_COLORS.black },
  };

  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
}

function applyAutoFilter(worksheet: ExcelJS.Worksheet, headerRowNumber: number, columnCount: number) {
  worksheet.autoFilter = {
    from: {
      row: headerRowNumber,
      column: 1,
    },
    to: {
      row: headerRowNumber,
      column: columnCount,
    },
  };
}

function setColumnWidths(
  worksheet: ExcelJS.Worksheet,
  widths: Record<string, number>,
) {
  Object.entries(widths).forEach(([key, width]) => {
    worksheet.getColumn(key).width = width;
  });
}

function applyTableBodyStyle(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  columnCount: number,
) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const isEven = rowNumber % 2 === 0;

    for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
      const cell = row.getCell(columnNumber);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFF8FAFC" : TXS_EXCEL_COLORS.white },
      };

      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    }
  }
}

function addKeyValueRows(
  worksheet: ExcelJS.Worksheet,
  rows: [string, ExcelCellValue, string?][],
  startRow: number,
) {
  rows.forEach(([label, value, numberFormat], index) => {
    const row = worksheet.getRow(startRow + index);

    row.getCell(1).value = label;
    row.getCell(2).value = value ?? "";

    row.getCell(1).font = {
      name: "Calibri",
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.zinc },
    };

    row.getCell(2).font = {
      name: "Calibri",
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.black },
    };

    if (numberFormat) {
      row.getCell(2).numFmt = numberFormat;
    }
  });
}

function applyCurrencyColumns(
  worksheet: ExcelJS.Worksheet,
  columnKeys: string[],
) {
  columnKeys.forEach((key) => {
    worksheet.getColumn(key).numFmt = moneyFormat;
  });
}

function applyIntegerColumns(
  worksheet: ExcelJS.Worksheet,
  columnKeys: string[],
) {
  columnKeys.forEach((key) => {
    worksheet.getColumn(key).numFmt = integerFormat;
  });
}

function addProfessionalTitle(
  worksheet: ExcelJS.Worksheet,
  title: string,
  subtitle: string,
  range = "A1:H1",
) {
  worksheet.mergeCells(range);
  const titleCell = worksheet.getCell(range.split(":")[0]);

  titleCell.value = title;
  styleTitleCell(titleCell, 18);

  const subtitleRow = Number(range.match(/\d+/)?.[0] || 1) + 1;
  worksheet.mergeCells(`A${subtitleRow}:H${subtitleRow}`);

  const subtitleCell = worksheet.getCell(`A${subtitleRow}`);
  subtitleCell.value = subtitle;
  subtitleCell.font = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.gold },
  };
  subtitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TXS_EXCEL_COLORS.dark },
  };
  subtitleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getRow(1).height = 32;
  worksheet.getRow(subtitleRow).height = 24;
}

function addNoDataMessage(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  message: string,
  columnCount: number,
) {
  worksheet.mergeCells(rowNumber, 1, rowNumber, columnCount);
  const cell = worksheet.getCell(rowNumber, 1);
  cell.value = message;
  cell.font = {
    name: "Calibri",
    italic: true,
    color: { argb: TXS_EXCEL_COLORS.zinc },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
}

function getExcelStatusColor(status: string) {
  if (status === "Agotado" || status === "Inactivo") return TXS_EXCEL_COLORS.red;
  if (status === "Stock bajo") return TXS_EXCEL_COLORS.goldDark;
  return TXS_EXCEL_COLORS.emerald;
}


function getCategoryLabelForExcel(category: StoreCategory | string) {
  if (category === "bebida") return "Bebidas";
  if (category === "vestimenta") return "Vestimenta";
  return "Otro";
}

function getMovementTypeLabel(type: StoreInventoryMovement["movement_type"] | string) {
  return getStoreOutputTypeLabel(type);
}

async function getImageBase64FromPublicPath(path: string) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("No se pudo cargar imagen para Excel:", path, error);
    return null;
  }
}

function styleMergedBlock(
  worksheet: ExcelJS.Worksheet,
  range: string,
  value: ExcelCellValue,
  options: {
    fill?: string;
    fontColor?: string;
    fontSize?: number;
    bold?: boolean;
    horizontal?: "left" | "center" | "right";
    vertical?: "top" | "middle" | "bottom";
    borderColor?: string;
  } = {},
) {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(":")[0]);
  cell.value = value ?? "";
  cell.font = {
    name: "Calibri",
    size: options.fontSize || 12,
    bold: options.bold ?? true,
    color: { argb: options.fontColor || TXS_EXCEL_COLORS.white },
  };
  cell.alignment = {
    horizontal: options.horizontal || "center",
    vertical: options.vertical || "middle",
    wrapText: true,
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: options.fill || TXS_EXCEL_COLORS.dark },
  };
  cell.border = {
    top: { style: "thin", color: { argb: options.borderColor || "FF27272A" } },
    left: { style: "thin", color: { argb: options.borderColor || "FF27272A" } },
    bottom: { style: "thin", color: { argb: options.borderColor || "FF27272A" } },
    right: { style: "thin", color: { argb: options.borderColor || "FF27272A" } },
  };
}

function addMetricCard(
  worksheet: ExcelJS.Worksheet,
  range: string,
  label: string,
  value: ExcelCellValue,
  accent = TXS_EXCEL_COLORS.gold,
  numberFormat?: string,
) {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(":")[0]);
  cell.value = `${label}\n${value ?? ""}`;
  cell.font = {
    name: "Calibri",
    size: 13,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.white },
  };
  cell.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TXS_EXCEL_COLORS.black },
  };
  cell.border = {
    top: { style: "medium", color: { argb: accent } },
    left: { style: "medium", color: { argb: accent } },
    bottom: { style: "medium", color: { argb: accent } },
    right: { style: "medium", color: { argb: accent } },
  };
  if (numberFormat) cell.numFmt = numberFormat;
}

function styleDataSheet(
  worksheet: ExcelJS.Worksheet,
  headerRow: number,
  columnCount: number,
  rowsCount: number,
) {
  styleHeaderRow(worksheet.getRow(headerRow));
  applyAutoFilter(worksheet, headerRow, columnCount);
  worksheet.views = [{ state: "frozen", ySplit: headerRow }];

  if (rowsCount > 0) {
    applyTableBodyStyle(
      worksheet,
      headerRow + 1,
      headerRow + rowsCount,
      columnCount,
    );
  }
}

export async function exportStoreExcel(options: StoreExcelExportOptions = {}) {
  const { startDate, endDate } = options;

  const [products, allSales, allMovements] = await Promise.all([
    getStoreProducts(),
    getAllStoreSales(),
    getAllStoreInventoryMovements(),
  ]);

  const sales = allSales.filter((sale) =>
    isDateInsideRange(sale.sale_date, startDate, endDate),
  );

  const movements = allMovements.filter((movement) =>
    isDateInsideRange(movement.created_at, startDate, endDate),
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const todaySales = sales.filter((sale) =>
    new Date(sale.sale_date).toISOString().startsWith(todayKey),
  );

  const monthlySales = sales.filter((sale) => {
    const saleDate = new Date(sale.sale_date);

    return (
      saleDate.getMonth() === currentMonth &&
      saleDate.getFullYear() === currentYear
    );
  });

  const sumRevenue = (items: StoreSale[]) =>
    items.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  const sumProfit = (items: StoreSale[]) =>
    items.reduce((sum, sale) => sum + getSaleEstimatedProfit(sale), 0);

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + Number(product.cost || 0) * Number(product.stock || 0),
    0,
  );

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0,
  );

  const activeProducts = products.filter((product) => product.is_active);
  const exhaustedProducts = products.filter(
    (product) => product.is_active && product.stock <= 0,
  );
  const lowStockProducts = products.filter(
    (product) =>
      product.is_active &&
      product.stock > 0 &&
      product.stock <= product.min_stock,
  );

  const soldUnits = sales.reduce(
    (sum, sale) => sum + Number(sale.quantity || 0),
    0,
  );
  const averageTicket = sales.length > 0 ? sumRevenue(sales) / sales.length : 0;

  const movementEntries = movements.filter(
    (movement) => Number(movement.quantity_delta || 0) > 0,
  );
  const movementOutputs = movements.filter(
    (movement) => Number(movement.quantity_delta || 0) < 0,
  );
  const giftOutputs = movements.filter(
    (movement) => inferStoreMovementOutputType(movement) === "gift",
  );
  const internalUseOutputs = movements.filter(
    (movement) => inferStoreMovementOutputType(movement) === "internal_use",
  );
  const wasteOutputs = movements.filter(
    (movement) => inferStoreMovementOutputType(movement) === "waste",
  );

  const rangeLabel =
    startDate || endDate
      ? `${formatExcelShortDate(startDate)} - ${formatExcelShortDate(endDate)}`
      : "Todo el historial";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Zamgel Core";
  workbook.lastModifiedBy = "Zamgel Core";
  workbook.created = new Date();
  workbook.modified = new Date();

  const txsLogoBase64 = await getImageBase64FromPublicPath(
    "/branding/logo_TSX.png",
  );
  const zcLogoBase64 = await getImageBase64FromPublicPath(
    "/branding/zamgelcore-zc-logo.png",
  );

  const addLogosToSheet = (worksheet: ExcelJS.Worksheet) => {
    if (txsLogoBase64) {
      const logoId = workbook.addImage({
        base64: txsLogoBase64,
        extension: "png",
      });

      worksheet.addImage(logoId, {
        tl: { col: 0.25, row: 0.65 },
        ext: { width: 118, height: 82 },
      });
    }

    if (zcLogoBase64) {
      const zcId = workbook.addImage({
        base64: zcLogoBase64,
        extension: "png",
      });

      worksheet.addImage(zcId, {
        tl: { col: 8.1, row: 0.6 },
        ext: { width: 126, height: 82 },
      });
    }
  };

  const summarySheet = workbook.addWorksheet("Dashboard", {
    properties: { tabColor: { argb: TXS_EXCEL_COLORS.gold } },
  });

  summarySheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  setColumnWidths(summarySheet, {
    A: 15,
    B: 16,
    C: 16,
    D: 16,
    E: 16,
    F: 16,
    G: 16,
    H: 16,
    I: 16,
    J: 16,
  });

  for (let rowNumber = 1; rowNumber <= 34; rowNumber += 1) {
    summarySheet.getRow(rowNumber).height = 24;
  }

  for (let rowNumber = 1; rowNumber <= 5; rowNumber += 1) {
    const row = summarySheet.getRow(rowNumber);

    for (let columnNumber = 1; columnNumber <= 10; columnNumber += 1) {
      const cell = row.getCell(columnNumber);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowNumber === 5 ? TXS_EXCEL_COLORS.dark : TXS_EXCEL_COLORS.black },
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FF27272A" } },
        left: { style: "thin", color: { argb: "FF27272A" } },
        bottom: { style: "thin", color: { argb: "FF27272A" } },
        right: { style: "thin", color: { argb: "FF27272A" } },
      };
    }
  }

  summarySheet.getRow(1).height = 24;
  summarySheet.getRow(2).height = 32;
  summarySheet.getRow(3).height = 32;
  summarySheet.getRow(4).height = 24;
  summarySheet.getRow(5).height = 24;
  summarySheet.getRow(6).height = 24;

  summarySheet.mergeCells("C2:H2");
  summarySheet.getCell("C2").value = "TXS HUB";
  summarySheet.getCell("C2").font = {
    name: "Calibri",
    size: 18,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.white },
  };
  summarySheet.getCell("C2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  summarySheet.mergeCells("C3:H4");
  summarySheet.getCell("C3").value = "REPORTE DE TIENDA";
  summarySheet.getCell("C3").font = {
    name: "Calibri",
    size: 18,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.white },
  };
  summarySheet.getCell("C3").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  summarySheet.mergeCells("C5:H5");
  summarySheet.getCell("C5").value = rangeLabel;
  summarySheet.getCell("C5").font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.gold },
  };
  summarySheet.getCell("C5").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  addLogosToSheet(summarySheet);

  summarySheet.mergeCells("H6:J6");
  summarySheet.getCell("H6").value = "Powered by Zamgel Core";
  summarySheet.getCell("H6").font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: TXS_EXCEL_COLORS.zinc },
  };
  summarySheet.getCell("H6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  styleMergedBlock(summarySheet, "A7:C8", "Generado", {
    fill: "FFF8FAFC",
    fontColor: TXS_EXCEL_COLORS.zinc,
    fontSize: 11,
    horizontal: "left",
    borderColor: "FFE5E7EB",
  });
  summarySheet.getCell("D7").value = formatExcelDate(new Date().toISOString());
  summarySheet.mergeCells("D7:J8");
  summarySheet.getCell("D7").font = {
    name: "Calibri",
    size: 13,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.black },
  };
  summarySheet.getCell("D7").alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  addMetricCard(summarySheet, "A10:B12", "PRODUCTOS", products.length, TXS_EXCEL_COLORS.gold);
  addMetricCard(summarySheet, "C10:D12", "ACTIVOS", activeProducts.length, TXS_EXCEL_COLORS.emerald);
  addMetricCard(summarySheet, "E10:F12", "STOCK", totalStock, TXS_EXCEL_COLORS.sky);
  addMetricCard(summarySheet, "G10:H12", "AGOTADOS", exhaustedProducts.length, TXS_EXCEL_COLORS.red);
  addMetricCard(summarySheet, "I10:J12", "VALOR INVENTARIO", `$${inventoryValue.toFixed(2)}`, TXS_EXCEL_COLORS.gold);

  addMetricCard(summarySheet, "A14:B16", "VENTAS RANGO", `$${sumRevenue(sales).toFixed(2)}`, TXS_EXCEL_COLORS.emerald);
  addMetricCard(summarySheet, "C14:D16", "GANANCIA", `$${sumProfit(sales).toFixed(2)}`, TXS_EXCEL_COLORS.emerald);
  addMetricCard(summarySheet, "E14:F16", "UNIDADES", soldUnits, TXS_EXCEL_COLORS.sky);
  addMetricCard(summarySheet, "G14:H16", "TICKET PROM.", `$${averageTicket.toFixed(2)}`, TXS_EXCEL_COLORS.gold);
  addMetricCard(summarySheet, "I14:J16", "STOCK BAJO", lowStockProducts.length, TXS_EXCEL_COLORS.goldDark);

  summarySheet.getRow(18).values = [
    "Métrica",
    "Valor",
    "",
    "Métrica",
    "Valor",
    "",
    "Métrica",
    "Valor",
  ];
  [1, 2, 4, 5, 7, 8].forEach((column) => {
    const cell = summarySheet.getRow(18).getCell(column);
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.black },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TXS_EXCEL_COLORS.gold },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
    };
  });

  const dashboardRows: [string, ExcelCellValue, string?][][] = [
    [
      ["Ventas hoy", sumRevenue(todaySales), moneyFormat],
      ["Ganancia hoy", sumProfit(todaySales), moneyFormat],
      ["Ventas mes", sumRevenue(monthlySales), moneyFormat],
      ["Ganancia mes", sumProfit(monthlySales), moneyFormat],
    ],
    [
      ["Ventas exportadas", sales.length, integerFormat],
      ["Movimientos exportados", movements.length, integerFormat],
      ["Entradas inventario", movementEntries.length, integerFormat],
      ["Salidas inventario", movementOutputs.length, integerFormat],
      ["Regalos", giftOutputs.reduce((sum, item) => sum + Math.abs(Number(item.quantity_delta || 0)), 0), integerFormat],
      ["Consumo interno", internalUseOutputs.reduce((sum, item) => sum + Math.abs(Number(item.quantity_delta || 0)), 0), integerFormat],
      ["Merma", wasteOutputs.reduce((sum, item) => sum + Math.abs(Number(item.quantity_delta || 0)), 0), integerFormat],
    ],
  ];

  let currentRow = 19;
  dashboardRows.flat().forEach(([label, value, format], index) => {
    const columnGroup = index % 3;
    const rowOffset = Math.floor(index / 3) * 2;
    const labelColumn = columnGroup * 3 + 1;
    const valueColumn = labelColumn + 1;
    const rowNumber = currentRow + rowOffset;

    summarySheet.getCell(rowNumber, labelColumn).value = label;
    summarySheet.getCell(rowNumber, valueColumn).value = value ?? "";
    summarySheet.getCell(rowNumber, labelColumn).font = {
      name: "Calibri",
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.zinc },
    };
    summarySheet.getCell(rowNumber, valueColumn).font = {
      name: "Calibri",
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.black },
    };
    if (format) summarySheet.getCell(rowNumber, valueColumn).numFmt = format;
  });

  styleMergedBlock(summarySheet, "A26:J28", "Desarrollado por Zamgel Core\nMoneda: MXN", {
    fill: "FFF8FAFC",
    fontColor: TXS_EXCEL_COLORS.zinc,
    fontSize: 11,
    borderColor: "FFE5E7EB",
  });

  summarySheet.views = [{ state: "frozen", ySplit: 5 }];

  const productsSheet = workbook.addWorksheet("Productos", {
    properties: { tabColor: { argb: TXS_EXCEL_COLORS.emerald } },
  });

  const productHeaders = [
    "Producto",
    "Variante",
    "Categoría",
    "Precio venta",
    "Costo",
    "Stock",
    "Stock mínimo",
    "Estado",
    "Activo",
    "Valor inventario",
    "Notas",
    "Creado",
    "Actualizado",
  ];

  productsSheet.addRow(productHeaders);

  products.forEach((product) => {
    const status = getStoreProductStatus(product);
    const row = productsSheet.addRow([
      product.name,
      product.variant_label || "",
      getCategoryLabelForExcel(product.category),
      Number(product.price || 0),
      Number(product.cost || 0),
      Number(product.stock || 0),
      Number(product.min_stock || 0),
      status,
      product.is_active ? "Sí" : "No",
      Number(product.cost || 0) * Number(product.stock || 0),
      product.notes || "",
      formatExcelDate(product.created_at),
      formatExcelDate(product.updated_at),
    ]);

    const statusCell = row.getCell(8);
    statusCell.font = {
      name: "Calibri",
      bold: true,
      color: { argb: getExcelStatusColor(status) },
    };
  });

  if (products.length === 0) {
    addNoDataMessage(productsSheet, 2, "No hay productos registrados.", productHeaders.length);
  }

  setColumnWidths(productsSheet, {
    A: 30,
    B: 22,
    C: 16,
    D: 15,
    E: 13,
    F: 10,
    G: 14,
    H: 16,
    I: 10,
    J: 18,
    K: 46,
    L: 22,
    M: 22,
  });
  applyCurrencyColumns(productsSheet, ["D", "E", "J"]);
  applyIntegerColumns(productsSheet, ["F", "G"]);
  styleDataSheet(productsSheet, 1, productHeaders.length, products.length);

  const salesSheet = workbook.addWorksheet("Ventas", {
    properties: { tabColor: { argb: TXS_EXCEL_COLORS.sky } },
  });

  styleMergedBlock(salesSheet, "A1:N2", "VENTAS DE TIENDA", {
    fill: TXS_EXCEL_COLORS.black,
    fontColor: TXS_EXCEL_COLORS.white,
    fontSize: 18,
  });
  styleMergedBlock(salesSheet, "A3:N3", rangeLabel, {
    fill: TXS_EXCEL_COLORS.dark,
    fontColor: TXS_EXCEL_COLORS.gold,
    fontSize: 11,
  });

  const saleHeaders = [
    "Fecha",
    "Producto",
    "Categoría",
    "Cantidad",
    "Precio unitario",
    "Total",
    "Costo unitario estimado",
    "Costo total estimado",
    "Ganancia estimada",
    "Método",
    "Comprador",
    "Correo alumno",
    "Notas",
    "Registrado",
  ];

  salesSheet.getRow(5).values = saleHeaders;

  sales.forEach((sale) => {
    const product = sale.store_products;
    const productName = product
      ? getStoreProductDisplayName(product)
      : "Producto eliminado";
    const unitCost = Number(product?.cost || 0);
    const quantity = Number(sale.quantity || 0);
    const estimatedCost = unitCost * quantity;
    const estimatedProfit = getSaleEstimatedProfit(sale);

    const row = salesSheet.addRow([
      formatExcelDate(sale.sale_date),
      productName,
      product?.category ? getCategoryLabelForExcel(product.category) : "",
      quantity,
      Number(sale.unit_price || 0),
      Number(sale.total_amount || 0),
      unitCost,
      estimatedCost,
      estimatedProfit,
      sale.payment_method,
      getStoreSaleBuyerName(sale),
      sale.students?.email || "",
      sale.notes || "",
      formatExcelDate(sale.created_at),
    ]);

    const profitCell = row.getCell(9);
    profitCell.font = {
      name: "Calibri",
      bold: true,
      color: {
        argb:
          estimatedProfit >= 0
            ? TXS_EXCEL_COLORS.emerald
            : TXS_EXCEL_COLORS.red,
      },
    };
  });

  if (sales.length === 0) {
    addNoDataMessage(salesSheet, 6, "No hay ventas en el rango seleccionado.", saleHeaders.length);
  }

  setColumnWidths(salesSheet, {
    A: 22,
    B: 30,
    C: 16,
    D: 10,
    E: 16,
    F: 14,
    G: 22,
    H: 20,
    I: 18,
    J: 16,
    K: 28,
    L: 30,
    M: 46,
    N: 22,
  });
  applyCurrencyColumns(salesSheet, ["E", "F", "G", "H", "I"]);
  applyIntegerColumns(salesSheet, ["D"]);
  styleDataSheet(salesSheet, 5, saleHeaders.length, sales.length);

  const movementsSheet = workbook.addWorksheet("Movimientos", {
    properties: { tabColor: { argb: TXS_EXCEL_COLORS.goldDark } },
  });

  styleMergedBlock(movementsSheet, "A1:I2", "MOVIMIENTOS DE INVENTARIO", {
    fill: TXS_EXCEL_COLORS.black,
    fontColor: TXS_EXCEL_COLORS.white,
    fontSize: 18,
  });
  styleMergedBlock(movementsSheet, "A3:I3", rangeLabel, {
    fill: TXS_EXCEL_COLORS.dark,
    fontColor: TXS_EXCEL_COLORS.gold,
    fontSize: 11,
  });

  const movementHeaders = [
    "Fecha",
    "Producto",
    "Tipo",
    "Cambio cantidad",
    "Stock anterior",
    "Stock nuevo",
    "Costo unitario",
    "Motivo",
    "Venta relacionada",
  ];

  movementsSheet.getRow(5).values = movementHeaders;

  movements.forEach((movement) => {
    movementsSheet.addRow([
      formatExcelDate(movement.created_at),
      movement.store_products
        ? getStoreProductDisplayName(movement.store_products)
        : "Producto eliminado",
      getMovementTypeLabel(inferStoreMovementOutputType(movement)),
      Number(movement.quantity_delta || 0),
      Number(movement.previous_stock || 0),
      Number(movement.new_stock || 0),
      movement.unit_cost ?? "",
      movement.reason || "",
      movement.sale_id || "",
    ]);
  });

  if (movements.length === 0) {
    addNoDataMessage(
      movementsSheet,
      6,
      "No hay movimientos de inventario en el rango seleccionado.",
      movementHeaders.length,
    );
  }

  setColumnWidths(movementsSheet, {
    A: 22,
    B: 30,
    C: 16,
    D: 16,
    E: 16,
    F: 14,
    G: 16,
    H: 46,
    I: 40,
  });
  applyCurrencyColumns(movementsSheet, ["G"]);
  applyIntegerColumns(movementsSheet, ["D", "E", "F"]);
  styleDataSheet(movementsSheet, 5, movementHeaders.length, movements.length);

  const filenameRange =
    startDate || endDate
      ? `${startDate || "inicio"}_${endDate || "hoy"}`
      : new Date().toISOString().slice(0, 10);

  const filename = `TXS_Tienda_${filenameRange}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();

  downloadExcelBuffer(buffer, filename);
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function getStoreData() {
  const monthRange = getMonthRange();

  const [products, recentSales, monthlySales, movements, monthlyMovements, students] =
    await Promise.all([
      getStoreProducts(),
      getRecentStoreSales(25),
      getStoreSalesByDateRange(monthRange.start, monthRange.end),
      getStoreInventoryMovements(25),
      getStoreInventoryMovementsByDateRange(monthRange.start, monthRange.end),
      getStoreBuyerStudents(),
    ]);

  return {
    products,
    recentSales,
    monthlySales,
    movements,
    monthlyMovements,
    students,
  };
}
