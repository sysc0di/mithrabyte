import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyAllSessions } from "@/lib/auth/session";
import { isLoginBlocked, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { writeAudit } from "@/lib/audit";

/**
 * Auth service: login/logout orchestration plus administrator account
 * management (single-admin oriented, with self-protection invariants).
 */

const DUMMY_HASH_PROMISE = hashPassword("dummy-password-for-timing-equality");

export function publicAdmin(row) {
  if (!row) return null;
  const { passwordHash: _passwordHash, ...rest } = row;
  return rest;
}

export async function login({ email, password, ip, userAgent, auditLog }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const { blocked } = await isLoginBlocked({ email: normalizedEmail, ip });
  if (blocked) {
    throw new ApiError(
      429,
      "TOO_MANY_ATTEMPTS",
      "Too many failed attempts. Please wait a few minutes and try again."
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  const dummy = await DUMMY_HASH_PROMISE;
  const valid = admin
    ? await verifyPassword(admin.passwordHash, password)
    : await verifyPassword(dummy, password);

  if (!admin || !valid) {
    await recordLoginAttempt({ email: normalizedEmail, ip, succeeded: false });
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  if (!admin.isActive) {
    await recordLoginAttempt({ email: normalizedEmail, ip, succeeded: true });
    throw new ApiError(403, "ACCOUNT_DISABLED", "This administrator account is disabled.");
  }

  // Session rotation: every successful login issues a fresh opaque token.
  const { token, session } = await createSession(admin.id, { ip, userAgent });

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  await recordLoginAttempt({ email: normalizedEmail, ip, succeeded: true });

  if (auditLog) {
    await writeAudit({ adminId: admin.id, action: "login", entity: "admin", entityId: admin.id, ip });
  }

  return { admin: publicAdmin(admin), token, expiresAt: session.expiresAt };
}

// ---------------------------------------------------------------------------
// Administrator CRUD (OWNER-only operations, enforced by route guard)
// ---------------------------------------------------------------------------

export async function listAdmins() {
  const rows = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { sessions: true } },
    },
  });
  return rows;
}

export async function createAdmin(input, { actor, ip, auditLog = true } = {}) {
  const exists = await prisma.admin.findUnique({ where: { email: input.email } });
  if (exists) throw new ApiError(409, "CONFLICT", "An administrator with this email already exists.");

  const admin = await prisma.admin.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
      role: input.role || "ADMIN",
    },
  });

  if (auditLog) {
    await writeAudit({
      adminId: actor?.id,
      action: "admin.create",
      entity: "admin",
      entityId: admin.id,
      after: { email: admin.email, name: admin.name, role: admin.role },
      ip,
    });
  }
  return publicAdmin(admin);
}

export async function updateAdmin(id, patch, { actor, ip } = {}) {
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) throw new ApiError(404, "NOT_FOUND", "Administrator not found.");

  const before = publicAdmin(target);

  // Prevent self-demotion / self-deactivation / removing last active OWNER.
  if (patch.role !== undefined || patch.isActive === false) {
    if (target.id === actor?.id) {
      throw new ApiError(400, "SELF_MODIFICATION", "You cannot change your own role or active status here.");
    }
    const ownerCount = await prisma.admin.count({ where: { role: "OWNER", isActive: true } });
    const isLastActiveOwner = target.role === "OWNER" && target.isActive && ownerCount <= 1;
    if (isLastActiveOwner && (patch.role !== "OWNER" || patch.isActive === false)) {
      throw new ApiError(409, "LAST_OWNER", "The last active Owner cannot be demoted or disabled.");
    }
  }

  const data = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.role !== undefined) data.role = patch.role;
  if (patch.isActive !== undefined) data.isActive = patch.isActive;

  const updated = await prisma.admin.update({ where: { id }, data });
  const after = publicAdmin(updated);

  await writeAudit({
    adminId: actor?.id,
    action: "admin.update",
    entity: "admin",
    entityId: id,
    before: pick(before),
    after: pick(after),
    ip,
  });
  return after;
}

export async function deleteAdmin(id, { actor, ip } = {}) {
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) throw new ApiError(404, "NOT_FOUND", "Administrator not found.");
  if (target.id === actor?.id) {
    throw new ApiError(400, "SELF_MODIFICATION", "You cannot delete your own account.");
  }
  const ownerCount = await prisma.admin.count({ where: { role: "OWNER", isActive: true } });
  if (target.role === "OWNER" && target.isActive && ownerCount <= 1) {
    throw new ApiError(409, "LAST_OWNER", "The last active Owner cannot be deleted.");
  }

  await prisma.admin.delete({ where: { id } });
  await writeAudit({
    adminId: actor?.id,
    action: "admin.delete",
    entity: "admin",
    entityId: id,
    before: { email: target.email, name: target.name },
    ip,
  });
  return true;
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export async function changeOwnPassword(adminId, { currentPassword, newPassword }, { ip } = {}) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new ApiError(401, "UNAUTHORIZED", "Account not found.");

  if (!(await verifyPassword(admin.passwordHash, currentPassword))) {
    throw new ApiError(400, "INVALID_PASSWORD", "Current password is incorrect.");
  }
  if (currentPassword === newPassword) {
    throw new ApiError(400, "PASSWORD_UNCHANGED", "New password must differ from the current password.");
  }

  await prisma.admin.update({
    where: { id: adminId },
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
  });
  // Force re-login everywhere after a password change.
  await destroyAllSessions(adminId);
  await writeAudit({
    adminId,
    action: "password.change",
    entity: "admin",
    entityId: adminId,
    ip,
  });
  return true;
}

export async function resetAdminPassword(id, { newPassword }, { actor, ip } = {}) {
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) throw new ApiError(404, "NOT_FOUND", "Administrator not found.");
  if (target.id === actor?.id) {
    throw new ApiError(400, "SELF_MODIFICATION", "Use the account page to change your own password.");
  }

  await prisma.admin.update({
    where: { id },
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: true },
  });
  // Force re-login everywhere.
  await destroyAllSessions(id);

  await writeAudit({
    adminId: actor?.id,
    action: "password.reset",
    entity: "admin",
    entityId: id,
    ip,
  });
  return true;
}

// ---------------------------------------------------------------------------

function pick(row) {
  const { id, email, name, role, isActive, mustChangePassword } = row || {};
  return { id, email, name, role, isActive, mustChangePassword };
}