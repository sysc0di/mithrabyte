"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Globe } from "lucide-react";

const LOCALES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
];

export default function LanguageSwitcher({ className }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = useLocale();

  const switchLocale = (newLocale) => {
    if (newLocale === active) return;

    localStorage.setItem("locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;

    const segments = pathname.split("/").filter(Boolean);
    if (["tr", "en"].includes(segments[0])) {
      segments.shift();
    }

    const pathWithoutLocale =
      segments.length > 0 ? `/${segments.join("/")}` : "/";

    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <Globe className="size-[16px]" />
          <span className="font-semibold uppercase">{active}</span>
          <ChevronDown className="size-[16px] opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LOCALES.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLocale(code)}
            className="gap-2"
          >
            <Check
              className={cn(
                "size-[16px] text-primary",
                active === code ? "opacity-100" : "opacity-0"
              )}
            />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
