-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('QUOTE', 'FIXED');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('ONE_TIME', 'MONTHLY', 'YEARLY');

-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('DRAFT', 'UPCOMING', 'AVAILABLE', 'ARCHIVED');
ALTER TABLE "public"."products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "service_packages_kind_isActive_sortOrder_idx";

-- AlterTable
ALTER TABLE "product_locales" ADD COLUMN     "ctaText" TEXT,
ADD COLUMN     "shortDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "targetAudience" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "useCases" JSONB;

-- AlterTable
ALTER TABLE "service_package_locales" ADD COLUMN     "ctaText" TEXT;

-- AlterTable
ALTER TABLE "service_packages" DROP COLUMN "isActive",
ADD COLUMN     "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "priceAmount" DECIMAL(12,2),
ADD COLUMN     "pricingModel" "PricingModel" NOT NULL DEFAULT 'QUOTE',
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "service_packages_kind_status_sortOrder_idx" ON "service_packages"("kind", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "service_packages_productId_idx" ON "service_packages"("productId");

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

