import { ok, withHandler } from "@/lib/api";
import { getSummary } from "@/lib/services/summary";
import { guard } from "@/lib/api/admin-guard";

/**
 * GET /api/admin/summary — dashboard counts and recent activity.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  return ok(await getSummary());
});