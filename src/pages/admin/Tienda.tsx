// 📍 Ruta del archivo: src/pages/admin/Tienda.tsx

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  AlertTriangle,
  Archive,
  Boxes,
  CalendarClock,
  CreditCard,
  DollarSign,
  Droplets,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shirt,
  ShoppingBag,
  X,
} from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  adjustStoreInventory,
  createStoreProduct,
  getStoreData,
  registerStoreSale,
  StoreBuyerStudent,
  StoreCategory,
  StoreInventoryMovement,
  StorePaymentMethod,
  StoreProduct,
  StoreSale,
  updateStoreProduct,
} from "@/src/services/storeService";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Number(value || 0));
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocal(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function getCategoryLabel(category: StoreCategory) {
  const labels: Record<StoreCategory, string> = {
    bebida: "Bebidas",
    vestimenta: "Vestimenta",
    otro: "Otro",
  };

  return labels[category] || "Otro";
}

function getProductIcon(category: StoreCategory) {
  if (category === "bebida") return Droplets;
  if (category === "vestimenta") return Shirt;
  return ShoppingBag;
}

function getProductDisplayName(product: StoreProduct) {
  return product.variant_label
    ? `${product.name} · ${product.variant_label}`
    : product.name;
}

type ProductForm = {
  name: string;
  category: StoreCategory;
  variantLabel: string;
  price: string;
  cost: string;
  stock: string;
  minStock: string;
  notes: string;
};

type SaleForm = {
  productId: string;
  quantity: string;
  studentId: string;
  buyerName: string;
  paymentMethod: StorePaymentMethod;
  saleDate: string;
  notes: string;
};

type InventoryForm = {
  productId: string;
  mode: "add" | "remove" | "set";
  quantity: string;
  unitCost: string;
  reason: string;
};

const emptyProductForm: ProductForm = {
  name: "",
  category: "bebida",
  variantLabel: "",
  price: "0",
  cost: "0",
  stock: "0",
  minStock: "0",
  notes: "",
};

function createSaleForm(productId = ""): SaleForm {
  return {
    productId,
    quantity: "1",
    studentId: "",
    buyerName: "",
    paymentMethod: "efectivo",
    saleDate: toDateTimeLocal(),
    notes: "",
  };
}

function createInventoryForm(productId = ""): InventoryForm {
  return {
    productId,
    mode: "add",
    quantity: "1",
    unitCost: "",
    reason: "Entrada de inventario",
  };
}

export function Tienda() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [recentSales, setRecentSales] = useState<StoreSale[]>([]);
  const [movements, setMovements] = useState<StoreInventoryMovement[]>([]);
  const [students, setStudents] = useState<StoreBuyerStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | StoreCategory>("all");

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState<SaleForm>(createSaleForm());

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState<InventoryForm>(createInventoryForm());

  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const searchable = `${product.name} ${product.variant_label || ""} ${product.notes || ""}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, products, search]);

  const stats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const monthKey = new Date().toISOString().slice(0, 7);

    const todaySales = recentSales.filter((sale) =>
      new Date(sale.sale_date).toISOString().startsWith(todayKey),
    );

    const monthSales = recentSales.filter((sale) =>
      new Date(sale.sale_date).toISOString().startsWith(monthKey),
    );

    return {
      products: products.length,
      activeProducts: activeProducts.length,
      totalStock: products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
      lowStock: products.filter(
        (product) => product.is_active && product.stock <= product.min_stock,
      ).length,
      todayRevenue: todaySales.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0,
      ),
      monthRevenue: monthSales.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0,
      ),
    };
  }, [activeProducts.length, products, recentSales]);

  const selectedSaleProduct = useMemo(
    () => products.find((product) => product.id === saleForm.productId) || null,
    [products, saleForm.productId],
  );

  const selectedInventoryProduct = useMemo(
    () => products.find((product) => product.id === inventoryForm.productId) || null,
    [inventoryForm.productId, products],
  );

  useEffect(() => {
    loadStore();
  }, []);

  async function loadStore() {
    try {
      setLoading(true);
      const data = await getStoreData();
      setProducts(data.products);
      setRecentSales(data.recentSales);
      setMovements(data.movements);
      setStudents(data.students);
    } catch (error) {
      console.error("Error cargando tienda:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la tienda.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateProductModal() {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setShowProductModal(true);
  }

  function openEditProductModal(product: StoreProduct) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      variantLabel: product.variant_label || "",
      price: String(product.price),
      cost: String(product.cost),
      stock: String(product.stock),
      minStock: String(product.min_stock),
      notes: product.notes || "",
    });
    setShowProductModal(true);
  }

  function openSaleModal(product?: StoreProduct) {
    setSaleForm(createSaleForm(product?.id || ""));
    setShowSaleModal(true);
  }

  function openInventoryModal(product?: StoreProduct) {
    setInventoryForm(createInventoryForm(product?.id || ""));
    setShowInventoryModal(true);
  }

  async function handleSaveProduct() {
    const name = productForm.name.trim();
    const price = Number(productForm.price || 0);
    const cost = Number(productForm.cost || 0);
    const stock = Number(productForm.stock || 0);
    const minStock = Number(productForm.minStock || 0);

    if (!name) {
      alert("Escribe el nombre del producto.");
      return;
    }

    if (price < 0 || cost < 0 || stock < 0 || minStock < 0) {
      alert("Los valores no pueden ser negativos.");
      return;
    }

    try {
      setSaving(true);

      if (editingProduct) {
        await updateStoreProduct(editingProduct.id, {
          name,
          category: productForm.category,
          variantLabel: productForm.variantLabel,
          price,
          cost,
          stock,
          minStock,
          notes: productForm.notes,
        });
      } else {
        await createStoreProduct({
          name,
          category: productForm.category,
          variantLabel: productForm.variantLabel,
          price,
          cost,
          stock,
          minStock,
          notes: productForm.notes,
        });
      }

      setShowProductModal(false);
      await loadStore();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRegisterSale() {
    const quantity = Number(saleForm.quantity || 0);

    if (!saleForm.productId) {
      alert("Selecciona un producto.");
      return;
    }

    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    if (!saleForm.studentId && !saleForm.buyerName.trim()) {
      alert("Selecciona un alumno o escribe el nombre del comprador.");
      return;
    }

    try {
      setSaving(true);

      await registerStoreSale({
        productId: saleForm.productId,
        quantity,
        studentId: saleForm.studentId || null,
        buyerName: saleForm.buyerName,
        paymentMethod: saleForm.paymentMethod,
        saleDate: new Date(saleForm.saleDate).toISOString(),
        notes: saleForm.notes,
      });

      setShowSaleModal(false);
      await loadStore();
    } catch (error) {
      console.error("Error registrando venta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la venta.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAdjustInventory() {
    const product = selectedInventoryProduct;
    const quantity = Number(inventoryForm.quantity || 0);

    if (!product) {
      alert("Selecciona un producto.");
      return;
    }

    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    let delta = quantity;

    if (inventoryForm.mode === "remove") {
      delta = -quantity;
    }

    if (inventoryForm.mode === "set") {
      delta = quantity - product.stock;
    }

    if (delta === 0) {
      alert("El inventario ya tiene esa cantidad.");
      return;
    }

    try {
      setSaving(true);

      await adjustStoreInventory({
        productId: product.id,
        quantityDelta: delta,
        reason: inventoryForm.reason,
        unitCost:
          inventoryForm.unitCost.trim() === ""
            ? null
            : Number(inventoryForm.unitCost),
      });

      setShowInventoryModal(false);
      await loadStore();
    } catch (error) {
      console.error("Error ajustando inventario:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo ajustar el inventario.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleProduct(product: StoreProduct) {
    try {
      await updateStoreProduct(product.id, {
        isActive: !product.is_active,
      });
      await loadStore();
    } catch (error) {
      console.error("Error cambiando estado del producto:", error);
      alert("No se pudo cambiar el estado del producto.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
              <ShoppingBag className="h-3.5 w-3.5" />
              Tienda TXS
            </div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Tienda
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Control básico de productos, inventario y ventas internas de TXS.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="gap-2" onClick={loadStore}>
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => openInventoryModal()}>
              <Boxes className="h-4 w-4" />
              Inventario
            </Button>
            <Button variant="gold" className="gap-2" onClick={() => openSaleModal()}>
              <Plus className="h-4 w-4" />
              Registrar venta
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <StatCard label="Productos" value={stats.products} icon={ShoppingBag} />
          <StatCard label="Activos" value={stats.activeProducts} icon={Archive} tone="emerald" />
          <StatCard label="Stock total" value={stats.totalStock} icon={Boxes} />
          <StatCard label="Stock bajo" value={stats.lowStock} icon={AlertTriangle} tone={stats.lowStock > 0 ? "red" : "emerald"} />
          <StatCard label="Ventas hoy" value={formatCurrency(stats.todayRevenue)} icon={DollarSign} tone="yellow" />
          <StatCard label="Ventas mes" value={formatCurrency(stats.monthRevenue)} icon={CreditCard} tone="sky" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Productos</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Precios en MXN. El stock se descuenta automáticamente al vender.
                </p>
              </div>

              <Button variant="outline" className="gap-2" onClick={openCreateProductModal}>
                <PackagePlus className="h-4 w-4" />
                Agregar producto
              </Button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar producto, color, talla o nota..."
                  className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-white outline-none focus:border-yellow-500/50"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as "all" | StoreCategory)}
                className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/50"
              >
                <option value="all">Todas las categorías</option>
                <option value="bebida">Bebidas</option>
                <option value="vestimenta">Vestimenta</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-8 text-center text-zinc-500">
                No hay productos con ese filtro.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredProducts.map((product) => {
                  const Icon = getProductIcon(product.category);
                  const lowStock = product.stock <= product.min_stock;

                  return (
                    <div
                      key={product.id}
                      className={`rounded-2xl border bg-zinc-950/60 p-4 transition ${
                        product.is_active
                          ? lowStock
                            ? "border-red-500/30"
                            : "border-zinc-800 hover:border-yellow-500/30"
                          : "border-zinc-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-bold text-white">
                              {product.name}
                            </p>
                            {product.variant_label && (
                              <p className="mt-1 text-xs text-zinc-500">
                                {product.variant_label}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-zinc-500">
                              {getCategoryLabel(product.category)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-black text-yellow-400">
                            {formatCurrency(product.price)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Costo {formatCurrency(product.cost)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <MiniMetric label="Stock" value={product.stock} />
                        <MiniMetric label="Mínimo" value={product.min_stock} />
                        <MiniMetric
                          label="Estado"
                          value={product.is_active ? "Activo" : "Inactivo"}
                          tone={product.is_active ? "emerald" : "red"}
                        />
                      </div>

                      {lowStock && product.is_active && (
                        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                          Stock bajo. Considera reponer inventario.
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => openSaleModal(product)}
                          disabled={!product.is_active || product.stock <= 0}
                        >
                          Vender
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openInventoryModal(product)}>
                          Inventario
                        </Button>
                        <Button size="sm" variant="default" onClick={() => openEditProductModal(product)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleProduct(product)}>
                          {product.is_active ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Últimas ventas</h2>
              </div>

              <div className="space-y-3">
                {recentSales.slice(0, 8).map((sale) => (
                  <div key={sale.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {sale.store_products?.name || "Producto"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {sale.quantity} pza(s) · {sale.payment_method}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {sale.students?.full_name || sale.buyer_name || "Comprador sin nombre"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {formatDateTime(sale.sale_date)}
                        </p>
                      </div>
                      <span className="font-black text-emerald-400">
                        {formatCurrency(sale.total_amount)}
                      </span>
                    </div>
                  </div>
                ))}

                {recentSales.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-5 text-center text-zinc-500">
                    Todavía no hay ventas registradas.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <Boxes className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Movimientos</h2>
              </div>

              <div className="space-y-3">
                {movements.slice(0, 8).map((movement) => (
                  <div key={movement.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {movement.store_products?.name || "Producto"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {movement.reason || movement.movement_type}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {formatDateTime(movement.created_at)}
                        </p>
                      </div>
                      <span className={`font-black ${movement.quantity_delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {movement.quantity_delta > 0 ? "+" : ""}
                        {movement.quantity_delta}
                      </span>
                    </div>
                  </div>
                ))}

                {movements.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-5 text-center text-zinc-500">
                    Todavía no hay movimientos de inventario.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSaleModal && (
        <Modal title="Registrar venta" onClose={() => setShowSaleModal(false)}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Producto</span>
              <select
                value={saleForm.productId}
                onChange={(event) => setSaleForm((current) => ({ ...current, productId: event.target.value }))}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/50"
              >
                <option value="">Selecciona producto...</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {getProductDisplayName(product)} · {formatCurrency(product.price)} · Stock {product.stock}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Cantidad"
                type="number"
                min="1"
                value={saleForm.quantity}
                onChange={(value) => setSaleForm((current) => ({ ...current, quantity: value }))}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Método</span>
                <select
                  value={saleForm.paymentMethod}
                  onChange={(event) => setSaleForm((current) => ({ ...current, paymentMethod: event.target.value as StorePaymentMethod }))}
                  className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/50"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Alumno / comprador</span>
              <select
                value={saleForm.studentId}
                onChange={(event) => {
                  const studentId = event.target.value;
                  const student = students.find((item) => item.id === studentId);
                  setSaleForm((current) => ({
                    ...current,
                    studentId,
                    buyerName: student?.full_name || current.buyerName,
                  }));
                }}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/50"
              >
                <option value="">Venta general / escribir nombre manual</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </label>

            <TextInput
              label="Nombre del comprador"
              value={saleForm.buyerName}
              onChange={(value) => setSaleForm((current) => ({ ...current, buyerName: value }))}
              placeholder="Ej. Abigail Ambriz"
            />

            <TextInput
              label="Fecha y hora"
              type="datetime-local"
              value={saleForm.saleDate}
              onChange={(value) => setSaleForm((current) => ({ ...current, saleDate: value }))}
            />

            {selectedSaleProduct && (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-yellow-400">Resumen</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">
                    {getProductDisplayName(selectedSaleProduct)} x {Number(saleForm.quantity || 0)}
                  </span>
                  <span className="text-xl font-black text-yellow-400">
                    {formatCurrency(selectedSaleProduct.price * Number(saleForm.quantity || 0))}
                  </span>
                </div>
              </div>
            )}

            <TextArea
              label="Notas"
              value={saleForm.notes}
              onChange={(value) => setSaleForm((current) => ({ ...current, notes: value }))}
              placeholder="Ej. Color negro talla M, transferencia, comentario interno..."
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowSaleModal(false)} disabled={saving}>Cancelar</Button>
              <Button variant="gold" onClick={handleRegisterSale} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Registrar venta
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showInventoryModal && (
        <Modal title="Ajustar inventario" onClose={() => setShowInventoryModal(false)}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Producto</span>
              <select
                value={inventoryForm.productId}
                onChange={(event) => setInventoryForm((current) => ({ ...current, productId: event.target.value }))}
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/50"
              >
                <option value="">Selecciona producto...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {getProductDisplayName(product)} · Stock {product.stock}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {([
                ["add", "Agregar"],
                ["remove", "Quitar"],
                ["set", "Fijar total"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInventoryForm((current) => ({ ...current, mode }))}
                  className={`rounded-2xl border p-3 text-sm font-semibold transition ${
                    inventoryForm.mode === mode
                      ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label={inventoryForm.mode === "set" ? "Nuevo stock total" : "Cantidad"}
                type="number"
                min="1"
                value={inventoryForm.quantity}
                onChange={(value) => setInventoryForm((current) => ({ ...current, quantity: value }))}
              />
              <TextInput
                label="Costo unitario opcional"
                type="number"
                min="0"
                value={inventoryForm.unitCost}
                onChange={(value) => setInventoryForm((current) => ({ ...current, unitCost: value }))}
                placeholder="Ej. 12"
              />
            </div>

            {selectedInventoryProduct && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
                Stock actual de <span className="font-semibold text-white">{getProductDisplayName(selectedInventoryProduct)}</span>: {" "}
                <span className="font-black text-yellow-400">{selectedInventoryProduct.stock}</span>
              </div>
            )}

            <TextArea
              label="Motivo"
              value={inventoryForm.reason}
              onChange={(value) => setInventoryForm((current) => ({ ...current, reason: value }))}
              placeholder="Ej. Compra de inventario, corrección, merma, devolución..."
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowInventoryModal(false)} disabled={saving}>Cancelar</Button>
              <Button variant="gold" onClick={handleAdjustInventory} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar inventario
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showProductModal && (
        <Modal title={editingProduct ? "Editar producto" : "Agregar producto"} onClose={() => setShowProductModal(false)}>
          <div className="space-y-4">
            <TextInput
              label="Nombre"
              value={productForm.name}
              onChange={(value) => setProductForm((current) => ({ ...current, name: value }))}
              placeholder="Ej. Playera tipo polo"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Categoría</span>
                <select
                  value={productForm.category}
                  onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value as StoreCategory }))}
                  className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none focus:border-yellow-500/50"
                >
                  <option value="bebida">Bebida</option>
                  <option value="vestimenta">Vestimenta</option>
                  <option value="otro">Otro</option>
                </select>
              </label>

              <TextInput
                label="Color / talla / variante"
                value={productForm.variantLabel}
                onChange={(value) => setProductForm((current) => ({ ...current, variantLabel: value }))}
                placeholder="Ej. Negra M"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Precio venta" type="number" min="0" value={productForm.price} onChange={(value) => setProductForm((current) => ({ ...current, price: value }))} />
              <TextInput label="Costo" type="number" min="0" value={productForm.cost} onChange={(value) => setProductForm((current) => ({ ...current, cost: value }))} />
              <TextInput label="Stock actual" type="number" min="0" value={productForm.stock} onChange={(value) => setProductForm((current) => ({ ...current, stock: value }))} />
              <TextInput label="Stock mínimo" type="number" min="0" value={productForm.minStock} onChange={(value) => setProductForm((current) => ({ ...current, minStock: value }))} />
            </div>

            <TextArea
              label="Notas"
              value={productForm.notes}
              onChange={(value) => setProductForm((current) => ({ ...current, notes: value }))}
              placeholder="Ej. Colores disponibles, proveedor, observaciones..."
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowProductModal(false)} disabled={saving}>Cancelar</Button>
              <Button variant="gold" onClick={handleSaveProduct} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar producto
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "zinc",
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone?: "zinc" | "yellow" | "emerald" | "red" | "sky";
}) {
  const toneClasses = {
    zinc: "border-zinc-800 bg-zinc-950/60 text-white",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    red: "border-red-500/20 bg-red-500/10 text-red-400",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  }[tone];

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses}`}>
      <div className="mb-2 flex items-center gap-2 text-zinc-500">
        <Icon className="h-4 w-4" />
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string | number;
  tone?: "zinc" | "emerald" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-400"
      : tone === "red"
        ? "text-red-400"
        : "text-white";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <p className={`mt-1 font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 p-5 backdrop-blur">
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500/50"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500/50"
      />
    </label>
  );
}
