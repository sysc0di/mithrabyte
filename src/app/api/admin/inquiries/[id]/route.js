import { ok, withHandler, readJson, validate } from "@/lib/api";
import { inquiryUpdateSchema } from "@/lib/validation/schemas";
import { getInquiry, updateInquiry, deleteInquiry } from "@/lib/services/inquiries";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit } from "@/lib/audit";

/**
 * /api/admin/inquiries/[id] — read a single inquiry (GET), update status or
 * internal admin note (PATCH), permanently delete it (DELETE).
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req, ctx) => {
  await guard(req);
  return ok({ item: await getInquiry(await routeId(ctx)) });
});

export const PATCH = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(inquiryUpdateSchema, json);

  const before = await getInquiry(id);
  const updated = await updateInquiry(id, data);
  await writeAudit({
    adminId: admin.id,
    action: "inquiry.update",
    entity: "inquiry",
    entityId: id,
    before: { status: before.status },
    after: { status: updated.status },
  });
  return ok({ item: updated });
});

export const DELETE = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const before = await getInquiry(id);
  await deleteInquiry(id);
  await writeAudit({
    adminId: admin.id,
    action: "inquiry.delete",
    entity: "inquiry",
    entityId: id,
    before: { name: before.name, email: before.email, subject: before.subject },
  });
  return ok({ deleted: true });
});