import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import { PageHeader } from "@/components/admin/blocks";
import SessionsManager from "@/components/admin/SessionsManager";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const ctx = await getServerAdmin();
  if (!ctx) redirect("/admin/login");
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Oturumlar"
        description="Hesabınıza bağlı aktif oturumlar. Şüpheli bir cihaz görürseniz iptal edin."
      />
      <SessionsManager />
    </div>
  );
}