"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, apiDelete } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/list";
import { formatDate, fromNow } from "@/lib/format";
import { Loader2, MonitorSmartphone, ShieldX, Trash2 } from "lucide-react";

export default function SessionsManager() {
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/admin/sessions");
      setRows(data.items);
      setTotal(data.items.length);
    } catch (err) {
      push({ type: "error", title: "Oturumlar yüklenemedi", description: err.message });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  async function revoke(row) {
    setBusyId(row.id);
    try {
      await apiDelete(`/api/admin/sessions/${row.id}`);
      push({ type: "success", title: "Oturum iptal edildi" });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      push({ type: "error", title: "İşlem başarısız", description: err.message });
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  }

  async function revokeAll() {
    setBulkBusy(true);
    try {
      const data = await apiDelete("/api/admin/sessions");
      push({ type: "success", title: `${data.revoked} oturum iptal edildi` });
      setRows((prev) => prev.filter((r) => r.id));
      load();
    } catch (err) {
      push({ type: "error", title: "İşlem başarısız", description: err.message });
    } finally {
      setBulkBusy(false);
      setConfirm(null);
    }
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Aktif Oturumlar</h2>
          {total !== null && (
            <Badge variant="outline" className="text-[10px]">
              {total}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" disabled={bulkBusy || loading} onClick={() => setConfirm({ all: true })}>
          {bulkBusy ? <Loader2 className="animate-spin" /> : <ShieldX className="size-4" />}
          Diğerlerini İptal Et
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cihaz</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Son Kullanım</TableHead>
            <TableHead>Bitiş</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows === null || loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                <Loader2 className="mx-auto size-4 animate-spin" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                Aktif oturum yok.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <MonitorSmartphone className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-56 truncate text-xs font-medium">
                        {row.userAgent ? parseUA(row.userAgent).label : "Bilinmeyen cihaz"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Açılış: {formatDate(row.createdAt)}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.ipAddress ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{fromNow(row.lastUsedAt)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(row.expiresAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busyId === row.id}
                    onClick={() => setConfirm({ row, all: false })}
                  >
                    {busyId === row.id ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.all ? "Tüm diğer oturumları iptal et?" : "Bu oturumu iptal edelim mi?"}
        description={
          confirm?.all
            ? "Cihazınız hariç tüm aktif oturumlar sonlandırılır. Bu işlem geri alınamaz."
            : "Bu oturumdaki cihaz tekrar giriş yapmak zorunda kalır."
        }
        busy={busyId !== null || bulkBusy}
        onConfirm={() => (confirm?.all ? revokeAll() : revoke(confirm.row))}
      />
    </Card>
  );
}

function parseUA(ua) {
  const lower = ua.toLowerCase();
  const mobile = /mobile|android|iphone|ipad/i.test(lower);
  const label = mobile ? "Mobil cihaz" : "Masaüstü cihaz";
  if (/chrome|chromium/i.test(lower)) return { label };
  if (/firefox/i.test(lower)) return { label };
  if (/safari/i.test(lower)) return { label };
  if (/edg/i.test(lower)) return { label };
  if (/postman|insomnia|curl/i.test(lower)) return { label: "API istemcisi" };
  return { label };
}