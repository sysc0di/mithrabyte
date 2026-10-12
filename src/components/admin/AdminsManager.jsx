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
import { ConfirmDialog, StatusBadge } from "@/components/admin/list";
import { LoadingRows, FormActions, EmptyState } from "@/components/admin/blocks";
import { formatDate } from "@/lib/format";
import { KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";

const EMPTY = { name: "", email: "", password: "", role: "ADMIN" };

export default function AdminsManager({ currentAdmin }) {
  const { push } = useToast();
  const isOwner = currentAdmin?.role === "OWNER";
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editForm, setEditForm] = useState({ name: "", role: "ADMIN", isActive: true });
  const [pwTarget, setPwTarget] = useState(null);
  const [pwValue, setPwValue] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setRows((await api("/api/admin/admins")).items);
    } catch (err) {
      push({ type: "error", title: "Yöneticiler yüklenemedi", description: err.message });
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/admin/admins", form);
      push({ type: "success", title: "Yönetici oluşturuldu" });
      setCreateOpen(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      push({ type: "error", title: "Oluşturulamadı", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  function openEdit(it) {
    setEditTarget(it);
    setEditForm({ name: it.name, role: it.role, isActive: it.isActive });
  }

  async function update(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPut(`/api/admin/admins/${editTarget.id}`, editForm);
      push({ type: "success", title: "Yönetici güncellendi" });
      setEditTarget(null);
      load();
    } catch (err) {
      push({ type: "error", title: "Güncellenemedi", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (pwValue.length < 12) {
      push({ type: "error", title: "Şifre çok kısa", description: "En az 12 karakter girin." });
      return;
    }
    setBusy(true);
    try {
      await apiPost(`/api/admin/admins/${pwTarget.id}/password`, { newPassword: pwValue });
      push({
        type: "success",
        title: "Şifre sıfırlandı",
        description: "Kullanıcı geçici şifreyle giriş yapıp değiştirmek zorunda kalacak.",
      });
      setPwTarget(null);
      setPwValue("");
    } catch (err) {
      push({ type: "error", title: "Sıfırlanamadı", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await apiDelete(`/api/admin/admins/${deleting.id}`);
      push({ type: "success", title: "Yönetici kaldırıldı" });
      load();
    } catch (err) {
      push({ type: "error", title: "Kaldırılamadı", description: err.message });
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  }

  return (
    <Card className="gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Yönetici hesap yönetimi. Rol değişiklikleri için OWNER yetkisi gerekir.
        </p>
        {isOwner ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Yeni Yönetici
          </Button>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            Yalnızca OWNER ekleyebilir
          </Badge>
        )}
      </div>

      {rows === null ? (
        <LoadingRows rows={2} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Yönetici yok"
          description="İlk yönetici seed komutuyla oluşturulur."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yönetici</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Son giriş</TableHead>
              <TableHead>Oturum</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((it) => {
              const self = it.id === currentAdmin?.id;
              return (
                <TableRow key={it.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="font-medium">{it.name}</span>
                        {self && <span className="text-[10px] text-muted-foreground">(sen)</span>}
                        <span className="block text-xs text-muted-foreground">{it.email}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={it.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={it.isActive ? "ACTIVE" : "DRAFT"} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(it.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-xs">{it._count?.sessions ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setPwTarget(it)}>
                        <KeyRound className="size-4" />
                      </Button>
                      {isOwner && !self && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(it)}>
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {isOwner && !self && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(it)}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni yönetici</DialogTitle>
            <DialogDescription>İlk girişte kullanılacak geçici şifreyi belirleyin.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="adm-name">Ad Soyad</Label>
              <Input id="adm-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adm-email">E-posta</Label>
              <Input id="adm-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adm-password">Geçici şifre</Label>
              <Input id="adm-password" type="password" required minLength={12} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              <span className="text-xs text-muted-foreground">En az 12 karakter.</span>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adm-role">Rol</Label>
              <select
                id="adm-role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
              </select>
            </div>
            <FormActions busy={busy} onCancel={() => setCreateOpen(false)} submitLabel="Yönetici Oluştur" />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editTarget !== null} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yöneticiyi düzenle</DialogTitle>
            <DialogDescription>Durum ve rol değişiklikleri buradan yapılır.</DialogDescription>
          </DialogHeader>
          <form onSubmit={update} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Ad Soyad</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-role">Rol</Label>
              <select
                id="edit-role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-4 accent-primary"
              />
              Hesap aktif
            </label>
            <FormActions busy={busy} onCancel={() => setEditTarget(null)} submitLabel="Güncelle" />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pwTarget !== null} onOpenChange={(o) => !o && setPwTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Şifre sıfırla — {pwTarget?.name}</DialogTitle>
            <DialogDescription>
              Sıfırlama sonrası kullanıcı bir sonraki girişte şifre değiştirmek zorunda kalır.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="reset-pw">Yeni geçici şifre</Label>
              <Input id="reset-pw" type="password" minLength={12} value={pwValue} onChange={(e) => setPwValue(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPwTarget(null)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={resetPassword} disabled={busy || pwValue.length < 12}>
                {busy ? <Loader2 className="animate-spin" /> : <KeyRound className="size-4" />}
                Sıfırla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Yöneticiyi kaldır?"
        description={`"${deleting?.name || ""}" hesabı kalıcı olarak silinecek ve tüm oturumları sona erecek.`}
        busy={busy}
        onConfirm={remove}
      />
    </Card>
  );
}