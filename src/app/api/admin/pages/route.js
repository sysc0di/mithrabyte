import { ok, withHandler, readJson, validate, pageParams } from "@/lib/api";
import { pageUpsertSchema } from "@/lib/validation/schemas";
import { listPages } from "@/lib/services/content";
import { createPage } from "@/lib/services/content";
import { guard } from "@/lib/api/admin-guard";
import { writeAudit, snapshot } from "@/lib/audit";

/**
 * /api/admin/pages — list and create editable pages.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  const paging = pageParams(req.nextUrl.searchParams);
  return ok(await listPages(paging));
});

export const POST = withHandler(async (req) => {
  const { admin } = await guard(req, { mutation: true });
  const json = await readJson(req);
  const data = validate(pageUpsertSchema, json);

  const created = await createPage(data);
  await writeAudit({
    adminId: admin.id,
    action: "page.create",
    entity: "page",
    entityId: created.id,
    after: snapshot({ key: created.key, isActive: created.isActive }),
  });
  return ok({ item: created }, { status: 201 });
});