"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ConfirmDialog, StatusBadge } from "@/components/admin/list";
import { EmptyState, LoadingRows, FormActions } from "@/components/admin/blocks";
import { LocalizedFieldset } from "@/components/admin/editors";
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";

const EMPTY_FORM = {
  slug: "",
  sortOrder: 0,
  isActive: true,
  locales: { tr: { title: "", description: "" }, en: { title: "", description: "" }, ku: { title: "", description: "" } },
};

export default function CategoriesManager() {
  const { push } = useToast();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setItems((await api("/api/admin/categories")).items);
    } catch (err) {
      push({ type: "error", title: "Kategoriler yüklenemedi", description: err.message });
      setItems([]);
    } finally {
      setBusy(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.slug.toLowerCase().includes(q) ||
        (it.localeFields?.tr?.title || "").toLowerCase().includes(q) ||
        (it.localeFields?.en?.title || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialog(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      slug: item.slug,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      locales: {
        tr: { title: item.localeFields?.tr?.title || "", description: item.localeFields?.tr?.description || "" },
        en: { title: item.localeFields?.en?.title || "", description: item.localeFields?.en?.description || "" },
        ku: { title: item.localeFields?.ku?.title || "", description: item.localeFields?.ku?.description || "" },
      },
    });
    setDialog(true);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) await apiPut(`/api/admin/categories/${editing.id}`, form);
      else await apiPost("/api/admin/categories", form);
      push({ type: "success", title: editing ? "Kategori güncellendi" : "Kategori oluşturuldu" });
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
      await apiDelete(`/api/admin/categories/${deleting.id}`);
      push({ type: "success", title: "Kategori silindi" });
      load();
    } catch (err) {
      push({ type: "error", title: "Silinemedi", description: err.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Kategori ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Yeni Kategori
        </Button>
      </div>

      {items === null ? (
        <LoadingRows />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Kategori bulunamadı"
          description={search ? "Farklı bir arama deneyin." : "İlk kategoriyi oluşturun."}
          action={
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Kategori Ekle
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead>Ürün</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((it) => (
              <TableRow key={it.id}>
                <TableCell>
                  <span className="font-medium">
                    {it.localeFields?.tr?.title || it.localeFields?.en?.title || "—"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {it.localeFields?.en?.title ? `EN: ${it.localeFields?.en?.title}` : "EN: —"}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{it.slug}</TableCell>
                <TableCell>
                  <StatusBadge value={it.isActive ? "ACTIVE" : "DRAFT"} />
                </TableCell>
                <TableCell className="text-xs">{it.sortOrder}</TableCell>
                <TableCell className="text-xs">{it._count?.products ?? 0}</TableCell>
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
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Kategoriyi düzenle" : "Yeni kategori"}</DialogTitle>
            <DialogDescription>
              Başlıklar ve açıklamalar her dil için ayrı girilir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="web-development"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cat-order">Sıra</Label>
                <Input
                  id="cat-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-4 accent-primary"
              />
              Yayınlanmış (aktif)
            </label>
            <LocalizedFieldset
              value={form.locales}
              onChange={(locales) => setForm((f) => ({ ...f, locales }))}
              fields={[
                { name: "title", label: "Başlık", required: true },
                { name: "description", label: "Açıklama", type: "textarea", rows: 3 },
              ]}
            />
            <FormActions busy={busy} onCancel={() => setDialog(false)} />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Kategoriyi sil?"
        description={`"${
          deleting?.localeFields?.tr?.title || deleting?.slug || ""
        }" kalıcı olarak silinecek. İlişkili ürünler kategorisiz kalır.`}
        busy={busy}
        onConfirm={remove}
      />
    </Card>
  );
}
