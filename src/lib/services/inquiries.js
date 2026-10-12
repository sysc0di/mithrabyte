import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";

/**
 * Contact inquiry workflow: submission (public), administration (inbox),
 * status management, and stored replies. Optional email notification is
 * best-effort only — persistence always happens first.
 */

/** Canonical inquiry statuses, ordered by workflow progression. */
export const INQUIRY_STATUSES = [
  "NEW",
  "READ",
  "IN_PROGRESS",
  "RESOLVED",
  "SPAM",
  "ARCHIVED",
];

/**
 * Basic spam heuristic for public submissions. A filled honeypot field is the
 * strongest signal; we treat those as bots and drop them without persisting.
 */
export function isSpamSubmission(data) {
  return typeof data?.honeypot === "string" && data.honeypot.trim().length > 0;
}

export async function createInquiry(input, { ipHash, pageRef, locale } = {}) {
  return prisma.inquiry.create({
    data: {
      ...input,
      pageRef: pageRef || input.pageRef,
      locale: locale || input.locale || null,
      ipHash,
    },
  });
}

export async function listInquiries({ page, pageSize, skip, take, status, search } = {}) {
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { replies: true } } },
      skip,
      take,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getInquiry(id) {
  const item = await prisma.inquiry.findUnique({
    where: { id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
  });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Inquiry not found.");
  return item;
}

export async function updateInquiry(id, patch) {
  const item = await prisma.inquiry.findUnique({ where: { id } });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Inquiry not found.");

  const { status, adminNote } = patch;
  const data = {};
  if (status !== undefined) data.status = status;
  if (adminNote !== undefined) data.adminNote = adminNote;

  await prisma.inquiry.update({ where: { id }, data });
  return getInquiry(id);
}

/**
 * Records an admin reply. Delivery (email) is implemented in Phase 3; the
 * reply is persisted and the inquiry is moved out of NEW automatically.
 */
export async function replyToInquiry(id, { subject, body, fromEmail, fromName }) {
  const item = await prisma.inquiry.findUnique({ where: { id } });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Inquiry not found.");

  await prisma.inquiryReply.create({
    data: {
      inquiryId: id,
      subject,
      body,
      fromEmail: fromEmail || "contact@mithrabyte.com",
      fromName: fromName || "Mithrabyte",
    },
  });

  if (item.status === "NEW") {
    await prisma.inquiry.update({ where: { id }, data: { status: "IN_PROGRESS" } });
  }

  return getInquiry(id);
}

export async function inboxStats() {
  const counts = await prisma.inquiry.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const stats = Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, 0]));
  for (const row of counts) stats[row.status] = row._count._all;
  stats.TOTAL = INQUIRY_STATUSES.reduce((sum, s) => sum + stats[s], 0);
  return stats;
}