import { ok, withHandler, readJson, validate } from "@/lib/api";
import { packageUpsertSchema } from "@/lib/validation/schemas";
import { updatePackage, deletePackage, getPackage } from "@/lib/services/catalog";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit, snapshot } from "@/lib/audit";

/**
 * /api/admin/packages/[id] — update and delete a package / maintenance plan.
 */
export const dynamic = "force-dynamic";

export const PUT = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(packageUpsertSchema, json);

  const before = await getPackage(id);
  const updated = await updatePackage(id, data);
  await writeAudit({
    adminId: admin.id,
    action: "package.update",
    entity: "servicepackage",
    entityId: id,
    before: snapshot({ slug: before.slug, kind: before.kind }),
    after: snapshot({ slug: updated.slug, kind: updated.kind }),
  });
  return ok({ item: updated });
});

export const DELETE = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const before = await getPackage(id);
  await deletePackage(id);
  await writeAudit({
    adminId: admin.id,
    action: "package.delete",
    entity: "servicepackage",
    entityId: id,
    before: { slug: before.slug, title: before.localeFields?.tr?.title },
  });
  return ok({ deleted: true });
});