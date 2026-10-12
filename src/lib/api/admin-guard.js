import { requireAdmin } from "@/lib/auth/session";
import { assertSameOrigin, ApiError } from "@/lib/api";

/**
 * Shared guard for protected admin routes.
 *  - full server-side session validation (opaque token, expiry, active admin)
 *  - origin/CSRF check for all state-changing requests
 *  - authorization helpers for OWNER-only management.
 */
export async function guard(req, { mutation = false } = {}) {
  if (mutation) assertSameOrigin(req);
  const { admin, session } = await requireAdmin(req);
  return { admin, session };
}

export function assertOwner(admin) {
  if (admin.role !== "OWNER") {
    throw new ApiError(403, "FORBIDDEN", "Owner privileges are required for this operation.");
  }
  return admin;
}

/** Extracts the `id` path param (Next 16 passes params as a Promise). */
export async function routeId(ctx) {
  const params = await ctx.params;
  return params?.id;
}