import { redirect } from "next/navigation";
import { getServerAdmin } from "@/lib/auth/server-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/blocks";
import PasswordForm from "@/components/admin/PasswordForm";
import SessionsManager from "@/components/admin/SessionsManager";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }) {
  const ctx = await getServerAdmin();
  if (!ctx) redirect("/admin/login");
  const sp = await searchParams;
  const mustChange = sp?.mustChange === "true";

  return (
    <div className="grid gap-6">
      <PageHeader title="Hesabım" description="Profil bilgileriniz ve oturum yönetimi." />

      {mustChange && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Geçici şifreyle giriş yaptınız — lütfen hemen yeni bir şifre belirleyin.
        </div>
      )}

      <Card className="gap-3 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {(ctx.admin.name || "A")[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-base font-semibold">
              {ctx.admin.name}
              <Badge variant="outline" className="text-[10px]">
                {ctx.admin.role}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground">{ctx.admin.email}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              Son giriş: <span className="font-medium">{formatDate(ctx.admin.lastLoginAt)}</span>
            </p>
            <p>
              Kayıt: <span className="font-medium">{formatDate(ctx.admin.createdAt)}</span>
            </p>
          </div>
        </div>
      </Card>

      <PasswordForm />
      <SessionsManager />
    </div>
  );
}