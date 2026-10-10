"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Packages() {
  const t = useTranslations("packages");
  const locale = useLocale();
  const packages = t.raw("packages");

  return (
    <section className="w-full bg-background px-6 py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/40 text-primary"
          >
            <DoodleIcon name="star" boilId="boil" size={14} />
            {t("badge")}
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-sm text-pretty text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {packages.map((pkg, i) => {
            const isPopular = i === 1;
            const href = `/${locale}/packages/${pkg.slug}`;
            return (
              <Card
                key={pkg.slug}
                className={cn(
                  "relative flex h-full flex-col gap-3 overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1",
                  isPopular && "border-primary/50 ring-1 ring-primary/25"
                )}
              >
                {isPopular && (
                  <span className="absolute top-0 right-0 rounded-bl-lg bg-primary px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
                    {t("popular")}
                  </span>
                )}

                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base leading-tight font-bold">
                    <Link
                      href={href}
                      className="transition-colors hover:text-primary"
                    >
                      {pkg.title}
                    </Link>
                  </CardTitle>
                  <div className="text-2xl font-extrabold tracking-tight">
                    {pkg.price}
                  </div>
                  <p className="text-[13px] leading-snug text-muted-foreground">
                    {pkg.tagline}
                  </p>
                </div>

                <ul className="flex flex-col gap-1.5">
                  {pkg.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-[13px] leading-snug"
                    >
                      <DoodleIcon
                        name="check"
                        boilId="boil"
                        size={14}
                        className="mt-0.5 shrink-0 text-primary"
                      />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-1">
                  <Button
                    asChild
                    size="sm"
                    variant={isPopular ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href={href}>
                      {t("detail.details")}
                      <DoodleIcon name="arrow-right" boilId="boil" size={16} />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
