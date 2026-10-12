import { ok, withHandler } from "@/lib/api";
import { requireAdmin, destroySessionByToken, SESSION_COOKIE } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { getRequestIp } from "@/lib/auth/session";

/**
 * POST /api/admin/auth/logout — destroys the current session server-side.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req) => {
  const { token } = await requireAdmin(req);
  await destroySessionByToken(token);
  await writeAudit({ entity: "admin", action: "logout", ip: getRequestIp(req) });

  const res = ok({ loggedOut: true });
  res.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  return res;
});