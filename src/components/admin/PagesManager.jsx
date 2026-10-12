"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { LocalizedFieldset } from "@/components/admin/editors";
import { FileText, LayoutList, Pencil, Plus, Search, ShieldCheck, Trash2, XCircle } from "lucide-react";

const PAGE_SIZE = 10;

const EMPTY_PAGE = {
  key: "",
  isActive: true,
  locales: {
    tr: { title: "", subtitle: "", body: "", seoTitle: "", seoDescription: "" },
    en: { title: "", subtitle: "", body: "", seoTitle: "", seoDescription: "" },
  },
};

const EMPTY_SECTION = {
  key: "",
  sortOrder: 0,
  locales: { tr: { title: "", body: "" }, en: { title: "", body: "" } },
};

export default function PagesManager() {
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PAGE);
  const [deleting, setDeleting] = useState(null);
  const [sectionsFor, setSectionsFor] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionsBusy, setSectionsBusy] = useState(false);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [sectionForm, setSectionForm] = useState(EMPTY_SECTION);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const data = await api(`/api/admin/pages?page=${page}&pageSize=${PAGE_SIZE}`);
      setRows(data.items);
      setTotal(data.total);
    } catch (err) {
      push({ type: "error", title: "Sayfalar yüklenemedi", description: err.message });
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [push, page]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(it) {
    setEditing(it);
    setForm({
      key: it.key,
      isActive: it.isActive,
      locales: {
        tr: pickLocale(it, "tr"),
        en: pickLocale(it, "en"),
      },
    });
    setDialog(true);
  }

  function pickLocale(it, locale) {
    return {
      title: it.localeFields?.[locale]?.title ?? "",
      subtitle: it.localeFields?.[locale]?.subtitle ?? "",
      body: it.localeFields?.[locale]?.body ?? "",
      seoTitle: it.localeFields?.[locale]?.seoTitle ?? "",
      seoDescription: it.localeFields?.[locale]?.seoDescription ?? "",
    };
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) await apiPut(`/api/admin/pages/${editing.id}`, form);
      else await apiPost("/api/admin/pages", form);
      push({ type: "success", title: editing ? "Sayfa güncellendi" : "Sayfa oluşturuldu" });
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
      await apiDelete(`/api/admin/pages/${deleting.id}`);
      push({ type: "success", title: "Sayfa silindi" });
      load();
    } catch (err) {
      push({ type: "error", title: "Silinemedi", description: err.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  async function openSections(it) {
    setSectionsFor(it);
    setSections([]);
    setSectionsBusy(true);
    try {
      const data = await api(`/api/admin/pages/${it.id}/sections`);
      setSections(data.items);
    } catch (err) {
      push({ type: "error", title: "Bölümler yüklenemedi", description: err.message });
    } finally {
      setSectionsBusy(false);
    }
  }

  async function addSection(e) {
    e.preventDefault();
    setSectionsBusy(true);
    try {
      await apiPost(`/api/admin/pages/${sectionsFor.id}/sections`, sectionForm);
      push({ type: "success", title: "Bölüm eklendi" });
      setSectionDialog(false);
      setSectionForm(EMPTY_SECTION);
      openSections(sectionsFor);
      load();
    } catch (err) {
      push({ type: "error", title: "Bölüm eklenemedi", description: err.message });
    } finally {
      setSectionsBusy(false);
    }
  }

  return (
    <Card className="gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          Sayfa listesi ({total})
        </div>
        <ReloadButton onClick={load} busy={busy} />
      </div>

      {rows === null ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sayfa bulunamadı"
          description="İlk düzenlenebilir sayfayı oluşturun."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(null);
                setForm(EMPTY_PAGE);
                setDialog(true);
              }}
            >
              <Plus className="size-4" />
              Sayfa Ekle
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sayfa</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Bölüm</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>
                    <span className="font-medium">
                      {it.localeFields?.tr?.title || it.localeFields?.en?.title || it.key}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono">{it.key}</span>
                      {it.isSystem && (
                        <Badge variant="outline" className="text-[9px]">
                          <ShieldCheck className="size-3" />
                          Sistem
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={it.isActive ? "ACTIVE" : "DRAFT"} />
                  </TableCell>
                  <TableCell className="text-xs">{it._count?.sections ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openSections(it)}>
                        <LayoutList className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(it)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={it.isSystem}
                        onClick={() => setDeleting(it)}
                      >
                        {it.isSystem ? <XCircle className="size-4 opacity-40" /> : <Trash2 className="size-4" />}
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
            <DialogTitle>{editing ? "Sayfayı düzenle" : "Yeni sayfa"}</DialogTitle>
            <DialogDescription>
              Sayfa içerikleri her dil için ayrı girilir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="page-key">Anahtar (key)</Label>
                <Input
                  id="page-key"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="about"
                  value={form.key}
                  onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                />
                <span className="text-xs text-muted-foreground">
                  Rut yolu: /{"{locale}"}/sayfa-key
                </span>
              </div>
              <label className="flex items-end gap-2 pb-1 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="size-4 accent-primary"
                />
                Yayında
              </label>
            </div>
            <LocalizedFieldset
              value={form.locales}
              onChange={(locales) => setForm((f) => ({ ...f, locales }))}
              legend="İçerik"
              fields={[
                { name: "title", label: "Başlık" },
                { name: "subtitle", label: "Alt başlık", type: "textarea", rows: 2 },
                { name: "body", label: "Gövde", type: "textarea", rows: 8 },
                { name: "seoTitle", label: "SEO başlığı" },
                { name: "seoDescription", label: "SEO açıklaması", type: "textarea", rows: 2 },
              ]}
            />
            <FormActions busy={busy} onCancel={() => setDialog(false)} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={sectionsFor !== null} onOpenChange={(o) => !o && setSectionsFor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Bölümler — {sectionsFor?.localeFields?.tr?.title || sectionsFor?.key}
            </DialogTitle>
            <DialogDescription>
              Sayfadaki bölümler. Düzenleme/silme ileriki aşamada eklenecek.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {sectionsBusy ? (
              <LoadingRows rows={2} />
            ) : sections.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Bu sayfada henüz bölüm yok.
              </p>
            ) : (
              sections.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold">{s.key}</span>
                    <span className="text-[11px] text-muted-foreground">sıra {s.sortOrder}</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {s.localeFields?.tr?.title || s.localeFields?.en?.title || "Başlıksız"}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {s.localeFields?.tr?.body || s.localeFields?.en?.body || ""}
                  </p>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setSectionDialog(true)}>
              <Plus className="size-4" />
              Bölüm Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni bölüm</DialogTitle>
            <DialogDescription>
              Bölüm başlığı ve içeriği her dil için girilir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addSection} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="section-key">Anahtar</Label>
                <Input
                  id="section-key"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="hero"
                  value={sectionForm.key}
                  onChange={(e) => setSectionForm((f) => ({ ...f, key: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="section-order">Sıra</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={sectionForm.sortOrder}
                  onChange={(e) => setSectionForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </div>
            </div>
            <LocalizedFieldset
              value={sectionForm.locales}
              onChange={(locales) => setSectionForm((f) => ({ ...f, locales }))}
              legend="İçerik"
              fields={[
                { name: "title", label: "Başlık" },
                { name: "body", label: "İçerik", type: "textarea", rows: 4 },
              ]}
            />
            <FormActions busy={sectionsBusy} onCancel={() => setSectionDialog(false)} submitLabel="Bölümü Ekle" />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Sayfayı sil?"
        description={`"${
          deleting?.localeFields?.tr?.title || deleting?.key || ""
        }" kalıcı olarak silinecek.`}
        busy={busy}
        onConfirm={remove}
      />
    </Card>
  );
}
