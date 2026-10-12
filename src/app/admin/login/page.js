import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const ctx = await getServerAdmin();
  if (ctx) redirect("/admin");
  return <LoginForm />;
}