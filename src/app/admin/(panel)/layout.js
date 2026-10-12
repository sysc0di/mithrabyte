import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import AdminShell from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const ctx = await getServerAdmin();
  if (!ctx) redirect("/admin/login");
  return <AdminShell admin={ctx.admin}>{children}</AdminShell>;
}