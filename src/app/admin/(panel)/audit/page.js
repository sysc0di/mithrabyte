import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/admin/blocks";
import { ScrollText } from "lucide-react";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AuditPage({ searchParams }) {
  const ctx = await getServerAdmin();
  if (!ctx) redirect("/admin/login");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);

  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-6">
      <PageHeader title="Denetim Günlüğü" description="Hassas yönetim işlemlerinin değiştirilemez kaydı." />

      {items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Kayıt yok"
          description="Hassas işlemler burada listelenir."
        />
      ) : (
        <div className="relative w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="h-10 px-3 font-medium text-muted-foreground">Zaman</th>
                <th className="h-10 px-3 font-medium text-muted-foreground">Yönetici</th>
                <th className="h-10 px-3 font-medium text-muted-foreground">İşlem</th>
                <th className="h-10 px-3 font-medium text-muted-foreground">Nesne</th>
                <th className="h-10 px-3 font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-xs whitespace-nowrap text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="p-3 text-xs whitespace-nowrap">
                    {log.admin?.name ?? <span className="text-muted-foreground">sistem</span>}
                  </td>
                  <td className="p-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {log.action}
                    </code>
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {log.entity}
                    {log.entityId ? ` / ${log.entityId}` : ""}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {log.ipAddress ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {total} kayıt · sayfa {page}/{pages}
          </span>
          <div className="flex gap-1">
            {page > 1 && <a href={`/admin/audit?page=${page - 1}`} className="rounded border border-border px-2 py-1 hover:border-primary/50">Önceki</a>}
            {page < pages && <a href={`/admin/audit?page=${page + 1}`} className="rounded border border-border px-2 py-1 hover:border-primary/50">Sonraki</a>}
          </div>
        </div>
      )}
    </div>
  );
}