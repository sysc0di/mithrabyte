import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEnv } from "@/lib/env";

/**
 * Single shared PrismaClient instance (long-running + serverless safe).
 * The generated client is server-only; never import it from a client component.
 */
function createClient() {
  const adapter = new PrismaPg({ connectionString: getEnv().DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}