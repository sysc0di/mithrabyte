import { ok, withHandler, readJson, validate } from "@/lib/api";
import { pageUpsertSchema } from "@/lib/validation/schemas";
import { updatePage, deletePage, getPage } from "@/lib/services/content";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit } from "@/lib/audit";

/**
 * /api/admin/pages/[id] — update and delete an editable page.
 */
export const dynamic = "force-dynamic";

export const PUT = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(pageUpsertSchema, json);

  const before = await getPage(id);
  const updated = await updatePage(id, data);
  await writeAudit({
    adminId: admin.id,
    action: "page.update",
    entity: "page",
    entityId: id,
    before: { key: before.key },
    after: { key: updated.key, isActive: updated.isActive },
  });
  return ok({ item: updated });
});

export const DELETE = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const before = await getPage(id);
  await deletePage(id);
  await writeAudit({
    adminId: admin.id,
    action: "page.delete",
    entity: "page",
    entityId: id,
    before: { key: before.key },
  });
  return ok({ deleted: true });
});