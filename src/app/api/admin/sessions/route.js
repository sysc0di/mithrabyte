import { ok, withHandler } from "@/lib/api";
import { listSessions, revokeAllOtherSessions } from "@/lib/services/sessions";
import { guard } from "@/lib/api/admin-guard";
import { getRequestIp } from "@/lib/auth/session";

/**
 * /api/admin/sessions — list active sessions (GET) or revoke all other
 * sessions (DELETE).
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  const { admin } = await guard(req);
  return ok({ items: await listSessions(admin.id) });
});

export const DELETE = withHandler(async (req) => {
  const { admin, token } = await guard(req, { mutation: true });
  const count = await revokeAllOtherSessions(admin.id, {
    currentToken: token,
    ip: getRequestIp(req),
  });
  return ok({ revoked: count });
});