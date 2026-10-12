import { ok, withHandler, readJson, validate } from "@/lib/api";
import { adminCreateSchema } from "@/lib/validation/schemas";
import { listAdmins, createAdmin } from "@/lib/services/auth";
import { guard, assertOwner } from "@/lib/api/admin-guard";
import { getRequestIp } from "@/lib/auth/session";

/**
 * /api/admin/admins — list administrators (GET, any admin) and create
 * new administrators (POST, OWNER only).
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  return ok({ items: await listAdmins() });
});

export const POST = withHandler(async (req) => {
  const { admin } = await guard(req, { mutation: true });
  assertOwner(admin);

  const json = await readJson(req);
  const data = validate(adminCreateSchema, json);

  const created = await createAdmin(data, {
    actor: admin,
    ip: getRequestIp(req),
  });
  return ok({ item: created }, { status: 201 });
});