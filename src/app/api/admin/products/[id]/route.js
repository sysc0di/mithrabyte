import { ok, withHandler, readJson, validate } from "@/lib/api";
import { productUpsertSchema } from "@/lib/validation/schemas";
import { updateProduct, deleteProduct, getProduct } from "@/lib/services/catalog";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit, snapshot } from "@/lib/audit";

/**
 * /api/admin/products/[id] — update and delete a product.
 */
export const dynamic = "force-dynamic";

export const PUT = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(productUpsertSchema, json);

  const before = await getProduct(id);
  const updated = await updateProduct(id, data);
  await writeAudit({
    adminId: admin.id,
    action: "product.update",
    entity: "product",
    entityId: id,
    before: snapshot({ slug: before.slug, status: before.status }),
    after: snapshot({ slug: updated.slug, status: updated.status }),
  });
  return ok({ item: updated });
});

export const DELETE = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const before = await getProduct(id);
  await deleteProduct(id);
  await writeAudit({
    adminId: admin.id,
    action: "product.delete",
    entity: "product",
    entityId: id,
    before: { slug: before.slug, title: before.localeFields?.tr?.title },
  });
  return ok({ deleted: true });
});