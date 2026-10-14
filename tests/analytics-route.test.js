import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { POST } from "@/app/api/analytics/route";
import { getReport } from "@/lib/services/analytics";

function makeRequest(body, { ip = "203.0.113.9" } = {}) {
  return new Request("http://localhost/api/analytics", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "pageview",
  path: "/en/packages?utm=test",
  referrer: "https://google.com/",
  locale: "en",
  device: "desktop",
  sessionId: "sess-123",
};

describe("POST /api/analytics", () => {
  it("stores a pageview and returns 201", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.id).toBeTruthy();

    const stored = await prisma.analyticsEvent.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("pageview");
    expect(stored[0].path).toBe("/en/packages?utm=test");
    expect(stored[0].referrer).toBe("https://google.com/");
    expect(stored[0].locale).toBe("en");
    expect(stored[0].device).toBe("desktop");
    expect(stored[0].sessionId).toBe("sess-123");
    expect(stored[0].ipHash).toBeTruthy();
  });

  it("defaults name and path when omitted", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);

    const stored = await prisma.analyticsEvent.findFirst();
    expect(stored.name).toBe("pageview");
    expect(stored.path).toBe("/");
  });

  it("rejects an unknown device value with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, device: "toaster" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    await expect(prisma.analyticsEvent.count()).resolves.toBe(0);
  });

  it("rejects unknown fields (strict schema)", async () => {
    const res = await POST(makeRequest({ ...validBody, sneaky: "x" }));
    expect(res.status).toBe(400);
    await expect(prisma.analyticsEvent.count()).resolves.toBe(0);
  });

  it("records an event that the admin report can then read back", async () => {
    await POST(makeRequest(validBody));

    const report = await getReport({});
    expect(report.totals.pageviews).toBe(1);
    expect(report.topPages).toContainEqual({ path: "/en/packages?utm=test", count: 1 });
    expect(report.topReferrers).toContainEqual({ referrer: "https://google.com/", count: 1 });
    expect(report.recent[0]).toMatchObject({
      name: "pageview",
      path: "/en/packages?utm=test",
      locale: "en",
      device: "desktop",
    });
  });
});
