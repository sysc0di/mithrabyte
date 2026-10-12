import { ok, withHandler } from "@/lib/api";
import { inboxStats } from "@/lib/services/inquiries";
import { guard } from "@/lib/api/admin-guard";

/**
 * GET /api/admin/inquiries/stats — per-status inquiry counts for the inbox.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  return ok(await inboxStats());
});