import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Seeds sample first-party analytics events so the admin dashboard has data
 * to read. Idempotent: deletes rows it previously created (props.seed === true)
 * before inserting, so it can be re-run and removed safely.
 *
 * Usage: npm run db:seed:analytics
 *        npm run db:seed:analytics -- --clear   (remove sample rows only)
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAYS = 30;

const PATHS = [
  ["/tr", 40],
  ["/en", 14],
  ["/tr/packages", 22],
  ["/en/packages", 7],
  ["/tr/products", 13],
  ["/en/products", 5],
  ["/tr/products/local-ai-knowledge", 8],
  ["/tr/services", 9],
  ["/tr/contact", 6],
  ["/en/contact", 3],
  ["/tr/aboutus", 4],
  ["/en/aboutus", 2],
];

const REFERRERS = [
  null, null, null,
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://www.linkedin.com/",
  "https://twitter.com/",
];

const DEVICES = [["mobile", 6], ["desktop", 4], ["tablet", 1]];
const LOCALES = [["tr", 7], ["en", 3]];
const EVENTS = [["pageview", 9], ["cta_click", 1]];

function weighted(table) {
  const total = table.reduce((sum, [, weight]) => sum + weight, 0);
  let r = Math.random() * total;
  for (const [value, weight] of table) {
    r -= weight;
    if (r <= 0) return value;
  }
  return table[0][0];
}

function buildRows() {
  const rows = [];
  const now = new Date();
  for (let d = DAYS - 1; d >= 0; d -= 1) {
    const base = new Date(now);
    base.setUTCDate(base.getUTCDate() - d);
    base.setUTCHours(0, 0, 0, 0);
    const perDay = 12 + Math.floor(Math.random() * 22);
    for (let i = 0; i < perDay; i += 1) {
      const createdAt = new Date(
        base.getTime() + Math.floor(Math.random() * 24 * 60) * 60 * 1000
      );
      if (createdAt > now) continue;
      rows.push({
        name: weighted(EVENTS),
        path: weighted(PATHS).slice(0, 500),
        referrer: weighted(REFERRERS.map((r) => [r, r ? 1 : 3])),
        locale: weighted(LOCALES),
        device: weighted(DEVICES),
        sessionId: randomUUID(),
        props: { seed: true },
        createdAt,
      });
    }
  }
  return rows;
}

async function main() {
  const removed = await prisma.analyticsEvent.deleteMany({
    where: { props: { path: ["seed"], equals: true } },
  });

  if (process.argv.includes("--clear")) {
    console.log(`[seed:analytics] Removed ${removed.count} sample rows.`);
    await prisma.$disconnect();
    return;
  }

  const rows = buildRows();
  await prisma.analyticsEvent.createMany({ data: rows });

  console.log(
    `[seed:analytics] Removed ${removed.count} previous sample rows, inserted ${rows.length} events across ${DAYS} days.`
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed:analytics] Failed:", err.message || err);
  process.exit(1);
});
