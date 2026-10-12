import { ok, withHandler, readJson, validate } from "@/lib/api";
import { adminResetPasswordSchema } from "@/lib/validation/schemas";
import { resetAdminPassword } from "@/lib/services/auth";
import { guard, assertOwner, routeId } from "@/lib/api/admin-guard";
import { getRequestIp } from "@/lib/auth/session";

/**
 * POST /api/admin/admins/[id]/password — OWNER resets another admin's
 * password and revokes all of their sessions.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  assertOwner(admin);
  const id = await routeId(ctx);

  const json = await readJson(req);
  const data = validate(adminResetPasswordSchema, json);

  await resetAdminPassword(id, data, { actor: admin, ip: getRequestIp(req) });
  return ok({ reset: true });
});