import { prisma } from "@/lib/db";

/**
 * Dashboard overview payload for the admin home page.
 */

export async function getSummary() {
  const [
    productCount,
    categoryCount,
    packageCount,
    maintenanceCount,
    pageCount,
    adminCount,
    sessionCount,
    newInquiries,
    totalInquiries,
    recentInquiries,
    recentAudit,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.servicePackage.count({ where: { kind: "PACKAGE" } }),
    prisma.servicePackage.count({ where: { kind: "MAINTENANCE" } }),
    prisma.page.count(),
    prisma.admin.count(),
    prisma.adminSession.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count(),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { admin: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return {
    counts: {
      products: productCount,
      categories: categoryCount,
      packages: packageCount,
      maintenance: maintenanceCount,
      pages: pageCount,
      admins: adminCount,
      sessions: sessionCount,
      newInquiries,
      totalInquiries,
    },
    recentInquiries,
    recentAudit: recentAudit.map(({ admin, ...log }) => ({
      ...log,
      admin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
    })),
  };
}