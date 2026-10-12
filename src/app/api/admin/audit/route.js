import { ok, withHandler, pageParams } from "@/lib/api";
import { prisma } from "@/lib/db";
import { guard } from "@/lib/api/admin-guard";

/**
 * GET /api/admin/audit — paginated audit trail (read-only).
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  const paging = pageParams(req.nextUrl.searchParams, 25);

  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { id: true, name: true, email: true } } },
      skip: paging.skip,
      take: paging.take,
    }),
    prisma.auditLog.count(),
  ]);

  return ok({
    items: items.map(({ admin, ...log }) => ({
      ...log,
      admin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
    })),
    total,
    page: paging.page,
    pageSize: paging.pageSize,
  });
});