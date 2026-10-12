import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createAdmin } from "@/lib/services/auth";
import { createSession } from "@/lib/auth/session";
import { createInquiry } from "@/lib/services/inquiries";
import { SESSION_COOKIE } from "@/lib/constants";
import { GET as listInquiriesRoute } from "@/app/api/admin/inquiries/route";
import { GET as getStatsRoute } from "@/app/api/admin/inquiries/stats/route";
import {
  GET as getInquiryRoute,
  PATCH as patchInquiryRoute,
} from "@/app/api/admin/inquiries/[id]/route";
import { POST as replyRoute } from "@/app/api/admin/inquiries/[id]/reply/route";

const password = "correct-horse-battery-staple";

async function authedCookie() {
  const admin = await createAdmin(
    { email: "owner@test.dev", name: "Owner", password, role: "OWNER" },
    { auditLog: false }
  );
  const { token } = await createSession(admin.id, {});
  return `${SESSION_COOKIE}=${token}`;
}

function adminRequest(url, cookie, { method = "GET", body } = {}) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function ctx(id) {
  return { params: Promise.resolve({ id }) };
}

describe("admin inquiry endpoints (auth + workflow)", () => {
  it("rejects unauthenticated access to the inbox", async () => {
    const res = await listInquiriesRoute(adminRequest("/api/admin/inquiries", null));
    expect(res.status).toBe(401);
  });

  it("lists inquiries and returns per-status stats when authenticated", async () => {
    await createInquiry({ name: "Jane", email: "jane@example.com", message: "Hello there friend." });
    const cookie = await authedCookie();

    const res = await listInquiriesRoute(
      adminRequest("/api/admin/inquiries?search=jane", cookie)
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.total).toBe(1);
    expect(json.data.stats.NEW).toBe(1);

    const statsRes = await getStatsRoute(adminRequest("/api/admin/inquiries/stats", cookie));
    expect((await statsRes.json()).data.TOTAL).toBe(1);
  });

  it("updates an inquiry status (NEW -> READ -> ARCHIVED) over HTTP", async () => {
    const inquiry = await createInquiry({
      name: "Jane",
      email: "jane@example.com",
      message: "Hello there friend.",
    });
    const cookie = await authedCookie();

    const readRes = await patchInquiryRoute(
      adminRequest(`/api/admin/inquiries/${inquiry.id}`, cookie, {
        method: "PATCH",
        body: { status: "READ" },
      }),
      ctx(inquiry.id)
    );
    expect(readRes.status).toBe(200);
    expect((await readRes.json()).data.item.status).toBe("READ");

    const archiveRes = await patchInquiryRoute(
      adminRequest(`/api/admin/inquiries/${inquiry.id}`, cookie, {
        method: "PATCH",
        body: { status: "ARCHIVED" },
      }),
      ctx(inquiry.id)
    );
    expect((await archiveRes.json()).data.item.status).toBe("ARCHIVED");
  });

  it("rejects an unauthenticated status change", async () => {
    const inquiry = await createInquiry({
      name: "Jane",
      email: "jane@example.com",
      message: "Hello there friend.",
    });
    const res = await patchInquiryRoute(
      adminRequest(`/api/admin/inquiries/${inquiry.id}`, null, {
        method: "PATCH",
        body: { status: "READ" },
      }),
      ctx(inquiry.id)
    );
    expect(res.status).toBe(401);
  });

  it("persists an admin reply and advances the inquiry", async () => {
    const inquiry = await createInquiry({
      name: "Jane",
      email: "jane@example.com",
      message: "Hello there friend.",
    });
    const cookie = await authedCookie();

    const res = await replyRoute(
      adminRequest(`/api/admin/inquiries/${inquiry.id}/reply`, cookie, {
        method: "POST",
        body: { subject: "Re: hello", body: "Thanks for reaching out." },
      }),
      ctx(inquiry.id)
    );
    expect(res.status).toBe(200);
    const item = (await res.json()).data.item;
    expect(item.status).toBe("IN_PROGRESS");
    expect(item.replies).toHaveLength(1);
  });

  it("exposes full message detail via GET [id]", async () => {
    const inquiry = await createInquiry({
      name: "Jane",
      email: "jane@example.com",
      message: "Hello there friend.",
    });
    const cookie = await authedCookie();

    const res = await getInquiryRoute(
      adminRequest(`/api/admin/inquiries/${inquiry.id}`, cookie),
      ctx(inquiry.id)
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data.item.message).toBe("Hello there friend.");
    expect(await prisma.inquiry.count()).toBe(1);
  });
});
