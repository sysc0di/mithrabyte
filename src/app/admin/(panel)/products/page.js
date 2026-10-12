import { PageHeader } from "@/components/admin/blocks";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Ürünler" description="Satış/uygulama ürün kataloğunuzu yönetin." />
      <ProductsManager />
    </div>
  );
}