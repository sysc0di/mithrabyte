"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight, Cpu } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/icons";

export default function Products({ products = [] }) {
  const t = useTranslations("productsPage");
  const locale = useLocale();

  return (
    <main className="w-full">
      <section className="relative overflow-hidden border-b border-border px-6 py-20 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_60%_at_15%_0%,rgba(146,127,191,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-5">
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
            <Cpu className="size-[14px]" />
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

      <section className="px-6 py-20">
        {products.length === 0 ? (
          <p className="mx-auto max-w-3xl text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 lg:grid-cols-3">
            {products.map((product) => {
              const Icon = CATEGORY_ICONS[product.category?.slug] ?? Cpu;
              const upcoming = product.status === "UPCOMING";
              const href = `/${locale}/products/${product.slug}`;
              return (
                <Card key={product.slug} className="flex flex-col gap-3 p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-[22px]" />
                  </span>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">
                      <Link href={href} className="transition-colors hover:text-primary">
                        {product.title}
                      </Link>
                    </CardTitle>
                    {upcoming && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 text-amber-400"
                      >
                        {t("upcoming")}
                      </Badge>
                    )}
                  </div>
                  {product.category?.title && (
                    <span className="text-xs tracking-wide text-muted-foreground uppercase">
                      {product.category.title}
                    </span>
                  )}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.shortDescription || product.tagline}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-auto w-fit gap-2">
                    <Link href={href}>
                      {product.ctaText || t("details")}
                      <ArrowRight className="size-[16px]" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
