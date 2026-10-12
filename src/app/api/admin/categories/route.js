import { ok, withHandler, readJson, validate } from "@/lib/api";
import { categoryUpsertSchema } from "@/lib/validation/schemas";
import { listCategories, upsertCategory } from "@/lib/services/catalog";
import { guard } from "@/lib/api/admin-guard";
import { writeAudit, snapshot } from "@/lib/audit";

/**
 * /api/admin/categories — list and create categories.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  const items = await listCategories();
  return ok({ items });
});

export const POST = withHandler(async (req) => {
  const { admin } = await guard(req, { mutation: true });
  const json = await readJson(req);
  const data = validate(categoryUpsertSchema, json);

  const created = await upsertCategory(data);
  await writeAudit({
    adminId: admin.id,
    action: "category.create",
    entity: "category",
    entityId: created.id,
    after: snapshot({ slug: created.slug, locales: created.localeFields }),
  });
  return ok({ item: created }, { status: 201 });
});