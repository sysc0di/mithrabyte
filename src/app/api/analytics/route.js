import { withHandler, ok, readJson, validate } from "@/lib/api";
import { analyticsSchema } from "@/lib/validation/schemas";
import { ingestEvent } from "@/lib/services/analytics";
import { enforceGenericLimit } from "@/lib/auth/rate-limit";
import { getRequestIp } from "@/lib/auth/session";
import { hashIp } from "@/lib/utils/server";
import { getEnv } from "@/lib/env";
import { ANALYTICS_WINDOW_MS } from "@/lib/constants";

/**
 * POST /api/analytics — first-party analytics event ingestion.
 * No raw IPs are stored. Rate limited per IP.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req) => {
  const ip = getRequestIp(req);
  await enforceGenericLimit({
    ip,
    limit: getEnv().ANALYTICS_RATE_LIMIT,
    windowMs: ANALYTICS_WINDOW_MS,
    scope: "analytics",
  });

  const json = await readJson(req);
  const data = validate(analyticsSchema, json);

  const event = await ingestEvent(data, { ipHash: hashIp(ip) });
  return ok({ id: event.id }, { status: 201 });
});