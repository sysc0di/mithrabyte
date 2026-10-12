import { PageHeader } from "@/components/admin/blocks";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Kategoriler" description="Ürünleri gruplamak için kullanılır." />
      <CategoriesManager />
    </div>
  );
}