import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  INQUIRY_STATUSES,
  createInquiry,
  deleteInquiry,
  getInquiry,
  inboxStats,
  isSpamSubmission,
  listInquiries,
  replyToInquiry,
  updateInquiry,
} from "@/lib/services/inquiries";
import { renderMithraByteEmail, sendInquiryNotification, sendInquiryReply } from "@/lib/services/email";

function makeInquiry(overrides = {}) {
  return {
    name: "Jane Doe",
    email: "jane@example.com",
    company: null,
    subject: "Website project",
    message: "Hello, I would like to discuss a project with you.",
    ...overrides,
  };
}

describe("inquiry workflow (form -> database -> admin)", () => {
  it("renders a branded, escaped email template", () => {
    const html = renderMithraByteEmail({
      env: { NEXT_PUBLIC_SITE_URL: "https://mithrabyte.com" },
      eyebrow: "Response",
      title: "Hello <there>",
      content: "First line\n<script>alert(1)</script>",
    });
    expect(html).toContain("MithraByte");
    expect(html).toContain("#927FBF");
    expect(html).toContain("https://mithrabyte.com/logo.png");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("persists a public submission with metadata", async () => {
    const inquiry = await createInquiry(makeInquiry(), {
      ipHash: "ip-hash-1",
      pageRef: "/tr/contact",
      locale: "tr",
    });

    expect(inquiry.id).toBeTruthy();
    expect(inquiry.status).toBe("NEW");

    const stored = await getInquiry(inquiry.id);
    expect(stored.email).toBe("jane@example.com");
    expect(stored.locale).toBe("tr");
    expect(stored.pageRef).toBe("/tr/contact");
    expect(stored.ipHash).toBe("ip-hash-1");
  });

  it("detects honeypot spam and does not persist spam submissions", async () => {
    expect(isSpamSubmission({ honeypot: "" })).toBe(false);
    expect(isSpamSubmission({ honeypot: "   " })).toBe(false);
    expect(isSpamSubmission({ honeypot: "http://spam.example" })).toBe(true);

    // The route drops honeypot hits before calling createInquiry.
    await expect(prisma.inquiry.count()).resolves.toBe(0);
  });

  it("lists, searches and filters inquiries for the admin inbox", async () => {
    await createInquiry(makeInquiry({ email: "a@example.com" }));
    await createInquiry(makeInquiry({ name: "Bob", email: "b@example.com", message: "invoice question" }));
    const third = await createInquiry(makeInquiry({ name: "Carol", email: "c@example.com" }));
    await updateInquiry(third.id, { status: "ARCHIVED" });

    const all = await listInquiries({ page: 1, pageSize: 10, skip: 0, take: 10 });
    expect(all.total).toBe(3);

    const bySearch = await listInquiries({
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
      search: "invoice",
    });
    expect(bySearch.total).toBe(1);
    expect(bySearch.items[0].name).toBe("Bob");

    const archived = await listInquiries({
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
      status: "ARCHIVED",
    });
    expect(archived.total).toBe(1);
    expect(archived.items[0].email).toBe("c@example.com");
  });

  it("walks an inquiry through NEW -> READ -> ARCHIVED and stores an admin note", async () => {
    const inquiry = await createInquiry(makeInquiry());

    const read = await updateInquiry(inquiry.id, { status: "READ" });
    expect(read.status).toBe("READ");

    const archived = await updateInquiry(inquiry.id, {
      status: "ARCHIVED",
      adminNote: "Handled offline.",
    });
    expect(archived.status).toBe("ARCHIVED");
    expect(archived.adminNote).toBe("Handled offline.");
  });

  it("returns 404-style errors for unknown inquiries", async () => {
    await expect(getInquiry("missing-id")).rejects.toThrow();
    await expect(updateInquiry("missing-id", { status: "READ" })).rejects.toThrow();
  });

  it("aggregates per-status counts for the inbox dashboard", async () => {
    const a = await createInquiry(makeInquiry({ email: "a@example.com" }));
    await createInquiry(makeInquiry({ email: "b@example.com" }));
    await updateInquiry(a.id, { status: "READ" });

    const stats = await inboxStats();
    expect(stats.NEW).toBe(1);
    expect(stats.READ).toBe(1);
    expect(stats.TOTAL).toBe(2);
    for (const status of INQUIRY_STATUSES) {
      expect(typeof stats[status]).toBe("number");
    }
  });

  it("stores admin replies and advances a NEW inquiry", async () => {
    const inquiry = await createInquiry(makeInquiry());
    const updated = await replyToInquiry(inquiry.id, {
      subject: "Re: Website project",
      body: "Thanks for reaching out.",
      fromEmail: "admin@mithrabyte.com",
      fromName: "Admin",
    });

    expect(updated.status).toBe("IN_PROGRESS");
    expect(updated.replies).toHaveLength(1);
    expect(updated.replies[0].subject).toBe("Re: Website project");
  });

  it("never throws when email notifications are not configured", async () => {
    const inquiry = await createInquiry(makeInquiry());
    const result = await sendInquiryNotification(inquiry);
    expect(result.sent).toBe(false);
    expect(result.skipped).toBe(true);
  });

  it("keeps replies save-only when SMTP is not configured", async () => {
    const result = await sendInquiryReply(makeInquiry(), {
      subject: "Re: Website project",
      body: "Thanks for reaching out.",
    });
    expect(result.sent).toBe(false);
    expect(result.skipped).toBe(true);
  });

  it("permanently deletes an inquiry and its replies", async () => {
    const inquiry = await createInquiry(makeInquiry());
    await replyToInquiry(inquiry.id, { subject: "Re: Website project", body: "Hi" });
    expect(await prisma.inquiryReply.count({ where: { inquiryId: inquiry.id } })).toBe(1);

    await deleteInquiry(inquiry.id);

    expect(await prisma.inquiry.findUnique({ where: { id: inquiry.id } })).toBeNull();
    expect(await prisma.inquiryReply.count({ where: { inquiryId: inquiry.id } })).toBe(0);
  });

  it("refuses to delete an unknown inquiry", async () => {
    await expect(deleteInquiry("missing-id")).rejects.toThrow();
  });
});
