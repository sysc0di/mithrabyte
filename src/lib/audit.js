import { prisma } from "@/lib/db";

/**
 * Immutable audit trail for sensitive administrative operations.
 * `before`/`after` carry small, redacted payloads (never hashes/tokens).
 */
export async function writeAudit({ adminId, action, entity, entityId, before, after, ip }) {
  await prisma.auditLog.create({
    data: {
      adminId: adminId || null,
      action,
      entity,
      entityId: entityId || null,
      before: before ?? undefined,
      after: after ?? undefined,
      ipAddress: ip ? ip.slice(0, 64) : null,
    },
  });
}

/** Screenshots scalar fields for audit payloads (drops sensitive fields). */
export function snapshot(record, exclude = []) {
  if (!record) return undefined;
  const plain = {};
  for (const [key, value] of Object.entries(record)) {
    if (exclude.includes(key)) continue;
    if (value === undefined) continue;
    if (value instanceof Date) {
      plain[key] = value.toISOString();
    } else if (typeof value === "object" && value !== null) {
      plain[key] = value;
    } else {
      plain[key] = value;
    }
  }
  return plain;
}