"use client";
import Link from "next/link";
import { Github, Instagram } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import LanguageSwitcher from "./LanguageSwitcher";

export default function SidebarMenu({ open, onClose }) {
  const t = useTranslations("nav");
  const locale = useLocale();

  const links = [
    { href: `/${locale}`, label: locale === "tr" ? "Ana Sayfa" : "Home" },
    { href: `/${locale}/aboutus`, label: t("about") },
    { href: `/${locale}/packages`, label: t("packages") },
    { href: `/${locale}/services`, label: t("services") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  const socialLinks = [
    { href: "https://instagram.com/mithrabyte", icon: Instagram, label: "Instagram" },
    { href: "https://github.com/sysc0di", icon: Github, label: "Github" },
  ];

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="rounded-md px-3 py-2 text-lg font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-4 border-t px-4 py-6">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              onClick={onClose}
              className="text-foreground transition-colors hover:text-primary"
            >
              <Icon className="size-6" />
            </a>
          ))}
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
