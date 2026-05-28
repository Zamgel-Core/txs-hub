// 📍 Ruta del archivo: src/pages/admin/Configuracion.tsx

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Save,
  Share2,
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

export function Configuracion() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      setSettings(data);
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
            Administra datos generales, precios, contacto y branding base de
            TXS.
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
                Branding base
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Color principal: {settings.primary_color || "#D4AF37"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-400" />
              Precios de membresía
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Semanal</label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={settings.weekly_price || 0}
                onChange={(event) =>
                  updateField("weekly_price", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Quincenal</label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={settings.biweekly_price || 0}
                onChange={(event) =>
                  updateField("biweekly_price", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Mensual</label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={settings.monthly_price || 0}
                onChange={(event) =>
                  updateField("monthly_price", Number(event.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-yellow-400" />
            Branding
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
              onChange={(event) => updateField("logo_url", event.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
