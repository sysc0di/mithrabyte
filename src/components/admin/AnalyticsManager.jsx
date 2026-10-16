"use client";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Copy, Check, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/components/admin/api";
import { ReloadButton } from "@/components/admin/list";
import { CardStat } from "@/components/admin/blocks";
import { useToast } from "@/components/admin/toast";
import { formatDate, splitPathQuery } from "@/lib/format";

function lastNDays(n) {
  const from = new Date();
  from.setDate(from.getDate() - (n - 1));
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  const toIso = to.toISOString();
  const fromIso = from.toISOString();
  return { from: fromIso.slice(0, 10), to: toIso.slice(0, 10) };
}

const PRESETS = {
  "7": ["Son 7 gün", () => lastNDays(7)],
  "30": ["Son 30 gün", () => lastNDays(30)],
  "90": ["Son 90 gün", () => lastNDays(90)],
};

export default function AnalyticsManager() {
  const { push } = useToast();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [range, setRange] = useState(() => lastNDays(30));

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await api(`/api/admin/analytics?from=${range.from}T00:00:00&to=${range.to}T23:59:59`));
    } catch (err) {
      push({ type: "error", title: "Analitik yüklenemedi", description: err.message });
    } finally {
      setBusy(false);
    }
  }, [push, range]);

  useEffect(() => {
    load();
  }, [load]);

  const maxDay = data?.series?.length
    ? Math.max(...data.series.map((s) => s.count), 1)
    : 1;

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="from">Başlangıç</Label>
            <Input
              id="from"
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="to">Bitiş</Label>
            <Input
              id="to"
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
          {Object.entries(PRESETS).map(([key, [label, calc]]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => setRange(calc())}
            >
              {label}
            </Button>
          ))}
          <ReloadButton onClick={load} busy={busy} />
        </div>
      </Card>

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <CardStat label="Sayfa Görüntülenme" value={data.totals.pageviews} />
            <CardStat label="Olay" value={data.totals.events} hint={`${data.range?.from?.slice(0, 10)} → ${data.range?.to?.slice(0, 10)}`} />
          </div>

          <Card className="gap-3 p-4">
            <h2 className="text-sm font-semibold">Günlük Olaylar</h2>
            {data.series.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Veri yok.</p>
            ) : (
              <div className="flex h-40 items-end gap-px" aria-label="Günlük olay grafiği">
                {data.series.map((s) => (
                  <div
                    key={s.day}
                    title={`${s.day}: ${s.count} olay`}
                    className="flex-1 rounded-t bg-primary/70 transition-colors hover:bg-primary"
                    style={{ height: `${Math.max(2, (s.count / maxDay) * 100)}%` }}
                  />
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-3 p-4">
              <h2 className="text-sm font-semibold">En Çok Görüntülenen Sayfalar</h2>
              {data.topPages.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Veri yok.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.topPages.map((p) => (
                    <li key={p.path} className="flex items-center justify-between gap-2 py-2">
                      <PathDisplay fullPath={p.path} />
                      <span className="text-xs text-muted-foreground">{p.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="gap-3 p-4">
              <h2 className="text-sm font-semibold">Yönlendirenler</h2>
              {data.topReferrers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Veri yok.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.topReferrers.map((r) => (
                    <li key={r.referrer} className="flex items-center justify-between gap-2 py-2">
                      <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs">
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                        <span className="truncate" title={r.referrer}>{r.referrer}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{r.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card className="gap-3 p-4">
            <h2 className="text-sm font-semibold">Son Olaylar</h2>
            {data.recent.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Kayıt yok.</p>
            ) : (
              <TableRecent rows={data.recent} />
            )}
          </Card>
        </>
      ) : (
        <div className="grid place-items-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function PathDisplay({ fullPath }) {
  const [copied, setCopied] = useState(false);
  const { pathname, query } = splitPathQuery(fullPath);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullPath || "/");
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      /* clipboard unavailable; title still shows full value */
    }
  };
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="block max-w-[10rem] truncate font-mono text-xs sm:max-w-[16rem]" title={fullPath}>
        {pathname}
        {query && <span className="text-muted-foreground">…</span>}
      </span>
      <Button variant="ghost" size="icon" className="size-6" onClick={copy} title="Kopyala">
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </Button>
      <Button variant="ghost" size="icon" className="size-6" onClick={() => window.alert(fullPath || "/")} title="Tamamını göster">
        <Maximize2 className="size-3" />
      </Button>
    </div>
  );
}

function TableRecent({ rows }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="h-9 pr-3 text-xs font-medium text-muted-foreground">Olay</th>
            <th className="h-9 pr-3 text-xs font-medium text-muted-foreground">Sayfa</th>
            <th className="h-9 pr-3 text-xs font-medium text-muted-foreground">Cihaz</th>
            <th className="h-9 pr-3 text-xs font-medium text-muted-foreground">Dil</th>
            <th className="h-9 text-xs font-medium text-muted-foreground">Zaman</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((ev) => (
            <tr key={ev.id} className="border-b last:border-0">
              <td className="p-3 font-mono text-xs">{ev.name}</td>
              <td className="p-3 font-mono text-xs text-muted-foreground">
                <PathDisplay fullPath={ev.path} />
              </td>
              <td className="p-3 text-xs text-muted-foreground">{ev.device ?? "—"}</td>
              <td className="p-3 text-xs text-muted-foreground">{ev.locale ?? "—"}</td>
              <td className="p-3 text-xs text-muted-foreground">{formatDate(ev.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
