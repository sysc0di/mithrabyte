import { ok, withHandler, readJson, validate, pageParams } from "@/lib/api";
import { packageUpsertSchema } from "@/lib/validation/schemas";
import { listPackages, createPackage } from "@/lib/services/catalog";
import { guard } from "@/lib/api/admin-guard";
import { writeAudit, snapshot } from "@/lib/audit";

/**
 * /api/admin/packages?kind=PACKAGE|MAINTENANCE — list and create service
 * packages and maintenance plans.
 */
export const dynamic = "force-dynamic";

const VALID_KIND = ["PACKAGE", "MAINTENANCE"];
const VALID_STATUS = ["DRAFT", "AVAILABLE", "ARCHIVED"];

export const GET = withHandler(async (req) => {
  await guard(req);
  const sp = req.nextUrl.searchParams;
  const paging = pageParams(sp);
  const result = await listPackages({
    ...paging,
    kind: VALID_KIND.includes(sp.get("kind")) ? sp.get("kind") : undefined,
    status: VALID_STATUS.includes(sp.get("status")) ? sp.get("status") : undefined,
    productId: sp.get("productId") || undefined,
    search: sp.get("search") || undefined,
  });
  return ok(result);
});

export const POST = withHandler(async (req) => {
  const { admin } = await guard(req, { mutation: true });
  const json = await readJson(req);
  const data = validate(packageUpsertSchema, json);

  const created = await createPackage(data);
  await writeAudit({
    adminId: admin.id,
    action: "package.create",
    entity: "servicepackage",
    entityId: created.id,
    after: snapshot({ slug: created.slug, kind: created.kind }),
  });
  return ok({ item: created }, { status: 201 });
});