import { describe, expect, it } from "vitest";
import {
  parseConsent,
  serializeConsent,
  CONSENT_VERSION,
} from "@/lib/cookie-consent";

describe("cookie consent", () => {
  it("never enables an optional category by default", () => {
    const consent = parseConsent(serializeConsent({}));
    expect(consent).not.toBeNull();
    expect(consent.categories.analytics).toBe(false);
  });

  it("round-trips an accepted preference with version and timestamp", () => {
    const consent = parseConsent(serializeConsent({ analytics: true }));
    expect(consent.categories.analytics).toBe(true);
    expect(consent.version).toBe(CONSENT_VERSION);
    expect(typeof consent.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(consent.timestamp))).toBe(false);
  });

  it("treats a missing record as no consent", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
    expect(parseConsent("")).toBeNull();
  });

  it("treats malformed storage as no consent", () => {
    expect(parseConsent("not json")).toBeNull();
    expect(parseConsent(JSON.stringify("string"))).toBeNull();
  });

  it("re-asks for consent when the policy version changes", () => {
    const stale = JSON.stringify({
      version: CONSENT_VERSION - 1,
      timestamp: "2024-01-01T00:00:00.000Z",
      categories: { analytics: true },
    });
    expect(parseConsent(stale)).toBeNull();
  });

  it("does not treat an unset category as granted", () => {
    const consent = parseConsent(
      JSON.stringify({ version: CONSENT_VERSION, categories: {} })
    );
    expect(consent.categories.analytics).toBe(false);
  });
});
