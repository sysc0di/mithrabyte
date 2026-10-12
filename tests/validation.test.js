import { describe, expect, it } from "vitest";
import {
  adminUpdateSchema,
  categoryUpsertSchema,
  contactSchema,
  inquiryUpdateSchema,
  loginSchema,
  pageUpsertSchema,
  productUpsertSchema,
  settingPatchSchema,
} from "@/lib/validation/schemas";

const locale = (overrides = {}) => ({
  tr: { title: "Başlık", ...overrides },
  en: { title: "Title", ...overrides },
});

describe("validation schemas", () => {
  describe("login", () => {
    it("accepts a valid email/password", () => {
      expect(() => loginSchema.parse({ email: "a@b.com", password: "x".repeat(12) })).not.toThrow();
    });
    it("rejects a malformed email", () => {
      expect(() => loginSchema.parse({ email: "nope", password: "password" })).toThrow();
    });
  });

  describe("category", () => {
    it("accepts a valid payload", () => {
      const parsed = categoryUpsertSchema.parse({
        slug: "web-dev",
        sortOrder: 1,
        isActive: true,
        locales: locale(),
      });
      expect(parsed.sortOrder).toBe(1);
    });
    it("rejects a payload missing a locale (both locales required)", () => {
      expect(() =>
        categoryUpsertSchema.parse({ slug: "web-dev", locales: { tr: { title: "X" } } })
      ).toThrow();
    });
    it("rejects extra keys (mass-assignment protection)", () => {
      expect(() =>
        categoryUpsertSchema.parse({
          slug: "web-dev",
          isActive: true,
          locales: locale(),
          adminId: "should-not-pass",
        })
      ).toThrow();
    });
    it("rejects an invalid slug", () => {
      expect(() =>
        categoryUpsertSchema.parse({ slug: "Web Dev!", locales: locale() })
      ).toThrow();
    });
  });

  describe("product", () => {
    it("accepts features and a null category", () => {
      const parsed = productUpsertSchema.parse({
        slug: "portal",
        status: "AVAILABLE",
        categoryId: null,
        locales: locale(),
        features: { tr: ["A"], en: ["A"] },
      });
      expect(parsed.features.tr).toEqual(["A"]);
    });
    it("rejects unknown statuses", () => {
      expect(() =>
        productUpsertSchema.parse({ slug: "portal", status: "BOGUS", locales: locale() })
      ).toThrow();
    });
  });

  describe("page", () => {
    it("accepts an empty title (page content may be blank in some locales)", () => {
      expect(() =>
        pageUpsertSchema.parse({
          key: "about",
          isActive: true,
          locales: { tr: { title: "" }, en: { title: "" } },
        })
      ).not.toThrow();
    });
  });

  describe("admin update", () => {
    it("rejects unauthorized fields", () => {
      expect(() =>
        adminUpdateSchema.parse({ name: "X", passwordHash: "hacked", role: "OWNER" })
      ).toThrow();
    });
    it("rejects invalid roles", () => {
      expect(() => adminUpdateSchema.parse({ role: "SUPERUSER" })).toThrow();
    });
  });

  describe("settings patch", () => {
    it("accepts max-50 value entries with unknown JSON values", () => {
      const payload = { values: Array.from({ length: 50 }, (_, i) => ({ key: `k${i}`, locale: "*", value: i % 2 ? "s" : null })) };
      expect(() => settingPatchSchema.parse(payload)).not.toThrow();
    });
    it("rejects more than 50 entries", () => {
      expect(() =>
        settingPatchSchema.parse({
          values: Array.from({ length: 51 }, () => ({ key: "x", locale: "*", value: 1 })),
        })
      ).toThrow();
    });
  });

  describe("contact", () => {
    it("accepts valid contact data", () => {
      expect(() =>
        contactSchema.parse({ name: "Jane", email: "jane@example.com", message: "hello there" })
      ).not.toThrow();
    });
    it("rejects a short message", () => {
      expect(() => contactSchema.parse({ name: "Jane", email: "jane@example.com", message: "ab" })).toThrow();
    });
    it("accepts an empty honeypot and rejects unknown fields", () => {
      expect(() =>
        contactSchema.parse({
          name: "Jane",
          email: "jane@example.com",
          message: "hello there",
          honeypot: "",
        })
      ).not.toThrow();
      expect(() =>
        contactSchema.parse({
          name: "Jane",
          email: "jane@example.com",
          message: "hello there",
          unexpected: "x",
        })
      ).toThrow();
    });
  });

  describe("inquiry status updates", () => {
    it("accepts the NEW, READ and ARCHIVED workflow statuses", () => {
      for (const status of ["NEW", "READ", "ARCHIVED"]) {
        expect(() => inquiryUpdateSchema.parse({ status })).not.toThrow();
      }
    });
    it("rejects an unknown status", () => {
      expect(() => inquiryUpdateSchema.parse({ status: "DELETED" })).toThrow();
    });
  });
});