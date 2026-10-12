import { withHandler, ok, readJson, validate } from "@/lib/api";
import { contactSchema } from "@/lib/validation/schemas";
import { createInquiry, isSpamSubmission } from "@/lib/services/inquiries";
import { sendInquiryNotification } from "@/lib/services/email";
import { enforceGenericLimit } from "@/lib/auth/rate-limit";
import { getRequestIp } from "@/lib/auth/session";
import { hashIp } from "@/lib/utils/server";
import { getEnv } from "@/lib/env";
import { CONTACT_WINDOW_MS } from "@/lib/constants";

/**
 * POST /api/contact — public contact submission.
 * Rate limited per IP; validated server-side; stores the inquiry for the admin
 * inbox. Optional email notification is best-effort and never blocks storage.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req) => {
  const ip = getRequestIp(req);
  await enforceGenericLimit({
    ip,
    limit: getEnv().CONTACT_RATE_LIMIT,
    windowMs: CONTACT_WINDOW_MS,
    scope: "contact",
  });

  const json = await readJson(req);
  const data = validate(contactSchema, json);

  // Basic spam protection: a filled honeypot is a bot. Acknowledge without
  // persisting so automated clients get no signal that they were filtered.
  if (isSpamSubmission(data)) {
    return ok({ id: null }, { status: 201 });
  }

  const inquiry = await createInquiry(
    {
      name: data.name,
      email: data.email,
      company: data.company || null,
      subject: data.subject || null,
      message: data.message,
    },
    {
      ipHash: hashIp(ip),
      pageRef: data.pageRef || null,
      locale: data.locale || null,
    }
  );

  // Persistence already succeeded; never let a notification failure surface.
  try {
    await sendInquiryNotification(inquiry);
  } catch (err) {
    console.error("[contact] notification dispatch failed:", err);
  }

  return ok({ id: inquiry.id }, { status: 201 });
});