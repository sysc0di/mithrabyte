"use client";
import { useEffect, useState } from "react";
import { Loader2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api, apiPatch } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";
import { LoadingRows } from "@/components/admin/blocks";
import { cn } from "@/lib/utils";

export default function SettingsManager() {
  const { push } = useToast();
  const [settings, setSettings] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setBusy(true);
    try {
      const data = await api("/api/admin/settings");
      setSettings(data.items);
    } catch (err) {
      push({ type: "error", title: "Ayarlar yüklenemedi", description: err.message });
      setSettings([]);
    } finally {
      setBusy(false);
    }
  }

  function renderValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  }

  function isStructured(value) {
    return value !== null && typeof value === "object";
  }

  function dirtyKey(setting, locale) {
    return `${setting.key}::${locale}`;
  }

  async function saveDrafts() {
    const values = [];
    for (const [key, draft] of Object.entries(drafts)) {
      const [settingKey, locale] = key.split("::");
      const setting = settings.find((s) => s.key === settingKey);
      if (!setting) continue;

      const original = setting.values?.[locale];
      let parsed = draft;
      if (isStructured(original)) {
        try {
          parsed = JSON.parse(draft);
        } catch {
          push({
            type: "error",
            title: "Geçersiz JSON",
            description: `${settingKey} · ${locale}: geçerli bir JSON girin.`,
          });
          return;
        }
      }
      values.push({ key: settingKey, locale, value: parsed });
    }
    if (values.length === 0) {
      push({ type: "info", title: "Değişiklik yok", description: "Kaydedilecek bir değişiklik bulunmadı." });
      return;
    }

    setBusy(true);
    try {
      const updated = await apiPatch("/api/admin/settings", { values });
      push({ type: "success", title: `${updated.length} ayar güncellendi` });
      setDrafts({});
      load();
    } catch (err) {
      push({ type: "error", title: "Ayar kaydedilemedi", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (settings === null) return <LoadingRows />;

  return (
    <div className="grid gap-4">
      {settings.map((setting) => {
        const localesOf = Object.keys(setting.values || {});
        const protectedSetting = setting.isProtected;
        return (
          <Card key={setting.id} className={cn("gap-3 p-4", protectedSetting && "opacity-70")}>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-semibold">{setting.key}</h2>
              {protectedSetting && (
                <Badge variant="outline" className="text-[10px]">
                  <Lock className="size-3" /> Korumalı
                </Badge>
              )}
            </div>
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}

            {localesOf.length === 0 ? (
              <p className="text-xs text-muted-foreground">Değer tanımlanmamış.</p>
            ) : (
              <div className="grid gap-3">
                {localesOf.map((locale) => {
                  const original = setting.values[locale];
                  const draftKey = dirtyKey(setting, locale);
                  const draft = Object.prototype.hasOwnProperty.call(drafts, draftKey)
                    ? drafts[draftKey]
                    : renderValue(original);
                  const dirty = Object.prototype.hasOwnProperty.call(drafts, draftKey);
                  return (
                    <div key={locale} className="grid gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {locale === "*" ? "Tüm diller" : locale === "tr" ? "Türkçe" : "English"}
                      </Label>
                      <Textarea
                        rows={isStructured(original) ? 4 : 1}
                        disabled={protectedSetting}
                        className={cn("font-mono text-xs", dirty && "border-primary/60")}
                        value={draft}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [draftKey]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      <div className="sticky bottom-3 flex justify-end">
        <Button onClick={saveDrafts} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
}