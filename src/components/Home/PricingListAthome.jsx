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
import { Check } from "lucide-react";

function PricingListAthome({ packages = [] }) {
  const t = useTranslations("home.pricing");
  const locale = useLocale();
  const visible = packages.slice(0, 3);

  if (!visible.length) return null;

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {visible.map((pkg) => (
            <Card key={pkg.slug} className="flex flex-col">
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/${locale}/packages/${pkg.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {pkg.title}
                  </Link>
                </CardTitle>
                <CardDescription>{pkg.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-[16px] shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col items-start gap-3">
                <span className="text-sm font-semibold">
                  {pkg.priceLabel || t("quote")}
                </span>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/${locale}/packages/${pkg.slug}`}>
                    {pkg.ctaText || t("cta")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingListAthome;
