
/**
 * Shared application constants. Server-only (imported by API/services).
 */

/** Locales supported by the public website content layer. */
export const SUPPORTED_LOCALES = ["tr", "en"];

/** Sentinel locale for non-localized setting values. */
export const GLOBAL_LOCALE = "*";

/** Session cookie name. Must be lowercase, no spaces. */
export const SESSION_COOKIE = "mb_admin_session";

/** Maximum accepted request body size for public/validated endpoints (bytes). */
export const BODY_LIMIT = 64 * 1024; // 64 KiB

/** Login rate limiting: max attempts per email+IP within the window. */
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Public contact endpoint rate-limit window. */
export const CONTACT_WINDOW_MS = 60 * 60 * 1000;

/** Analytics ingestion rate-limit window. */
export const ANALYTICS_WINDOW_MS = 60 * 1000;

/** Maximum page size for paginated admin listings. */
export const MAX_PAGE_SIZE = 100;
