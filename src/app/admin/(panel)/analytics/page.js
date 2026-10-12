import { PageHeader } from "@/components/admin/blocks";
import AnalyticsManager from "@/components/admin/AnalyticsManager";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Analitik" description="Birinci taraf olay izleme raporu. Detaylı analiz 4. aşamada." />
      <AnalyticsManager />
    </div>
  );
}