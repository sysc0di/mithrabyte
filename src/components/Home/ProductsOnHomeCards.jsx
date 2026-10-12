"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Clock, Cpu } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/icons";

function ProductsOnHomeCards({ products = [] }) {
  const t = useTranslations("home.products");
  const locale = useLocale();

  if (!products.length) return null;

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => {
            const Icon = CATEGORY_ICONS[product.category?.slug] ?? Cpu;
            const upcoming = product.status === "UPCOMING";
            const href = `/${locale}/products/${product.slug}`;
            return (
              <Card key={product.slug} className="flex flex-col">
                <CardHeader>
                  <span className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    {upcoming ? (
                      <Clock className="size-[22px]" />
                    ) : (
                      <Icon className="size-[22px]" />
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <CardTitle>
                      <Link href={href} className="transition-colors hover:text-primary">
                        {product.title}
                      </Link>
                    </CardTitle>
                    {upcoming && (
                      <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-400 uppercase">
                        {t("upcoming")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription>
                    {product.shortDescription || product.tagline || product.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={href}>
                      {product.ctaText || t("cta")}
                      <ArrowRight className="size-[16px]" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductsOnHomeCards;
