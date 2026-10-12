import { ok, withHandler, readJson, validate, pageParams } from "@/lib/api";
import { productUpsertSchema } from "@/lib/validation/schemas";
import { listProducts, createProduct } from "@/lib/services/catalog";
import { guard } from "@/lib/api/admin-guard";
import { writeAudit, snapshot } from "@/lib/audit";

/**
 * /api/admin/products — list (paginated, filterable) and create products.
 */
export const dynamic = "force-dynamic";

const VALID_STATUS = ["DRAFT", "UPCOMING", "AVAILABLE", "ARCHIVED"];

export const GET = withHandler(async (req) => {
  await guard(req);
  const sp = req.nextUrl.searchParams;
  const paging = pageParams(sp);
  const result = await listProducts({
    ...paging,
    status: VALID_STATUS.includes(sp.get("status")) ? sp.get("status") : undefined,
    categoryId: sp.get("categoryId") || undefined,
    search: sp.get("search") || undefined,
  });
  return ok(result);
});

export const POST = withHandler(async (req) => {
  const { admin } = await guard(req, { mutation: true });
  const json = await readJson(req);
  const data = validate(productUpsertSchema, json);

  const created = await createProduct(data);
  await writeAudit({
    adminId: admin.id,
    action: "product.create",
    entity: "product",
    entityId: created.id,
    after: snapshot({ slug: created.slug, status: created.status, locales: created.localeFields }, []),
  });
  return ok({ item: created }, { status: 201 });
});