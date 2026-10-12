import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardStat } from "@/components/admin/blocks";
import { StatusBadge } from "@/components/admin/list";
import { fromNow } from "@/lib/format";
import { Activity, ArrowRight, Boxes, FileText, Inbox, Package, ShieldCheck, Tags } from "lucide-react";

export default function Dashboard({ summary, admin }) {
  const { counts, recentInquiries, recentAudit } = summary;

  const statCards = [
    { label: "Ürünler", value: counts.products, to: "/admin/products", icon: Package },
    { label: "Kategoriler", value: counts.categories, to: "/admin/categories", icon: Tags },
    { label: "Paketler", value: counts.packages + counts.maintenance, to: "/admin/packages", icon: Boxes },
    { label: "Sayfalar", value: counts.pages, to: "/admin/pages", icon: FileText },
    { label: "Yeni İleti", value: counts.newInquiries, to: "/admin/inbox", icon: Inbox, accent: counts.newInquiries > 0 },
    { label: "Yöneticiler", value: counts.admins, to: "/admin/admins", icon: ShieldCheck },
    { label: "Aktif Oturum", value: counts.sessions, to: "/admin/sessions", icon: Activity },
  ];

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Hoş geldin, {admin?.name?.split(" ")[0] ?? "admin"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mithrabyte yönetim paneline genel bakış.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.to}>
            <CardStat
              label={s.label}
              value={s.value}
              className={
                s.accent
                  ? "border-primary/40 shadow-[0_0_0_1px] shadow-primary/20"
                  : "transition-colors hover:border-primary/40"
              }
            />
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Son İletiler</h2>
            <Link href="/admin/inbox" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Tümü <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz ileti yok.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentInquiries.map((q) => (
                <li key={q.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{q.subject || q.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {q.name} · {q.email} · {fromNow(q.createdAt)}
                    </span>
                  </span>
                  <StatusBadge value={q.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Son İşlemler</h2>
            <Link href="/admin/audit" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Tümü <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentAudit.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              İşlem geçmişi boş.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentAudit.map((log) => (
                <li key={log.id} className="flex items-center gap-3 py-2.5">
                  <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                    {log.action}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm">{log.entity}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {log.admin?.name ?? "—"} · {fromNow(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}