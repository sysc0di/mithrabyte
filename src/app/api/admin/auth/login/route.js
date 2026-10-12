import { ok, withHandler, readJson, validate, assertSameOrigin } from "@/lib/api";
import { loginSchema } from "@/lib/validation/schemas";
import { login } from "@/lib/services/auth";
import { getRequestIp, sessionCookieOptions } from "@/lib/auth/session";

/**
 * POST /api/admin/auth/login
 * Brute-force protected via DB-backed rate limiting + Argon2id verification.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req) => {
  assertSameOrigin(req);

  const json = await readJson(req);
  const data = validate(loginSchema, json);

  const { admin, token, expiresAt } = await login({
    email: data.email,
    password: data.password,
    ip: getRequestIp(req),
    userAgent: req.headers.get("user-agent") || "",
    auditLog: true,
  });

  const res = ok({ admin, expiresAt });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
});