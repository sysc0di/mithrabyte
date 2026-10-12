"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Cpu } from "lucide-react";
import { CATEGORY_ICONS, resolveIcon } from "@/lib/icons";

const useCaseIcons = ["circle", "users", "flame"];

export default function ProductDetail({ product }) {
  const t = useTranslations("productsPage");
  const locale = useLocale();

  if (!product) return null;

  const upcoming = product.status === "UPCOMING";
  const Icon = CATEGORY_ICONS[product.category?.slug] ?? Cpu;
  const cta = product.ctaText || t("contactCta");
  const packages = product.packages ?? [];

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
            <Link href={`/${locale}/products`} className="transition-colors hover:text-foreground">
              {t("title")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
              <Icon className="size-[14px]" />
              {t("eyebrow")}
            </Badge>
            {upcoming && (
              <Badge variant="outline" className="border-amber-500/40 text-amber-400">
                {t("upcoming")}
              </Badge>
            )}
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {product.title}
          </h1>

          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {product.description || product.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href={`/${locale}/contact`}>
                {cta}
                <ArrowRight className="size-[16px]" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/packages`}>{t("seePackages")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What's included */}
      {product.features.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("included")}
              </h2>
            </div>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-border pb-4">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-[13px]" />
                  </span>
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Use cases + target audience */}
      {(product.useCases.length > 0 || product.targetAudience) && (
        <section className="border-y border-border bg-card/40 px-6 py-20">
          <div className="mx-auto w-full max-w-5xl">
            {product.useCases.length > 0 && (
              <>
                <div className="mb-10 max-w-2xl">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {t("useCases")}
                  </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  {product.useCases.map((useCase, i) => {
                    const UseCaseIcon = resolveIcon(useCaseIcons[i] ?? "circle");
                    return (
                      <Card key={i} className="gap-3 p-6">
                        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                          <UseCaseIcon className="size-[20px]" />
                        </span>
                        <CardTitle className="text-lg font-bold">{useCase.title}</CardTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {useCase.description}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            {product.targetAudience && (
              <div className="mt-12 border-t border-border pt-8">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {t("whoFor")}
                </h2>
                <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
                  {product.targetAudience}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related packages */}
      {packages.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("packagesTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("packagesSubtitle")}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {packages.map((pkg) => (
                <Card key={pkg.slug} className="flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base font-bold">{pkg.title}</CardTitle>
                    <span className="text-sm font-semibold">
                      {pkg.priceLabel || t("quote")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pkg.tagline}</p>
                  <Button asChild variant="outline" size="sm" className="mt-auto w-fit gap-2">
                    <Link href={`/${locale}/packages/${pkg.slug}`}>
                      {t("details")}
                      <ArrowRight className="size-[16px]" />
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
