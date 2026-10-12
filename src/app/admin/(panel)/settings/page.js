import { PageHeader } from "@/components/admin/blocks";
import SettingsManager from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Site Ayarları"
        description="Public site tarafından okunan ayarlar. Korumalı alanlar yalnızca seed ile değişir."
      />
      <SettingsManager />
    </div>
  );
}