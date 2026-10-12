"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, apiPost, apiPut, apiDelete } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";
import { ConfirmDialog, StatusBadge, PaginationBar, ReloadButton } from "@/components/admin/list";
import { EmptyState, LoadingRows, FormActions } from "@/components/admin/blocks";
import { LocalizedFieldset, FeatureRows, UseCaseRows } from "@/components/admin/editors";
import { Package, Pencil, Plus, Search, Trash2, Wrench } from "lucide-react";

const PAGE_SIZE = 10;

const STATUSES = ["DRAFT", "AVAILABLE", "ARCHIVED"];
const PRICING_MODELS = ["QUOTE", "FIXED"];

const EMPTY_LOCALE = {
  title: "",
  tagline: "",
  description: "",
  priceLabel: "",
  ctaText: "",
  seoTitle: "",
  seoDescription: "",
};

const EMPTY_FORM = {
  slug: "",
  kind: "PACKAGE",
  status: "DRAFT",
  productId: "",
  pricingModel: "QUOTE",
  billingPeriod: "ONE_TIME",
  priceAmount: "",
  currency: "",
  sortOrder: 0,
  locales: { tr: { ...EMPTY_LOCALE }, en: { ...EMPTY_LOCALE }, ku: { ...EMPTY_LOCALE } },
  features: { tr: [], en: [], ku: [] },
  useCases: { tr: [], en: [], ku: [] },
};

function pick(it, locale) {
  const content = it.localeFields?.[locale] ?? {};
  const data = content.data && typeof content.data === "object" ? content.data : {};
  return {
    title: content.title ?? "",
    tagline: content.tagline ?? "",
    description: content.description ?? "",
    priceLabel: content.priceLabel ?? "",
    ctaText: content.ctaText ?? "",
    seoTitle: content.seoTitle ?? "",
    seoDescription: content.seoDescription ?? "",
    useCases: Array.isArray(data.useCases) ? data.useCases : [],
  };
}

export default function PackagesManager() {
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState("PACKAGE");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      q.set("kind", kind);
      q.set("page", String(page));
      q.set("pageSize", String(PAGE_SIZE));
      const data = await api(`/api/admin/packages?${q.toString()}`);
      setRows(data.items);
      setTotal(data.total);
    } catch (err) {
      push({ type: "error", title: "Paketler yüklenemedi", description: err.message });
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [push, search, kind, page]);

  useEffect(() => {
    setPage(1);
  }, [kind, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api("/api/admin/products?pageSize=100")
      .then((data) => setProducts(data.items))
      .catch(() => setProducts([]));
  }, []);

  function openCreate(nextKind) {
    setEditing(null);
    setForm({ ...EMPTY_FORM, kind: nextKind || kind });
    setDialog(true);
  }

  function openEdit(it) {
    const tr = pick(it, "tr");
      const en = pick(it, "en");
      const ku = pick(it, "ku");
    setEditing(it);
    setForm({
      slug: it.slug,
      kind: it.kind,
      status: it.status,
      productId: it.productId || "",
      pricingModel: it.pricingModel,
      billingPeriod: it.billingPeriod,
      priceAmount: it.priceAmount != null ? String(it.priceAmount) : "",
      currency: it.currency || "",
      sortOrder: it.sortOrder,
      locales: {
        tr: { ...tr, useCases: undefined },
        en: { ...en, useCases: undefined },
        ku: { ...ku, useCases: undefined },
      },
      features: {
        tr: it.featureList?.tr ?? [],
        en: it.featureList?.en ?? [],
        ku: it.featureList?.ku ?? [],
      },
      useCases: { tr: tr.useCases, en: en.useCases, ku: ku.useCases },
    });
    setDialog(true);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      slug: form.slug,
      kind: form.kind,
      status: form.status,
      productId: form.productId || null,
      pricingModel: form.pricingModel,
      billingPeriod: form.billingPeriod,
      priceAmount: form.priceAmount === "" ? null : Number(form.priceAmount),
      currency: form.currency || "",
      sortOrder: form.sortOrder,
      locales: {
        tr: { ...form.locales.tr, data: { useCases: form.useCases.tr } },
        en: { ...form.locales.en, data: { useCases: form.useCases.en } },
        ku: { ...form.locales.ku, data: { useCases: form.useCases.ku } },
      },
      features: form.features,
    };
    try {
      if (editing) await apiPut(`/api/admin/packages/${editing.id}`, payload);
      else await apiPost("/api/admin/packages", payload);
      push({ type: "success", title: editing ? "Paket güncellendi" : "Paket oluşturuldu" });
      setDialog(false);
      load();
    } catch (err) {
      push({ type: "error", title: "Kaydedilemedi", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await apiDelete(`/api/admin/packages/${deleting.id}`);
      push({ type: "success", title: "Paket silindi" });
      load();
    } catch (err) {
      push({ type: "error", title: "Silinemedi", description: err.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  const isRecurring = form.billingPeriod !== "ONE_TIME";

  return (
    <div className="grid gap-4">
      <Tabs value={kind} onValueChange={setKind}>
        <TabsList>
          <TabsTrigger value="PACKAGE">
            <Package className="size-4" />
            Servis Paketleri
          </TabsTrigger>
          <TabsTrigger value="MAINTENANCE">
            <Wrench className="size-4" />
            Bakım Anlaşmaları
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Paket ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <ReloadButton onClick={load} busy={busy} />
            <Button onClick={() => openCreate(null)}>
              <Plus className="size-4" />
              Yeni Paket
            </Button>
          </div>
        </div>

        {rows === null ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Paket bulunamadı"
            description={
              kind === "MAINTENANCE"
                ? "Henüz bakım anlaşması yok."
                : "İlk servis paketini oluşturun."
            }
            action={
              <Button variant="outline" size="sm" onClick={() => openCreate(null)}>
                <Plus className="size-4" />
                Paket Ekle
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paket</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Fiyat (TR)</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      <span className="font-medium">
                        {it.localeFields?.tr?.title || it.localeFields?.en?.title || it.slug}
                      </span>
                      <span className="block text-xs text-muted-foreground">{it.slug}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={it.kind} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={it.status} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {it.localeFields?.tr?.priceLabel || "—"}
                    </TableCell>
                    <TableCell className="text-xs">{it.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(it)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(it)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Paketi düzenle" : "Yeni paket"}</DialogTitle>
            <DialogDescription>
              Fiyat ve içerikler her dil için ayrı girilir. Tek seferlik kurulum ile
              aylık bakım aboneliğini ayrı kayıtlar olarak tanımlayın.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-slug">Slug</Label>
                <Input
                  id="pkg-slug"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="rag-managed-service"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-kind">Tür</Label>
                <Select
                  id="pkg-kind"
                  value={form.kind}
                  onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                >
                  <option value="PACKAGE">Servis Paketi</option>
                  <option value="MAINTENANCE">Bakım Anlaşması</option>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-status">Durum</Label>
                <Select
                  id="pkg-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-product">Bağlı ürün</Label>
                <Select
                  id="pkg-product"
                  value={form.productId}
                  onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                >
                  <option value="">— Bağımsız —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.localeFields?.tr?.title || p.slug}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-pricing">Fiyatlandırma</Label>
                <Select
                  id="pkg-pricing"
                  value={form.pricingModel}
                  onChange={(e) => setForm((f) => ({ ...f, pricingModel: e.target.value }))}
                >
                  {PRICING_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m === "QUOTE" ? "Teklif bazlı" : "Sabit fiyat"}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-billing">Periyot</Label>
                <Select
                  id="pkg-billing"
                  value={form.billingPeriod}
                  onChange={(e) => setForm((f) => ({ ...f, billingPeriod: e.target.value }))}
                >
                  <option value="ONE_TIME">Tek seferlik</option>
                  <option value="MONTHLY">Aylık</option>
                  <option value="YEARLY">Yıllık</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-amount">Tutar {isRecurring && "(periyot başına)"}</Label>
                <Input
                  id="pkg-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Boş = teklife bağlı"
                  value={form.priceAmount}
                  onChange={(e) => setForm((f) => ({ ...f, priceAmount: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-currency">Para birimi</Label>
                <Input
                  id="pkg-currency"
                  placeholder="TRY"
                  maxLength={8}
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pkg-order">Sıra</Label>
                <Input
                  id="pkg-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
            </div>

            <LocalizedFieldset
              value={form.locales}
              onChange={(locales) => setForm((f) => ({ ...f, locales }))}
              legend="İçerik"
              fields={[
                { name: "title", label: "Başlık", required: true },
                { name: "tagline", label: "Kısa açıklama (tagline)" },
                { name: "priceLabel", label: "Fiyat etiketi (örn. Teklif bazlı)" },
                { name: "ctaText", label: "CTA metni (örn. Teklif Al)" },
                { name: "description", label: "Detaylı açıklama", type: "textarea", rows: 5 },
                { name: "seoTitle", label: "SEO başlığı" },
                { name: "seoDescription", label: "SEO açıklaması", type: "textarea", rows: 2 },
              ]}
            />
            <FeatureRows
              value={form.features}
              onChange={(features) => setForm((f) => ({ ...f, features }))}
              addLabel="Özellik ekle"
            />
            <UseCaseRows
              value={form.useCases}
              onChange={(useCases) => setForm((f) => ({ ...f, useCases }))}
            />
            <FormActions busy={busy} onCancel={() => setDialog(false)} />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Paketi sil?"
        description={`"${
          deleting?.localeFields?.tr?.title || deleting?.slug || ""
        }" kalıcı olarak silinecek.`}
        busy={busy}
        onConfirm={remove}
      />
    </div>
  );
}
