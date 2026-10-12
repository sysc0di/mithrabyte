import { afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/db";

process.env.NODE_ENV = "test";

/**
 * Shared test bootstrap: points env at the test database and starts every
 * test with an empty set of app tables so tests are fully independent.
 */

async function clearTables() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.requestLog.deleteMany(),
    prisma.loginAttempt.deleteMany(),
    prisma.adminSession.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.analyticsEvent.deleteMany(),
    prisma.categoryLocale.deleteMany(),
    prisma.category.deleteMany(),
    prisma.productFeatureLocale.deleteMany(),
    prisma.productFeature.deleteMany(),
    prisma.productLocale.deleteMany(),
    prisma.product.deleteMany(),
    prisma.packageFeatureLocale.deleteMany(),
    prisma.packageFeature.deleteMany(),
    prisma.servicePackageLocale.deleteMany(),
    prisma.servicePackage.deleteMany(),
    prisma.inquiryReply.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.sectionLocale.deleteMany(),
    prisma.section.deleteMany(),
    prisma.pageLocale.deleteMany(),
    prisma.page.deleteMany(),
    prisma.settingValue.deleteMany(),
    prisma.setting.deleteMany(),
  ]);
}

beforeEach(async () => {
  await clearTables();
});

afterAll(async () => {
  await prisma.$disconnect();
});