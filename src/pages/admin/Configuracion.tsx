// 📍 Ruta: src/pages/admin/Configuracion.tsx

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  Loader2,
  Mail,
  Plus,
  Save,
  Share2,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";

import {
  getSystemSettings,
  SystemSettings,
  updateSystemSettings,
} from "@/src/services/settingsService";

import {
  createMembershipPlan,
  createPlanSlug,
  deleteMembershipPlan,
  formatPlanDuration,
  formatClassesPerDay,
  getMembershipPlans,
  MembershipDurationUnit,
  MembershipPlan,
  updateMembershipPlan,
} from "@/src/services/membershipPlansService";

import {
  getTXSLevels,
  getTXSPointRules,
  updateTXSLevel,
  updateTXSPointRule,
  TXSLevel,
  TXSPointRule,
} from "@/src/services/txsConfigService";

const emptyPlanForm = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  duration_count: "1",
  duration_unit: "months" as MembershipDurationUnit,
  classes_per_day: "1",
  is_active: true,
  sort_order: "100",
};

export function Configuracion() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [planForm, setPlanForm] = useState(emptyPlanForm);

  const [txsLevels, setTXSLevels] = useState<TXSLevel[]>([]);
  const [txsPointRules, setTXSPointRules] = useState<TXSPointRule[]>([]);
  const [savingTXS, setSavingTXS] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const [settingsData, plansData, levelsData, rulesData] =
        await Promise.all([
          getSystemSettings(),
          getMembershipPlans(true),
          getTXSLevels(),
          getTXSPointRules(),
        ]);

      setSettings(settingsData);
      setPlans(plansData);
      setTXSLevels(levelsData);
      setTXSPointRules(rulesData);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la configuración.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    try {
      setSaving(true);
      await updateSystemSettings(settings.id, settings);
      alert("Configuración guardada correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTXS() {
    try {
      setSavingTXS(true);

      await Promise.all([
        ...txsLevels.map((level) =>
          updateTXSLevel(level.id, {
            min_points: level.min_points,
            max_points: level.max_points,
            name: level.name,
            badge_label: level.badge_label,
          }),
        ),

        ...txsPointRules.map((rule) =>
          updateTXSPointRule(rule.id, {
            points: rule.points,
          }),
        ),
      ]);

      alert("Configuración TXS guardada correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la configuración TXS.");
    } finally {
      setSavingTXS(false);
    }
  }

  async function handleCreatePlan() {
    const name = planForm.name.trim();
    const price = Number(planForm.price);
    const durationCount = Number(planForm.duration_count);
    const sortOrder = Number(planForm.sort_order || 0);
    const classesPerDay = Number(planForm.classes_per_day || 1);

    if (!name) {
      alert("Escribe el nombre del plan.");
      return;
    }

    if (!price || price < 0) {
      alert("Ingresa un precio válido.");
      return;
    }

    if (!durationCount || durationCount <= 0) {
      alert("Ingresa una duración válida.");
      return;
    }

    if (!classesPerDay || classesPerDay <= 0) {
      alert("Ingresa una cantidad válida de clases por día.");
      return;
    }

    try {
      setSavingPlan(true);

      await createMembershipPlan({
        name,
        slug: planForm.slug.trim() || createPlanSlug(name),
        description: planForm.description.trim() || null,
        price,
        duration_count: durationCount,
        duration_unit: planForm.duration_unit,
        classes_per_day: classesPerDay,
        is_active: planForm.is_active,
        sort_order: Number.isNaN(sortOrder) ? 100 : sortOrder,
      });

      setPlanForm(emptyPlanForm);
      await loadSettings();

      alert("Plan creado correctamente.");
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo crear el plan. Revisa que el nombre/slug no esté duplicado.",
      );
    } finally {
      setSavingPlan(false);
    }
  }

  async function handleUpdatePlan(
    plan: MembershipPlan,
    values: Partial<MembershipPlan>,
  ) {
    try {
      await updateMembershipPlan(plan.id, {
        name: values.name ?? plan.name,
        slug: values.slug ?? plan.slug,
        description: values.description ?? plan.description,
        price: Number(values.price ?? plan.price),
        duration_count: Number(values.duration_count ?? plan.duration_count),
        duration_unit: (values.duration_unit ??
          plan.duration_unit) as MembershipDurationUnit,
        classes_per_day: Number(
          values.classes_per_day ?? plan.classes_per_day ?? 1,
        ),
        is_active: Boolean(values.is_active ?? plan.is_active),
        sort_order: Number(values.sort_order ?? plan.sort_order),
      });

      await loadSettings();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el plan.");
    }
  }

  async function handleDeletePlan(plan: MembershipPlan) {
    const confirmed = window.confirm(
      `¿Eliminar el plan "${plan.name}"?\n\nSi ya existen alumnos con este plan, es mejor desactivarlo en lugar de eliminarlo.`,
    );

    if (!confirmed) return;

    try {
      await deleteMembershipPlan(plan.id);
      await loadSettings();
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo eliminar. Si el plan ya se usó en pagos, mejor déjalo inactivo.",
      );
    }
  }

  function updateField<K extends keyof SystemSettings>(
    field: K,
    value: SystemSettings[K],
  ) {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Configuración
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Administra datos generales, planes, precios, contacto y branding
            base de TXS.
          </p>
        </div>

        <Button
          variant="gold"
          className="gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-yellow-400" />
              Información General
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Nombre de la academia
                </label>

                <Input
                  value={settings.academy_name || ""}
                  onChange={(event) =>
                    updateField("academy_name", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Instructor principal
                </label>

                <Input
                  value={settings.instructor_name || ""}
                  onChange={(event) =>
                    updateField("instructor_name", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Frase principal</label>

              <Input
                value={settings.academy_slogan || ""}
                onChange={(event) =>
                  updateField("academy_slogan", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Dirección</label>

              <Input
                value={settings.academy_address || ""}
                onChange={(event) =>
                  updateField("academy_address", event.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-yellow-400" />
              Estado del sistema
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-300">
                Sistema activo
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Configuración conectada a Supabase.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm font-semibold text-yellow-300">
                Planes dinámicos
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {plans.filter((plan) => plan.is_active).length} plan(es)
                activos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-yellow-400" />
            Planes y precios editables
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm font-semibold text-yellow-200">
              Estos planes alimentan el módulo de Pagos y pueden representar 1
              clase o doble clase por día.
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Si un plan ya fue usado, lo ideal es desactivarlo en vez de
              eliminarlo para conservar historial limpio.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.7fr_0.6fr_0.7fr_0.7fr_0.5fr]">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Nombre del plan</label>
              <Input
                value={planForm.name}
                onChange={(event) =>
                  setPlanForm({
                    ...planForm,
                    name: event.target.value,
                    slug: createPlanSlug(event.target.value),
                  })
                }
                placeholder="Ej. Mensual Premium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Precio</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={planForm.price}
                onChange={(event) =>
                  setPlanForm({ ...planForm, price: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Duración</label>
              <Input
                type="number"
                min="1"
                value={planForm.duration_count}
                onChange={(event) =>
                  setPlanForm({
                    ...planForm,
                    duration_count: event.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Unidad</label>
              <select
                value={planForm.duration_unit}
                onChange={(event) =>
                  setPlanForm({
                    ...planForm,
                    duration_unit: event.target.value as MembershipDurationUnit,
                  })
                }
                className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-yellow-500/50"
              >
                <option value="days">Días</option>
                <option value="weeks">Semanas</option>
                <option value="months">Meses</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Clases/día</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={planForm.classes_per_day}
                onChange={(event) =>
                  setPlanForm({
                    ...planForm,
                    classes_per_day: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="gold"
                className="w-full gap-2"
                onClick={handleCreatePlan}
                disabled={savingPlan}
              >
                {savingPlan ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Agregar
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 text-center text-zinc-400">
                Aún no hay planes creados.
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 xl:grid-cols-[1.1fr_0.65fr_0.65fr_0.75fr_0.65fr_0.6fr_0.5fr]"
                >
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Nombre</label>
                    <Input
                      value={plan.name}
                      onChange={(event) =>
                        setPlans((current) =>
                          current.map((item) =>
                            item.id === plan.id
                              ? {
                                  ...item,
                                  name: event.target.value,
                                  slug: createPlanSlug(event.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                      onBlur={(event) =>
                        handleUpdatePlan(plan, {
                          ...plan,
                          name: event.target.value,
                          slug: createPlanSlug(event.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-zinc-600">Slug: {plan.slug}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Precio</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={plan.price}
                      onChange={(event) =>
                        setPlans((current) =>
                          current.map((item) =>
                            item.id === plan.id
                              ? { ...item, price: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      onBlur={(event) =>
                        handleUpdatePlan(plan, {
                          ...plan,
                          price: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Duración</label>
                    <Input
                      type="number"
                      min="1"
                      value={plan.duration_count}
                      onChange={(event) =>
                        setPlans((current) =>
                          current.map((item) =>
                            item.id === plan.id
                              ? {
                                  ...item,
                                  duration_count: Number(event.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                      onBlur={(event) =>
                        handleUpdatePlan(plan, {
                          ...plan,
                          duration_count: Number(event.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-zinc-600">
                      {formatPlanDuration(plan)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Unidad</label>
                    <select
                      value={plan.duration_unit}
                      onChange={(event) => {
                        const durationUnit = event.target
                          .value as MembershipDurationUnit;

                        setPlans((current) =>
                          current.map((item) =>
                            item.id === plan.id
                              ? { ...item, duration_unit: durationUnit }
                              : item,
                          ),
                        );

                        handleUpdatePlan(plan, {
                          ...plan,
                          duration_unit: durationUnit,
                        });
                      }}
                      className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-white outline-none focus:border-yellow-500/50"
                    >
                      <option value="days">Días</option>
                      <option value="weeks">Semanas</option>
                      <option value="months">Meses</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Clases/día</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={plan.classes_per_day || 1}
                      onChange={(event) =>
                        setPlans((current) =>
                          current.map((item) =>
                            item.id === plan.id
                              ? {
                                  ...item,
                                  classes_per_day: Number(event.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                      onBlur={(event) =>
                        handleUpdatePlan(plan, {
                          ...plan,
                          classes_per_day: Number(event.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-zinc-600">
                      {formatClassesPerDay(plan.classes_per_day)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Estado</label>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePlan(plan, {
                          ...plan,
                          is_active: !plan.is_active,
                        })
                      }
                      className={`h-12 w-full rounded-lg border px-4 text-sm font-bold transition ${
                        plan.is_active
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      {plan.is_active ? "Activo" : "Inactivo"}
                    </button>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => handleDeletePlan(plan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-yellow-400" />
              Contacto y redes
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">WhatsApp</label>

                <Input
                  value={settings.whatsapp_number || ""}
                  onChange={(event) =>
                    updateField("whatsapp_number", event.target.value)
                  }
                  placeholder="+52..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Correo</label>

                <Input
                  value={settings.contact_email || ""}
                  onChange={(event) =>
                    updateField("contact_email", event.target.value)
                  }
                  placeholder="contacto@txs.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Facebook</label>

                <Input
                  value={settings.facebook_url || ""}
                  onChange={(event) =>
                    updateField("facebook_url", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Instagram</label>

                <Input
                  value={settings.instagram_url || ""}
                  onChange={(event) =>
                    updateField("instagram_url", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">TikTok</label>

                <Input
                  value={settings.tiktok_url || ""}
                  onChange={(event) =>
                    updateField("tiktok_url", event.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-yellow-400" />
              Branding
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Color principal</label>

              <Input
                value={settings.primary_color || "#D4AF37"}
                onChange={(event) =>
                  updateField("primary_color", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Logo URL</label>

              <Input
                value={settings.logo_url || ""}
                onChange={(event) =>
                  updateField("logo_url", event.target.value)
                }
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              🏆 Configuración TXS
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">
                Niveles TXS
              </h3>

              <div className="space-y-3">
                {txsLevels.map((level) => (
                  <div
                    key={level.id}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 p-4 md:grid-cols-4"
                  >
                    <Input
                      value={level.name}
                      onChange={(e) =>
                        setTXSLevels((prev) =>
                          prev.map((item) =>
                            item.id === level.id
                              ? { ...item, name: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />

                    <Input
                      type="number"
                      value={level.min_points}
                      onChange={(e) =>
                        setTXSLevels((prev) =>
                          prev.map((item) =>
                            item.id === level.id
                              ? {
                                  ...item,
                                  min_points: Number(e.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />

                    <Input
                      type="number"
                      value={level.max_points ?? ""}
                      onChange={(e) =>
                        setTXSLevels((prev) =>
                          prev.map((item) =>
                            item.id === level.id
                              ? {
                                  ...item,
                                  max_points:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />

                    <Input
                      value={level.badge_label ?? ""}
                      onChange={(e) =>
                        setTXSLevels((prev) =>
                          prev.map((item) =>
                            item.id === level.id
                              ? {
                                  ...item,
                                  badge_label: e.target.value,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">
                Reglas de puntos TXS
              </h3>

              <div className="space-y-3">
                {txsPointRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{rule.label}</p>

                      <p className="text-xs text-zinc-500">
                        {rule.description}
                      </p>
                    </div>

                    <Input
                      type="number"
                      className="w-28"
                      value={rule.points}
                      onChange={(e) =>
                        setTXSPointRules((prev) =>
                          prev.map((item) =>
                            item.id === rule.id
                              ? {
                                  ...item,
                                  points: Number(e.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveTXS}
              disabled={savingTXS}
              className="w-full"
            >
              {savingTXS ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar configuración TXS
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
