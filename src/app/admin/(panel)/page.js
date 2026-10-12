import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import { getSummary } from "@/lib/services/summary";
import Dashboard from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage({ searchParams }) {
  const ctx = await getServerAdmin();
  if (!ctx) redirect("/admin/login");
  const sp = await searchParams;
  void sp;
  const summary = await getSummary();
  return <Dashboard summary={summary} admin={ctx.admin} />;
}