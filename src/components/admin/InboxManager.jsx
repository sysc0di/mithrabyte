"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, apiPatch, apiPost, apiDelete } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";
import { StatusBadge, PaginationBar, ReloadButton, ConfirmDialog } from "@/components/admin/list";
import { EmptyState, LoadingRows, CardStat } from "@/components/admin/blocks";
import { formatDate } from "@/lib/format";
import { ArrowLeftRight, Inbox, Loader2, Mail, Search, Send, Trash2 } from "lucide-react";

const STATUSES = ["NEW", "READ", "IN_PROGRESS", "RESOLVED", "SPAM", "ARCHIVED"];
const PAGE_SIZE = 10;

export default function InboxManager() {
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState("");
  const [reply, setReply] = useState({ subject: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (status) q.set("status", status);
      q.set("page", String(page));
      q.set("pageSize", String(PAGE_SIZE));
      const data = await api(`/api/admin/inquiries?${q.toString()}`);
      setRows(data.items);
      setTotal(data.total);
    } catch (err) {
      push({ type: "error", title: "İletiler yüklenemedi", description: err.message });
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [push, search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api("/api/admin/inquiries/stats")
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const refreshStats = async () => {
    try {
      setStats(await api("/api/admin/inquiries/stats"));
    } catch {
      /* non-fatal */
    }
  };

  async function openDetail(it) {
    setOpen(it);
    setSaving(true);
    try {
      const data = await api(`/api/admin/inquiries/${it.id}`);
      // The endpoint uses the standard { item } payload; keep the UI's
      // inquiry object consistent with the list endpoint.
      setDetail(data.item);
      setNote(data.item.adminNote || "");
    } catch (err) {
      push({ type: "error", title: "İleti yüklenemedi", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function saveStatus(nextStatus) {
    if (!detail || nextStatus === detail.status) return;
    setSaving(true);
    try {
      await apiPatch(`/api/admin/inquiries/${detail.id}`, { status: nextStatus });
      push({ type: "success", title: "Durum güncellendi" });
      setOpen(null);
      setDetail(null);
      load();
      refreshStats();
    } catch (err) {
      push({ type: "error", title: "Güncellenemedi", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!detail) return;
    setSaving(true);
    try {
      await apiPatch(`/api/admin/inquiries/${detail.id}`, { adminNote: note });
      push({ type: "success", title: "Not kaydedildi" });
    } catch (err) {
      push({ type: "error", title: "Not kaydedilemedi", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function sendReply() {
    if (!detail) return;
    setSaving(true);
    try {
      const result = await apiPost(`/api/admin/inquiries/${detail.id}/reply`, reply);
      push({
        type: "success",
        title: result.delivered ? "Yanıt gönderildi" : "Yanıt kaydedildi",
        description: result.delivered
          ? "E-posta gönderildi ve gelen kutusuna kaydedildi."
          : "Hostinger SMTP yapılandırılmadığı için yanıt yalnızca gelen kutusuna kaydedildi.",
      });
      setReply({ subject: "", body: "" });
      setOpen(null);
      setDetail(null);
      load();
      refreshStats();
    } catch (err) {
      push({ type: "error", title: "Yanıt gönderilemedi", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteInquiry() {
    if (!detail) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/admin/inquiries/${detail.id}`);
      push({ type: "success", title: "İleti kalıcı olarak silindi" });
      setConfirmDelete(false);
      setOpen(null);
      setDetail(null);
      load();
      refreshStats();
    } catch (err) {
      push({ type: "error", title: "Silinemedi", description: err.message });
    } finally {
      setDeleting(false);
    }
  }

  const statCards = stats
    ? [
        { label: "Yeni", value: stats.NEW, to: "NEW" },
        { label: "Okundu", value: stats.READ, to: "READ" },
        { label: "İşlemde", value: stats.IN_PROGRESS, to: "IN_PROGRESS" },
        { label: "Çözüldü", value: stats.RESOLVED, to: "RESOLVED" },
        { label: "Spam", value: stats.SPAM, to: "SPAM" },
        { label: "Arşiv", value: stats.ARCHIVED, to: "ARCHIVED" },
        { label: "Toplam", value: stats.TOTAL, to: "" },
      ]
    : [];

  return (
    <div className="grid gap-4">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {statCards.map((s) => (
            <button key={s.label} type="button" onClick={() => setStatus(s.to)}>
              <CardStat
                label={s.label}
                value={s.value}
                className={cnHover(status === s.to)}
              />
            </button>
          ))}
        </div>
      )}

      <Card className="gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-wrap gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="İleti ara…"
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
          <ReloadButton onClick={load} busy={busy} />
        </div>

        {rows === null ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="İleti bulunamadı" description="Gelen kutusu boş." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İleti</TableHead>
                  <TableHead>Konu</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">Yanıt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((it) => (
                  <TableRow key={it.id} className="cursor-pointer" onClick={() => openDetail(it)}>
                    <TableCell>
                      <span className="font-medium">{it.name}</span>
                      <span className="block text-xs text-muted-foreground">{it.email}</span>
                    </TableCell>
                    <TableCell className="max-w-56 truncate text-xs">{it.subject}</TableCell>
                    <TableCell>
                      <StatusBadge value={it.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(it.createdAt)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {it._count?.replies ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </Card>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          {detail ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  <span className="flex items-center gap-2">
                    <Mail className="size-4" />
                    {detail.subject || "Konusuz ileti"}
                    <StatusBadge value={detail.status} />
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {detail.name} · {detail.email}
                  {detail.company ? ` · ${detail.company}` : ""}
                  {detail.pageRef ? ` · ${detail.pageRef}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                  {detail.message}
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="grid gap-1.5">
                    <Label>Durum</Label>
                    <Select
                      value={detail.status}
                      onChange={(e) => saveStatus(e.target.value)}
                      className="w-40"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" onClick={saveNote} disabled={saving}>
                    <ArrowLeftRight className="size-4" />
                    Notu Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                    disabled={saving || deleting}
                  >
                    <Trash2 className="size-4" />
                    Kalıcı olarak sil
                  </Button>
                </div>
                <div className="grid gap-1.5">
                  <Label>Dahili not</Label>
                  <Textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Müşteriye görünmez yönetici notu…"
                  />
                </div>

                {detail.replies && detail.replies.length > 0 && (
                  <div className="grid gap-2 rounded-lg border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Kayıtlı yanıtlar
                    </p>
                    {detail.replies.map((r) => (
                      <div key={r.id} className="rounded-md bg-muted/40 p-2">
                        <p className="text-xs font-medium">{r.subject}</p>
                        <p className="mt-1 text-xs whitespace-pre-wrap">{r.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatDate(r.createdAt)} · {r.fromName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Yanıt oluştur
                  </p>
                  <div className="grid gap-1.5">
                    <Label htmlFor="reply-subject">Konu</Label>
                    <Input
                      id="reply-subject"
                      value={reply.subject}
                      onChange={(e) => setReply((r) => ({ ...r, subject: e.target.value }))}
                      placeholder={`Re: ${detail.subject || ""}`}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="reply-body">Mesaj</Label>
                    <Textarea
                      id="reply-body"
                      rows={4}
                      value={reply.body}
                      onChange={(e) => setReply((r) => ({ ...r, body: e.target.value }))}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={sendReply}
                    disabled={saving || !reply.subject.trim() || !reply.body.trim()}
                    className="justify-self-end"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
                    Yanıtı Gönder
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid place-items-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="İletiyi kalıcı olarak sil?"
        description={`"${detail?.subject || "Konusuz ileti"}" ileti ve yanıtları geri alınamaz şekilde silinecek.`}
        confirmLabel="Kalıcı olarak sil"
        busy={deleting}
        onConfirm={deleteInquiry}
      />
    </div>
  );
}

function cnHover(active) {
  return active
    ? "border-primary/60 shadow-[0_0_0_1px] shadow-primary/30"
    : "transition-colors hover:border-primary/40";
}
