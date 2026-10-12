import { ok, withHandler, readJson, validate } from "@/lib/api";
import { changeOwnPasswordSchema } from "@/lib/validation/schemas";
import { changeOwnPassword } from "@/lib/services/auth";
import { guard } from "@/lib/api/admin-guard";
import { getRequestIp } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * POST /api/admin/account/password — change the signed-in admin's password.
 * All sessions (including the current one) are revoked on success.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req) => {
  const { admin, token } = await guard(req, { mutation: true });
  const json = await readJson(req);
  const data = validate(changeOwnPasswordSchema, json);

  await changeOwnPassword(admin.id, data, { ip: getRequestIp(req) });

  const res = ok({ changed: true });
  if (token) res.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  return res;
});