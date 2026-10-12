import { PageHeader } from "@/components/admin/blocks";
import PackagesManager from "@/components/admin/PackagesManager";

export const dynamic = "force-dynamic";

export default function PackagesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Servis Paketleri"
        description="Servis paketleri ve bakım anlaşmalarını yönetin."
      />
      <PackagesManager />
    </div>
  );
}