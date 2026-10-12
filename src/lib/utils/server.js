import { createHash } from "node:crypto";

/**
 * One-way hash of a client IP used for rate limiting and audit records.
 * Best-effort privacy: an IP space is small, so treat the value as pseudonymous.
 */
export function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.PRIVACY_SALT || "";
  return createHash("sha256").update(`${salt}${ip}`).digest("hex");
}

/** sha256 hex digest helper (e.g. for session tokens before storage). */
export function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}