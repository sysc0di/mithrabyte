import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { getReport, snapshotPath } from "@/lib/services/analytics";

const DAY_MS = 24 * 60 * 60 * 1000;

function utcMidday(base) {
  return new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 12)
  );
}

async function seedEvent(name, day, path = "/home") {
  return prisma.analyticsEvent.create({
    data: {
      name,
      path: snapshotPath(path),
      referrer: null,
      locale: "en",
      device: "desktop",
      sessionId: null,
      createdAt: utcMidday(day),
    },
  });
}

describe("analytics report", () => {
  it("aggregates pageviews per day across the requested range", async () => {
    const today = utcMidday(new Date());
    const yesterday = new Date(today.getTime() - DAY_MS);
    const twoDaysAgo = new Date(today.getTime() - 2 * DAY_MS);

    await seedEvent("pageview", today);
    await seedEvent("pageview", today);
    await seedEvent("pageview", yesterday);
    await seedEvent("pageview", yesterday);
    await seedEvent("custom", yesterday);

    const report = await getReport({
      from: new Date(twoDaysAgo.getTime() - DAY_MS).toISOString(),
      to: new Date(today.getTime() + DAY_MS).toISOString(),
    });

    expect(report.totals.pageviews).toBe(4);
    expect(report.totals.events).toBe(5);
    expect(report.topPages).toContainEqual({ path: "/home", count: 5 });

    const byDay = new Map(report.series.map((s) => [s.day, s.count]));
    expect(byDay.get(today.toISOString().slice(0, 10))).toBe(2);
    expect(byDay.get(yesterday.toISOString().slice(0, 10))).toBe(3);
    expect(byDay.get(twoDaysAgo.toISOString().slice(0, 10))).toBe(0);
  });
});