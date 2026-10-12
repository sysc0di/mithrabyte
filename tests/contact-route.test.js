import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { POST } from "@/app/api/contact/route";

function makeRequest(body, { ip = "203.0.113.7" } = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "I would like to discuss a project.",
  locale: "en",
  pageRef: "/en/contact",
  subject: "Support",
};

describe("POST /api/contact", () => {
  it("validates, stores the submission and returns 201", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.id).toBeTruthy();

    const stored = await prisma.inquiry.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0].email).toBe("jane@example.com");
    expect(stored[0].subject).toBe("Support");
    expect(stored[0].status).toBe("NEW");
    expect(stored[0].locale).toBe("en");
  });

  it("silently drops honeypot spam without persisting", async () => {
    const res = await POST(
      makeRequest({ ...validBody, honeypot: "http://spam.example" })
    );
    expect(res.status).toBe(201);
    await expect(prisma.inquiry.count()).resolves.toBe(0);
  });

  it("rejects invalid submissions with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, message: "ab" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    await expect(prisma.inquiry.count()).resolves.toBe(0);
  });

  it("rate limits abusive clients", async () => {
    let blockedAt = null;
    for (let i = 0; i < 15; i += 1) {
      const res = await POST(makeRequest({ ...validBody, message: `message number ${i}` }));
      if (res.status === 429) {
        blockedAt = i;
        break;
      }
    }
    expect(blockedAt).not.toBeNull();
    expect(blockedAt).toBeLessThanOrEqual(10);
  });
});
