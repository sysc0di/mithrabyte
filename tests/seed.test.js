import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { runSeed } from "../prisma/seed.js";

describe("database seed", () => {
  it("creates the initial owner and core settings", async () => {
    const result = await runSeed();
    expect(result.admin.email).toBe(process.env.ADMIN_INIT_EMAIL);
    expect(result.admin.role).toBe("OWNER");

    const keys = await prisma.setting.findMany({ select: { key: true }, orderBy: { key: "asc" } });
    expect(keys.map((k) => k.key)).toEqual(
      expect.arrayContaining(["system.locales", "site.name", "site.contact", "social.links"])
    );
  });

  it("is idempotent: reruns never reset the admin password or duplicate records", async () => {
    await runSeed();
    const before = await prisma.admin.findUnique({ where: { email: process.env.ADMIN_INIT_EMAIL } });

    await runSeed();

    expect(await prisma.admin.count()).toBe(1);
    const after = await prisma.admin.findUnique({ where: { email: process.env.ADMIN_INIT_EMAIL } });
    expect(after.passwordHash).toBe(before.passwordHash);

    for (const key of ["system.locales", "site.name", "site.contact", "social.links"]) {
      expect(await prisma.setting.count({ where: { key } })).toBe(1);
    }
  });
});