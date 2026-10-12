"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";

const STATUSES = ["DRAFT", "UPCOMING", "AVAILABLE", "ARCHIVED"];
const PAGE_SIZE = 10;

const EMPTY_LOCALE = {
  title: "",
  tagline: "",
  shortDescription: "",
  description: "",
  targetAudience: "",
  ctaText: "",
  seoTitle: "",
  seoDescription: "",
};

const EMPTY_FORM = {
  slug: "",
  status: "DRAFT",
  categoryId: "",
  sortOrder: 0,
  locales: {
    tr: { ...EMPTY_LOCALE },
    en: { ...EMPTY_LOCALE },
    ku: { ...EMPTY_LOCALE },
  },
  features: { tr: [], en: [], ku: [] },
  useCases: { tr: [], en: [], ku: [] },
};

function pickProductLocale(it, l) {
  return {
    title: it.localeFields?.[l]?.title ?? "",
    tagline: it.localeFields?.[l]?.tagline ?? "",
    shortDescription: it.localeFields?.[l]?.shortDescription ?? "",
    description: it.localeFields?.[l]?.description ?? "",
    targetAudience: it.localeFields?.[l]?.targetAudience ?? "",
    ctaText: it.localeFields?.[l]?.ctaText ?? "",
    seoTitle: it.localeFields?.[l]?.seoTitle ?? "",
    seoDescription: it.localeFields?.[l]?.seoDescription ?? "",
  };
}

export default function ProductsManager() {
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (status) q.set("status", status);
      q.set("page", String(page));
      q.set("pageSize", String(PAGE_SIZE));
      const data = await api(`/api/admin/products?${q.toString()}`);
      setRows(data.items);
      setTotal(data.total);
    } catch (err) {
      push({ type: "error", title: "Ürünler yüklenemedi", description: err.message });
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [push, search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api("/api/admin/categories")
      .then((data) => setCategories(data.items))
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialog(true);
  };

  const openEdit = (it) => {
    setEditing(it);
    setForm({
      slug: it.slug,
      status: it.status,
      categoryId: it.categoryId || "",
      sortOrder: it.sortOrder,
      locales: {
        tr: pickProductLocale(it, "tr"),
        en: pickProductLocale(it, "en"),
        ku: pickProductLocale(it, "ku"),
      },
      features: {
        tr: it.featureList?.tr ?? [],
        en: it.featureList?.en ?? [],
        ku: it.featureList?.ku ?? [],
      },
      useCases: {
        tr: it.localeFields?.tr?.useCases ?? [],
        en: it.localeFields?.en?.useCases ?? [],
        ku: it.localeFields?.ku?.useCases ?? [],
      },
    });
    setDialog(true);
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      slug: form.slug,
      status: form.status,
      categoryId: form.categoryId || null,
      sortOrder: form.sortOrder,
      locales: {
        tr: { ...form.locales.tr, useCases: form.useCases.tr },
        en: { ...form.locales.en, useCases: form.useCases.en },
        ku: { ...form.locales.ku, useCases: form.useCases.ku },
      },
      features: form.features,
    };
    try {
      if (editing) await apiPut(`/api/admin/products/${editing.id}`, payload);
      else await apiPost("/api/admin/products", payload);
      push({ type: "success", title: editing ? "Ürün güncellendi" : "Ürün oluşturuldu" });
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
      await apiDelete(`/api/admin/products/${deleting.id}`);
      push({ type: "success", title: "Ürün silindi" });
      load();
    } catch (err) {
      push({ type: "error", title: "Silinemedi", description: err.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  const nameOf = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.localeFields?.tr?.title || c.slug]));
    return (id) => (id ? map.get(id) || "—" : "—");
  }, [categories]);

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Ürün ara…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            className="w-40"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tüm durumlar</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ReloadButton onClick={load} busy={busy} />
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      {rows === null ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Ürün bulunamadı"
          description={search || status ? "Filtreleri değiştirin." : "İlk ürünü oluşturun."}
          action={
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Ürün Ekle
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Slug</TableHead>
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
                  <TableCell className="text-xs">{nameOf(it.categoryId)}</TableCell>
                  <TableCell>
                    <StatusBadge value={it.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{it.sortOrder}</TableCell>
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

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Ürünü düzenle" : "Yeni ürün"}</DialogTitle>
            <DialogDescription>
              Dil içerikleri "TR / EN" sekmelerinden ayrı ayrı girilir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5 sm:col-span-1">
                <Label htmlFor="prod-slug">Slug</Label>
                <Input
                  id="prod-slug"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="web-development"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="prod-status">Durum</Label>
                <Select
                  id="prod-status"
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
              <div className="grid gap-1.5">
                <Label htmlFor="prod-order">Sıra</Label>
                <Input
                  id="prod-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="prod-category">Kategori</Label>
              <Select
                id="prod-category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">— Kategorisiz —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.localeFields?.tr?.title || c.slug}
                  </option>
                ))}
              </Select>
            </div>

            <LocalizedFieldset
              value={form.locales}
              onChange={(locales) => setForm((f) => ({ ...f, locales }))}
              legend="İçerik"
              fields={[
                { name: "title", label: "Başlık", required: true },
                { name: "tagline", label: "Kısa açıklama (tagline)" },
                { name: "shortDescription", label: "Kısa açıklama (kart)" },
                { name: "description", label: "Detaylı açıklama", type: "textarea", rows: 5 },
                { name: "targetAudience", label: "Hedef kitle" },
                { name: "ctaText", label: "CTA metni (örn. Teklif Al)" },
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
        title="Ürünü sil?"
        description={`"${
          deleting?.localeFields?.tr?.title || deleting?.slug || ""
        }" kalıcı olarak silinecek.`}
        busy={busy}
        onConfirm={remove}
      />
    </Card>
  );
}
