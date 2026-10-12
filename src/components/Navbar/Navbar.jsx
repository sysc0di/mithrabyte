"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import SidebarMenu from "./SidebarMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { Sparkles } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();

  const links = [
    { href: `/${locale}/packages`, label: t("packages") },
    { href: `/${locale}/services`, label: t("services") },
    { href: `/${locale}/aboutus`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href={`/${locale}`} className="flex items-center">
          <img src="/logo.svg" alt="mithrabyte" className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher className="hidden md:inline-flex" />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Sparkles className="size-[20px]" />
          </Button>
        </div>
      </div>

      <SidebarMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

export default Navbar;
