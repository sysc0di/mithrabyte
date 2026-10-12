import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { sha256 } from "@/lib/utils/server";
import { writeAudit } from "@/lib/audit";

/**
 * Session administration for the signed-in administrator.
 */

export async function listSessions(adminId) {
  return prisma.adminSession.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });
}

export async function revokeSession(id, adminId, { currentToken, ip } = {}) {
  const session = await prisma.adminSession.findFirst({ where: { id, adminId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found.");

  if (currentToken && session.tokenHash === sha256(currentToken)) {
    throw new ApiError(400, "CURRENT_SESSION", "The active session cannot be revoked directly.");
  }

  await prisma.adminSession.delete({ where: { id } });
  await writeAudit({
    adminId,
    action: "session.revoke",
    entity: "adminsession",
    entityId: id,
    after: session.tokenHash === sha256(currentToken) ? { current: true } : {},
    ip,
  });
  return true;
}

export async function revokeAllOtherSessions(adminId, { currentToken, ip } = {}) {
  const where = currentToken ? { adminId, NOT: { tokenHash: sha256(currentToken) } } : { adminId };
  const result = await prisma.adminSession.deleteMany({ where });
  await writeAudit({
    adminId,
    action: "session.revokeAll",
    entity: "adminsession",
    entityId: adminId,
    ip,
  });
  return result.count;
}