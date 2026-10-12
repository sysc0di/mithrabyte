-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_logs_scope_ipHash_createdAt_idx" ON "request_logs"("scope", "ipHash", "createdAt");
