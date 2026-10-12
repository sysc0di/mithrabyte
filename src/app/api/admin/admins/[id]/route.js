import { ok, withHandler, readJson, validate } from "@/lib/api";
import { adminUpdateSchema } from "@/lib/validation/schemas";
import { updateAdmin, deleteAdmin } from "@/lib/services/auth";
import { guard, assertOwner, routeId } from "@/lib/api/admin-guard";
import { getRequestIp } from "@/lib/auth/session";

/**
 * /api/admin/admins/[id] — update (PUT) or delete (DELETE) an administrator.
 * OWNER-only; self-modification and last-Owner removal are prevented.
 */
export const dynamic = "force-dynamic";

export const PUT = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  assertOwner(admin);
  const id = await routeId(ctx);

  const json = await readJson(req);
  const data = validate(adminUpdateSchema, json);

  const updated = await updateAdmin(id, data, {
    actor: admin,
    ip: getRequestIp(req),
  });
  return ok({ item: updated });
});

export const DELETE = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  assertOwner(admin);
  const id = await routeId(ctx);

  await deleteAdmin(id, { actor: admin, ip: getRequestIp(req) });
  return ok({ deleted: true });
});