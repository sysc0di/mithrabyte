import { PageHeader } from "@/components/admin/blocks";
import InboxManager from "@/components/admin/InboxManager";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Gelen Kutusu" description="Müşteri iletişim formu mesajlarını yönetin." />
      <InboxManager />
    </div>
  );
}