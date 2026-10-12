import { ApiError, ok, withHandler, readJson, validate } from "@/lib/api";
import { inquiryReplySchema } from "@/lib/validation/schemas";
import { getInquiry, replyToInquiry } from "@/lib/services/inquiries";
import { sendInquiryReply } from "@/lib/services/email";
import { guard, routeId } from "@/lib/api/admin-guard";
import { writeAudit } from "@/lib/audit";

/**
 * POST /api/admin/inquiries/[id]/reply
 * Sends and persists an admin reply, then moves the inquiry out of NEW.
 */
export const dynamic = "force-dynamic";

export const POST = withHandler(async (req, ctx) => {
  const { admin } = await guard(req, { mutation: true });
  const id = await routeId(ctx);
  const json = await readJson(req);
  const data = validate(inquiryReplySchema, json);

  const inquiry = await getInquiry(id);
  const reply = {
    subject: data.subject,
    body: data.body,
    fromEmail: admin.email,
    fromName: admin.name,
  };
  const delivery = await sendInquiryReply(inquiry, reply);
  if (!delivery.sent && !delivery.skipped) {
    throw new ApiError(
      502,
      "SMTP_DELIVERY_FAILED",
      "The reply could not be delivered. Check the Hostinger SMTP settings and try again."
    );
  }

  const item = await replyToInquiry(id, reply);

  await writeAudit({
    adminId: admin.id,
    action: "inquiry.reply",
    entity: "inquiry",
    entityId: id,
    after: { subject: data.subject },
  });
  return ok({ item, delivered: delivery.sent });
});
