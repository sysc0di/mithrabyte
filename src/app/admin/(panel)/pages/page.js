import { PageHeader } from "@/components/admin/blocks";
import PagesManager from "@/components/admin/PagesManager";

export const dynamic = "force-dynamic";

export default function AdminPagesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Sayfalar" description="Düzenlenebilir site sayfaları ve bölümleri." />
      <PagesManager />
    </div>
  );
}