import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/constants";
import { sha256 } from "@/lib/utils/server";
import { ApiError } from "@/lib/api";

/**
 * Opaque, server-validated session management.
 *
 * Design (mirrors proven frameworks such as Django/Laravel/Rails):
 *  - A fresh 256-bit random token is issued at login (session rotation).
 *  - Only its SHA-256 digest is stored server-side; the raw token travels in
 *    an HttpOnly cookie, so a leaked database cannot forge sessions.
 *  - Every admin route re-validates token + expiry + active admin server-side.
 */

export function sessionTtlMs() {
  return getEnv().ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: getEnv().ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

/** Creates a new session for an admin (used on login). */
export async function createSession(adminId, { ip, userAgent } = {}) {
  const token = randomBytes(32).toString("hex");
  const session = await prisma.adminSession.create({
    data: {
      tokenHash: sha256(token),
      adminId,
      ipAddress: ip ? ip.slice(0, 64) : null,
      userAgent: userAgent ? userAgent.slice(0, 300) : null,
      expiresAt: new Date(Date.now() + sessionTtlMs()),
    },
  });
  return { token, session };
}

/** Resolves a request to an active session + admin, or throws 401. */
export async function getSession(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const token = parseCookie(cookieHeader)[SESSION_COOKIE];
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { admin: true },
  });

  if (!session) throw new ApiError(401, "UNAUTHORIZED", "Invalid or expired session.");
  if (session.expiresAt <= new Date()) throw new ApiError(401, "UNAUTHORIZED", "Session expired.");
  if (!session.admin.isActive) throw new ApiError(403, "ACCOUNT_DISABLED", "This administrator account is disabled.");

  return { token, session, admin: session.admin };
}

/** Guards an admin route handler. Returns { admin, session }. */
export async function requireAdmin(req) {
  return getSession(req);
}

/** Destroys a single session (logout). Returns when it existed. */
export async function destroySessionByToken(token) {
  if (!token) return false;
  const deleted = await prisma.adminSession.deleteMany({
    where: { tokenHash: sha256(token) },
  });
  return deleted.count > 0;
}

/** Destroys every session for an admin (used after password change). */
export async function destroyAllSessions(adminId, exceptToken) {
  const where = { adminId };
  if (exceptToken) where.NOT = { tokenHash: sha256(exceptToken) };
  await prisma.adminSession.deleteMany({ where });
}

export { SESSION_COOKIE };

function parseCookie(cookieHeader) {
  const out = {};
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

/** Best-effort extraction of a client IP from request metadata/headers. */
export function getRequestIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}