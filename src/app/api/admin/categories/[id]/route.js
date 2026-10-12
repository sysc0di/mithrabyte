import { ok, withHandler, readJson, validate } from "@/lib/api";
import { categoryUpsertSchema } from "@/lib/validation/schemas";
import { upsertCategory, deleteCategory, getCategory } from "@/lib/services/catalog";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit } from "@/lib/audit";

/**
 * /api/admin/categories/[id] — update and delete a category.
 */
export const dynamic = "force-dynamic";

export const PUT = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(categoryUpsertSchema, json);

  const before = await getCategory(id);
  const updated = await upsertCategory(data, { id });
  await writeAudit({
    adminId: admin.id,
    action: "category.update",
    entity: "category",
    entityId: id,
    before: { slug: before.slug },
    after: { slug: updated.slug },
  });
  return ok({ item: updated });
});

export const DELETE = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const before = await getCategory(id);
  await deleteCategory(id);
  await writeAudit({
    adminId: admin.id,
    action: "category.delete",
    entity: "category",
    entityId: id,
    before: { slug: before.slug, title: before.localeFields?.tr?.title },
  });
  return ok({ deleted: true });
});