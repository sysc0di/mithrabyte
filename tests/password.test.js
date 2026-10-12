import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing (argon2id)", () => {
  it("round-trips a valid password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, "correct horse battery staple")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword(hash, "wrong password")).toBe(false);
  });

  it("cannot verify a weak/empty hash (returns false, never throws)", async () => {
    expect(await verifyPassword("", "anything")).toBe(false);
    expect(await verifyPassword("not-a-hash", "anything")).toBe(false);
  });
});