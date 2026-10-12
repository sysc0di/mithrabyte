import { NextResponse } from "next/server";
import { z } from "zod";
import { BODY_LIMIT, MAX_PAGE_SIZE } from "@/lib/constants";

/**
 * Consistent API response envelope:
 *   success -> { ok: true, data }
 *   error   -> { ok: false, error: { code, message, issues? } }
 */

export class ApiError extends Error {
  constructor(status, code, message, issues) {
    super(message);
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

export function ok(data, init) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(status, code, message, issues) {
  return NextResponse.json(
    { ok: false, error: { code, message, issues } },
    { status }
  );
}

/** Reads and parses a JSON body with an explicit size limit. */
export async function readJson(req, { limit = BODY_LIMIT } = {}) {
  const encoding = req.headers.get("content-encoding");
  const length = Number(req.headers.get("content-length") || 0);

  if (!Number.isNaN(length) && length > limit) {
    throw new ApiError(413, "BODY_TOO_LARGE", `Request body exceeds ${limit} bytes.`);
  }
  if (encoding === "gzip" || encoding === "deflate" || encoding === "br") {
    throw new ApiError(415, "UNSUPPORTED_ENCODING", "Compressed request bodies are not accepted.");
  }

  const text = await req.text();
  if (text.length > limit) {
    throw new ApiError(413, "BODY_TOO_LARGE", `Request body exceeds ${limit} bytes.`);
  }
  if (text.length === 0) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}

/** Validates untrusted data against a zod schema. Throws ApiError(400) on failure. */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    throw new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", issues);
  }
  return result.data;
}

/** Normalizes pagination query params. */
export function pageParams(searchParams, defaultSize = 20) {
  const rawPage = Number(searchParams.get("page"));
  const rawSize = Number(searchParams.get("pageSize"));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize =
    Number.isInteger(rawSize) && rawSize >= 1 ? Math.min(rawSize, MAX_PAGE_SIZE) : defaultSize;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** Wraps a route-handler body with standardized error handling. */
export function withHandler(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

export function toErrorResponse(err) {
  if (err instanceof ApiError) {
    return fail(err.status, err.code, err.message, err.issues);
  }

  // Prisma error mapping (avoid leaking internals).
  if (err && typeof err === "object") {
    const code = err.code;
    if (code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "a unique field";
      return fail(409, "CONFLICT", `A record with the same ${target} already exists.`);
    }
    if (code === "P2025") {
      return fail(404, "NOT_FOUND", "The requested record does not exist.");
    }
    if (code === "P2003") {
      return fail(409, "CONFLICT", "The operation conflicts with existing records.");
    }
  }

  console.error("[api] unhandled error:", err);
  return fail(500, "INTERNAL_ERROR", "An unexpected error occurred.");
}

/** Server-side CSRF defense-in-depth: validate Origin / Sec-Fetch-Site. */
export function assertSameOrigin(req) {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  const secFetchSite = req.headers.get("sec-fetch-site");
  const forwardedHost = req.headers.get("x-forwarded-host");

  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
    throw new ApiError(403, "CROSS_ORIGIN", "Cross-origin requests are not allowed.");
  }
  if (origin) {
    const hostToMatch = forwardedHost || host;
    try {
      const originHost = new URL(origin).host;
      if (originHost !== hostToMatch) {
        throw new ApiError(403, "CROSS_ORIGIN", "Cross-origin requests are not allowed.");
      }
    } catch {
      throw new ApiError(403, "CROSS_ORIGIN", "Invalid Origin header.");
    }
  }
}

export const zod = z;