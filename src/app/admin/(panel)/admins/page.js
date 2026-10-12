import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import { PageHeader } from "@/components/admin/blocks";
import AdminsManager from "@/components/admin/AdminsManager";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const ctx = await getServerAdmin();
  if (!ctx) redirect("/admin/login");
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Yöneticiler"
        description="Ekip üyeleri, rolleri ve hesap durumları."
      />
      <AdminsManager currentAdmin={ctx.admin} />
    </div>
  );
}