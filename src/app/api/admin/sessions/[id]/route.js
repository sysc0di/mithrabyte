import { ok, withHandler } from "@/lib/api";
import { revokeSession } from "@/lib/services/sessions";
import { guard, routeId } from "@/lib/api/admin-guard";
import { getRequestIp } from "@/lib/auth/session";

/**
 * DELETE /api/admin/sessions/[id] — revoke one of the signed-in admin's
 * sessions (the active one is rejected server-side).
 */
export const dynamic = "force-dynamic";

export const DELETE = withHandler(async (req, ctx) => {
  const { admin, token } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  await revokeSession(id, admin.id, {
    currentToken: token,
    ip: getRequestIp(req),
  });
  return ok({ revoked: true });
});