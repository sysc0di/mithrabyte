"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProcessSteps from "@/components/Shared/ProcessSteps";
import FaqSection from "@/components/Shared/FaqSection";
import CtaBanner from "@/components/Shared/CtaBanner";
import { ArrowRight, Check, Star } from "lucide-react";

export default function Packages({ packages = [] }) {
  const t = useTranslations("packages");
  const locale = useLocale();
  const included = t.raw("included.items");

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 py-20 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_60%_at_15%_0%,rgba(146,127,191,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-5">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/40 text-primary"
          >
            <Star className="size-[14px]" />
            {t("eyebrow")}
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>

          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 py-20">
        {packages.length === 0 ? (
          <p className="mx-auto max-w-3xl text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-2">
            {packages.map((pkg, i) => {
              const isPopular = i === 0;
              const recurring = pkg.billingPeriod && pkg.billingPeriod !== "ONE_TIME";
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

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      {recurring ? t("maintenance") : t("oneTime")}
                    </Badge>
                    {pkg.productSlug && (
                      <Link
                        href={`/${locale}/products/${pkg.productSlug}`}
                        className="text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        {t("partOfProduct")}
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base leading-tight font-bold">
                      <Link
                        href={href}
                        className="transition-colors hover:text-primary"
                      >
                        {pkg.title}
                      </Link>
                    </CardTitle>
                    <div className="text-xl font-extrabold tracking-tight">
                      {pkg.priceLabel || t("quote")}
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
                        <Check className="mt-0.5 size-[14px] shrink-0 text-primary" />
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
                        <ArrowRight className="size-[16px]" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Included in every package */}
      <section className="border-y border-border bg-card/40 px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("included.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("included.subtitle")}
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-border pb-4"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-[13px]" />
                </span>
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProcessSteps namespace="packages.process" />
      <FaqSection namespace="packages.faq" />
      <CtaBanner namespace="packages.cta" />
    </main>
  );
}
