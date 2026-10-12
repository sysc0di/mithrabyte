"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Star, Table } from "lucide-react";
import { resolveIcon } from "@/lib/icons";

const useCaseIcons = ["circle", "users", "flame"];

const PACKAGE_ICONS = {
  PACKAGE: Star,
  MAINTENANCE: Table,
};

export default function PackageDetail({ pkg }) {
  const t = useTranslations("packages");
  const locale = useLocale();

  if (!pkg) return null;

  const HeroIcon = PACKAGE_ICONS[pkg.kind] ?? Star;
  const steps = t.raw("detail.steps");
  const recurring = pkg.billingPeriod && pkg.billingPeriod !== "ONE_TIME";
  const cta = pkg.ctaText || t("detail.getQuote");

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 py-20 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_60%_at_15%_0%,rgba(146,127,191,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-5">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href={`/${locale}/packages`}
              className="transition-colors hover:text-foreground"
            >
              {t("title")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">{pkg.title}</span>
          </nav>

          <Badge
            variant="outline"
            className="gap-1.5 border-primary/40 text-primary"
          >
            <HeroIcon className="size-[14px]" />
            {t("detail.eyebrow")}
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {pkg.title}
          </h1>

          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {pkg.description || pkg.tagline}
          </p>

          <div className="flex flex-col gap-1 pt-2">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              {recurring ? t("detail.recurring") : t("detail.startingAt")}
            </span>
            <span className="text-3xl font-extrabold tracking-tight">
              {pkg.priceLabel || t("quote")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href={`/${locale}/contact`}>
                {cta}
                <ArrowRight className="size-[16px]" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/packages`}>{t("detail.allPackages")}</Link>
            </Button>
          </div>

          {pkg.productSlug && (
            <Link
              href={`/${locale}/products/${pkg.productSlug}`}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {t("partOfProduct")}
            </Link>
          )}
        </div>
      </section>

      {/* What's included */}
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("detail.included")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("detail.includedSub")}
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {pkg.features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-border pb-4"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-[13px]" />
                </span>
                <span className="text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      {pkg.useCases.length > 0 && (
        <section className="border-y border-border bg-card/40 px-6 py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("detail.useCases")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("detail.useCasesSub")}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {pkg.useCases.map((useCase, i) => {
                const UseCaseIcon = resolveIcon(useCaseIcons[i] ?? "circle");
                return (
                  <Card key={i} className="gap-3 p-6">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <UseCaseIcon className="size-[20px]" />
                    </span>
                    <CardTitle className="text-lg font-bold">
                      {useCase.title}
                    </CardTitle>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {useCase.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How we work */}
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("detail.process")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("detail.processSub")}</p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={i} className="flex flex-col gap-3">
                <span className="grid size-10 place-items-center rounded-full border border-border bg-background text-sm font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent px-6 py-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("detail.ctaTitle")}
          </h2>
          <p className="max-w-xl text-muted-foreground">{t("detail.ctaText")}</p>
          <Button asChild size="lg" className="mt-2">
            <Link href={`/${locale}/contact`}>
              {t("detail.ctaButton")}
              <ArrowRight className="size-[16px]" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
