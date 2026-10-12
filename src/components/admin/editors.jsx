"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const LOCALES = ["tr", "en"];

const localeLabel = (locale) => locale === "tr" ? "Türkçe" : "English";

function makeLocalePatch(value, locale, patch) {
  return {
    ...value,
    [locale]: { ...((value && value[locale]) || {}), ...patch },
  };
}

/** Multi-locale field editor keyed by locale (tr/en). */
export function LocalizedFieldset({ value, onChange, fields, legend = "İçerik", className }) {
  const [tab, setTab] = useState("tr");

  return (
    <div className={cn("grid gap-2", className)}>
      <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {legend}
      </legend>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l}>
              {localeLabel(l)}
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((l) => (
          <TabsContent key={l} value={l} className="mt-2 grid gap-3">
            {fields.map((field) => {
              const val = value?.[l]?.[field.name] ?? "";
              const common = {
                id: `${l}-${field.name}`,
                required: field.required,
                placeholder: field.placeholder,
                value: val,
                onChange: (e) => onChange(makeLocalePatch(value, l, { [field.name]: e.target.value })),
              };
              return (
                <div key={field.name} className="grid gap-1.5">
                  <Label htmlFor={common.id}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea rows={field.rows ?? 4} {...common} />
                  ) : (
                    <Input type="text" {...common} />
                  )}
                </div>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/**
 * Per-locale use-case list editor. Each row has a title and description and
 * rows are aligned by index across locales.
 */
export function UseCaseRows({ value, onChange, addLabel = "Kullanım senaryosu ekle", max = 20 }) {
  const [tab, setTab] = useState("tr");

  const update = (l, rows) => onChange({ ...value, [l]: rows });

  return (
    <div className="grid gap-2">
      <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Kullanım senaryoları
      </legend>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l}>
              {localeLabel(l)}
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((l) => {
          const rows = value?.[l] ?? [];
          return (
            <TabsContent key={l} value={l} className="mt-2 grid gap-3">
              {rows.map((row, i) => (
                <div key={i} className="grid gap-2 rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={row.title ?? ""}
                      maxLength={200}
                      placeholder={`Başlık ${i + 1}`}
                      onChange={(e) =>
                        update(
                          l,
                          rows.map((r, ri) => (ri === i ? { ...r, title: e.target.value } : r))
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => update(l, rows.filter((_, ri) => ri !== i))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    value={row.description ?? ""}
                    maxLength={2000}
                    placeholder="Açıklama"
                    onChange={(e) =>
                      update(
                        l,
                        rows.map((r, ri) =>
                          ri === i ? { ...r, description: e.target.value } : r
                        )
                      )
                    }
                  />
                </div>
              ))}
              {rows.length < max && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={() => update(l, [...rows, { title: "", description: "" }])}
                >
                  <Plus className="size-4" />
                  {addLabel}
                </Button>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

/** Per-locale feature list editor aligned by row index. */
export function FeatureRows({ value, onChange, addLabel = "Özellik ekle", max = 50 }) {
  const [tab, setTab] = useState("tr");

  return (
    <div className="grid gap-2">
      <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Özellikler
      </legend>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l}>
              {l === "tr" ? "Türkçe" : "English"}
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((l) => {
          const rows = value?.[l] ?? [];
          return (
            <TabsContent key={l} value={l} className="mt-2 grid gap-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={row}
                    maxLength={500}
                    placeholder={`Özellik ${i + 1}`}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        [l]: rows.map((r, ri) => (ri === i ? e.target.value : r)),
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onChange({ ...value, [l]: rows.filter((_, ri) => ri !== i) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {rows.length < max && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={() => onChange({ ...value, [l]: [...rows, ""] })}
                >
                  <Plus className="size-4" />
                  {addLabel}
                </Button>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
