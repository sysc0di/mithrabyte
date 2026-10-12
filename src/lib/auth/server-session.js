import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/utils/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Server-component session reader. Returns { admin, session } for the
 * signed-in administrator or null (used by admin layouts/pages).
 */
export async function getServerAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { admin: true },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) return null;
  if (!session.admin.isActive) return null;

  return { admin: session.admin, session };
}