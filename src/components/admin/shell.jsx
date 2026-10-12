"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  Building2,
  FileText,
  Gauge,
  Inbox,
  LogOut,
  Menu,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  UserRound,
  X,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToastProvider } from "@/components/admin/toast";
import { apiPost } from "@/components/admin/api";
import { useRouter } from "next/navigation";

const NAV = [
  {
    section: "Genel Bakış",
    items: [{ href: "/admin", label: "Dashboard", icon: Gauge }],
  },
  {
    section: "İçerik",
    items: [
      { href: "/admin/products", label: "Ürünler", icon: Package },
      { href: "/admin/categories", label: "Kategoriler", icon: Tags },
      { href: "/admin/packages", label: "Paketler", icon: Boxes },
      { href: "/admin/pages", label: "Sayfalar", icon: FileText },
      { href: "/admin/settings", label: "Site Ayarları", icon: Settings },
    ],
  },
  {
    section: "Operasyon",
    items: [
      { href: "/admin/inbox", label: "Gelen Kutusu", icon: Inbox },
      { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
      { href: "/admin/audit", label: "Denetim Günlüğü", icon: ScrollText },
    ],
  },
  {
    section: "Takım",
    items: [
      { href: "/admin/admins", label: "Yöneticiler", icon: ShieldCheck },
      { href: "/admin/sessions", label: "Oturumlar", icon: Activity },
    ],
  },
];

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Building2 className="size-4" />
      </span>
      <span className="text-sm font-semibold tracking-tight">
        Mithrabyte<span className="text-primary"> Admin</span>
      </span>
    </Link>
  );
}

function NavList({ current, onNavigate }) {
  return (
    <nav className="flex flex-col gap-5 px-2">
      {NAV.map((group) => (
        <div key={group.section}>
          <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
            {group.section}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = current === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AccountChip({ admin }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
      <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
        <UserRound className="size-4" />
      </span>
      <span className="min-w-0 text-left leading-tight">
        <span className="block truncate text-xs font-semibold">{admin.name}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{admin.email}</span>
      </span>
      <Badge variant="outline" className="ml-1 shrink-0 text-[10px]">
        {admin.role}
      </Badge>
    </div>
  );
}

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    try {
      await apiPost("/api/admin/auth/logout", {});
    } catch {
      // ignore network/parse failures — the cookie is deleted client-side anyway
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <ToastProvider>
      <div
        className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-4 border-r border-border bg-card/40 p-3 lg:flex"
      >
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavList current={pathname} />
        </div>
        <AccountChip admin={admin} />
      </div>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-40 lg:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center justify-between">
            <Brand />
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </div>
          <NavList current={pathname} onNavigate={() => setOpen(false)} />
          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
            <AccountChip admin={admin} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="lg:hidden" />
          <div className="ml-8 flex items-center gap-2 lg:ml-0">
            <Globe className="size-4 text-muted-foreground" />
            <Button asChild variant="link" className="h-auto p-0 text-sm text-muted-foreground">
              <a href="/tr" target="_blank" rel="noreferrer">
                Siteyi Görüntüle
              </a>
            </Button>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/admin/account">
                <UserRound className="size-4" />
                Hesabım
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" />
              Çıkış
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}