import { ok, withHandler } from "@/lib/api";
import { getReport } from "@/lib/services/analytics";
import { guard } from "@/lib/api/admin-guard";

/**
 * GET /api/admin/analytics?from=ISO&to=ISO — first-party analytics report.
 * Charts and deeper aggregates are refined in Phase 4.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  const sp = req.nextUrl.searchParams;
  const report = await getReport({
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
  });
  return ok(report);
});