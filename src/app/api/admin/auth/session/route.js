import { ok } from "@/lib/api";
import { withHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { publicAdmin } from "@/lib/services/auth";

/**
 * GET /api/admin/auth/session — returns the current session + admin.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  const { admin } = await requireAdmin(req);
  return ok({ admin: publicAdmin(admin) });
});