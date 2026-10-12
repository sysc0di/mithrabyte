import { z } from "zod";
import { ok, withHandler, readJson, validate } from "@/lib/api";
import { localized } from "@/lib/validation/schemas";
import { listSections, upsertSection } from "@/lib/services/content";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit } from "@/lib/audit";

/**
 * /api/admin/pages/[id]/sections — list (GET) and create (POST) page sections.
 */
export const dynamic = "force-dynamic";

const sectionLocalesSchema = localized(
  z.object({
    title: z.string().trim().max(300),
    body: z.string().trim().max(30000).optional().or(z.literal("")),
  })
);

const sectionUpsertSchema = z
  .object({
    key: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Key may only contain lowercase letters, numbers and hyphens.")
      .min(1)
      .max(120),
    sortOrder: z.coerce.number().int().min(-10000).max(10000).default(0),
    locales: sectionLocalesSchema,
  })
  .strict();

export const GET = withHandler(async (req, ctx) => {
  await guard(req);
  const pageId = await routeId(ctx);
  return ok({ items: await listSections(pageId) });
});

export const POST = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const pageId = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(sectionUpsertSchema, json);

  const section = await upsertSection(pageId, data);
  await writeAudit({
    adminId: admin.id,
    action: "section.create",
    entity: "section",
    entityId: section.id,
    after: { pageId, key: section.key },
  });
  return ok({ item: section }, { status: 201 });
});