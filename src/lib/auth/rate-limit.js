import { prisma } from "@/lib/db";
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from "@/lib/constants";
import { ApiError } from "@/lib/api";
import { hashIp } from "@/lib/utils/server";

/**
 * Database-backed rate limiting. No Redis required: suitable for the
 * low-write single-admin footprint of this deployment.
 */

/** Returns true when the given email+IP is currently blocked. */
export async function isLoginBlocked({ email, ip }) {
  const ipHash = hashIp(ip || "");
  const since = new Date(Date.now() - LOGIN_WINDOW_MS);

  const emailCount = email
    ? await prisma.loginAttempt.count({
        where: { email: email.toLowerCase(), createdAt: { gte: since }, succeeded: false },
      })
    : 0;

  let ipCount = 0;
  if (ipHash) {
    ipCount = await prisma.loginAttempt.count({
      where: { ipHash, createdAt: { gte: since }, succeeded: false },
    });
  }

  return { blocked: emailCount >= LOGIN_MAX_ATTEMPTS || ipCount >= LOGIN_MAX_ATTEMPTS, emailCount, ipCount };
}

export async function recordLoginAttempt({ email, ip, succeeded }) {
  await prisma.loginAttempt.create({
    data: {
      email: email ? email.toLowerCase() : "unknown",
      ipHash: hashIp(ip || ""),
      succeeded,
    },
  });
}

export async function enforceGenericLimit({ ip, limit, windowMs, scope }) {
  const ipHash = hashIp(ip || "");
  if (!ipHash) return;
  const since = new Date(Date.now() - windowMs);

  await prisma.requestLog.create({ data: { scope, ipHash } });
  const count = await prisma.requestLog.count({
    where: { scope, ipHash, createdAt: { gte: since } },
  });

  if (count >= limit) {
    throw new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later.");
  }
}