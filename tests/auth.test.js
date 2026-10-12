import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { createAdmin, deleteAdmin, login, publicAdmin, updateAdmin, changeOwnPassword, resetAdminPassword } from "@/lib/services/auth";
import { LOGIN_MAX_ATTEMPTS } from "@/lib/constants";

const password = "correct-horse-battery-staple";

async function seedAdmin(overrides = {}) {
  return createAdmin(
    { email: "admin@test.dev", name: "Test Admin", password, role: "OWNER", ...overrides },
    { auditLog: false }
  );
}

async function attemptLogin(email = "admin@test.dev", pass = password, ip = "10.0.0.1") {
  return login({ email, password: pass, ip, auditLog: false });
}

describe("auth service", () => {
  it("creates an admin without exposing the password hash", async () => {
    const admin = await seedAdmin();
    expect(admin.passwordHash).toBeUndefined();
    expect(admin.email).toBe("admin@test.dev");
    expect(publicAdmin({ passwordHash: "secret", email: "x" }).passwordHash).toBeUndefined();
  });

  it("logs in a valid admin and creates a session (session rotation)", async () => {
    await seedAdmin();
    const { admin, token, expiresAt } = await attemptLogin();
    expect(token).toHaveLength(64);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const session = await prisma.adminSession.findFirst({ where: { adminId: admin.id } });
    expect(session).not.toBeNull();
    // Raw token must never be stored — only its SHA-256 digest.
    expect(session.tokenHash).not.toBe(token);
    expect(session.tokenHash).toHaveLength(64);
  });

  it("rejects a wrong password without creating a session", async () => {
    await seedAdmin();
    await expect(attemptLogin("admin@test.dev", "wrong-password")).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
    expect(await prisma.adminSession.count()).toBe(0);
  });

  it("blocks the account+IP after repeated failures", async () => {
    await seedAdmin();
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i += 1) {
      await expect(attemptLogin("admin@test.dev", "wrong-password", "10.1.1.5")).rejects.toMatchObject({
        status: 401,
      });
    }
    await expect(attemptLogin("admin@test.dev", password, "10.1.1.5")).rejects.toMatchObject({
      status: 429,
      code: "TOO_MANY_ATTEMPTS",
    });
  });

  it("logs in with a fresh IP once the block window is not hit", async () => {
    await seedAdmin();
    await expect(attemptLogin("admin@test.dev", "wrong-password", "10.1.1.6")).rejects.toMatchObject({ status: 401 });
    const res = await attemptLogin("admin@test.dev", password, "10.1.1.6");
    expect(res.token).toHaveLength(64);
  });

  it("changing your own password revokes all sessions", async () => {
    const admin = await seedAdmin();
    const { token } = await attemptLogin();
    expect(await prisma.adminSession.count({ where: { adminId: admin.id } })).toBe(1);

    await changeOwnPassword(admin.id, { currentPassword: password, newPassword: "a-new-password-123" });
    expect(await prisma.adminSession.count({ where: { adminId: admin.id } })).toBe(0);
    expect(token.length).toBe(64);

    // Old password no longer works.
    await expect(attemptLogin("admin@test.dev", password)).rejects.toMatchObject({ status: 401 });
    await expect(attemptLogin("admin@test.dev", "a-new-password-123")).resolves.toBeTruthy();
  });

  it("rejects changing your password with the wrong current password", async () => {
    const admin = await seedAdmin();
    await expect(
      changeOwnPassword(admin.id, { currentPassword: "not-current", newPassword: "brand-new-pass-1" })
    ).rejects.toMatchObject({ status: 400, code: "INVALID_PASSWORD" });
  });

  it("prevents last-Owner demotion/deletion and self-modification", async () => {
    const owner = await seedAdmin();
    const staff = await createAdmin(
      { email: "staff@test.dev", name: "Staff", password, role: "ADMIN" },
      { auditLog: false }
    );

    // A non-owner cannot demote or delete the last remaining Owner.
    await expect(
      updateAdmin(owner.id, { role: "ADMIN" }, { actor: staff })
    ).rejects.toMatchObject({ status: 409, code: "LAST_OWNER" });
    await expect(deleteAdmin(owner.id, { actor: staff })).rejects.toMatchObject({
      status: 409,
      code: "LAST_OWNER",
    });

    // Owners cannot demote or delete themselves.
    await expect(
      updateAdmin(owner.id, { role: "ADMIN" }, { actor: owner })
    ).rejects.toMatchObject({ status: 400, code: "SELF_MODIFICATION" });
    await expect(deleteAdmin(owner.id, { actor: owner })).rejects.toMatchObject({
      status: 400,
      code: "SELF_MODIFICATION",
    });
  });

  it("supports resetting another admin's password (forces change + revokes sessions)", async () => {
    const owner = await seedAdmin();
    const target = await createAdmin(
      { email: "staff@test.dev", name: "Staff", password, role: "ADMIN" },
      { auditLog: false }
    );
    await changeOwnPassword(target.id, { currentPassword: password, newPassword: "staff-new-pass-1" });
    const { token } = await attemptLogin("staff@test.dev", "staff-new-pass-1");
    expect(token).toHaveLength(64);

    await resetAdminPassword(target.id, { newPassword: "reset-by-owner-1" }, { actor: owner });
    const updated = await prisma.admin.findUnique({ where: { id: target.id } });
    expect(updated.mustChangePassword).toBe(true);
    expect(await prisma.adminSession.count({ where: { adminId: target.id } })).toBe(0);
  });
});