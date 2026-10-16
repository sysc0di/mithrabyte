/**
 * Cookie consent storage and pure helpers. Client-safe: never touches the DOM at
 * import time, so it can be imported by server and client modules alike.
 *
 * The stored record is what proves consent: it carries the policy version and
 * the moment it was given. No optional category is ever enabled by default, and
 * the absence of a record is treated as "not consented" (never as consent).
 */

export const CONSENT_STORAGE_KEY = "mb_cookie_consent";

/** Bump when categories or policy text change to re-request consent. */
export const CONSENT_VERSION = 1;

/** Optional categories, all default off. `necessary` is always implied. */
export const OPTIONAL_CATEGORIES = ["analytics"];

/** Parse a raw stored value into a valid consent record, or null. */
export function parseConsent(raw) {
  if (!raw) return null;
  let data;
  try {
    data = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  if (data.version !== CONSENT_VERSION) return null;
  const analytics = data.categories?.analytics === true;
  return {
    version: CONSENT_VERSION,
    timestamp: typeof data.timestamp === "string" ? data.timestamp : null,
    categories: { analytics },
  };
}

export function serializeConsent(categories) {
  return JSON.stringify({
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: { analytics: categories?.analytics === true },
  });
}

/** Reads persisted consent. Returns null when absent or stale. Client-only. */
export function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}
