import { prisma } from "@/lib/db";

/**
 * First-party analytics: event ingestion (public) and reporting (admin).
 * No raw IPs are stored — only a hash. Aggregations are query-time with
 * indexed columns; materialized daily aggregates arrive with Phase 4.
 */

export function snapshotPath(path) {
  const clean = String(path || "/").slice(0, 500);
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export async function ingestEvent(event, { ipHash } = {}) {
  const { props } = event;
  const cleanedProps = props
    ? Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))
    : undefined;

  return prisma.analyticsEvent.create({
    data: {
      name: event.name,
      path: snapshotPath(event.path),
      referrer: event.referrer || null,
      locale: event.locale || null,
      device: event.device || null,
      sessionId: event.sessionId || null,
      ipHash,
      props: cleanedProps,
    },
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getReport({ from, to } = {}) {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * DAY_MS);

  const where = { createdAt: { gte: fromDate, lte: toDate } };

  const [pageviews, events, pages, referrers, daily, recent] = await prisma.$transaction([
    prisma.analyticsEvent.count({ where: { ...where, name: "pageview" } }),
    prisma.analyticsEvent.count({ where }),
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      _count: { _all: true },
      where,
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["referrer"],
      _count: { _all: true },
      where: { ...where, referrer: { not: null } },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    // Day buckets can't be expressed with Prisma groupBy, so aggregate in SQL.
    prisma.$queryRaw`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
             COUNT(*)::int AS count
      FROM "analytics_events"
      WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        name: true,
        path: true,
        locale: true,
        device: true,
        createdAt: true,
      },
    }),
  ]);

  // Shape the daily series across the full requested range.
  const byDay = new Map(daily.map((row) => [row.day, row.count]));
  const series = [];
  for (let t = fromDate.getTime(); t <= toDate.getTime(); t += DAY_MS) {
    const day = new Date(Math.min(t, toDate.getTime())).toISOString().slice(0, 10);
    series.push({ day, count: byDay.get(day) || 0 });
  }

  return {
    range: { from: fromDate.toISOString(), to: toDate.toISOString() },
    totals: { pageviews, events },
    topPages: pages.map((p) => ({ path: p.path, count: p._count._all })),
    topReferrers: referrers
      .filter((r) => r.referrer)
      .map((r) => ({ referrer: r.referrer, count: r._count._all })),
    series,
    recent,
  };
}