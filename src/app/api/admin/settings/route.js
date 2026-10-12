import { ok, withHandler, readJson, validate } from "@/lib/api";
import { settingPatchSchema } from "@/lib/validation/schemas";
import { listSettings, patchSettings } from "@/lib/services/content";
import { guard } from "@/lib/api/admin-guard";
import { writeAudit } from "@/lib/audit";

/**
 * /api/admin/settings — read settings (GET) and update editable ones (PATCH).
 * Protected/system settings are rejected server-side.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  return ok({ items: await listSettings() });
});

export const PATCH = withHandler(async (req) => {
  const { admin } = await guard(req, { mutation: true });
  const json = await readJson(req);
  const data = validate(settingPatchSchema, json);

  const updated = await patchSettings(data);
  await writeAudit({
    adminId: admin.id,
    action: "setting.update",
    entity: "setting",
    entityId: updated.map((u) => `${u.key}:${u.locale}`).join(","),
    after: updated,
  });
  return ok({ updated });
});