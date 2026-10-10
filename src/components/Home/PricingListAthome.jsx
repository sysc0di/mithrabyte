import Link from "next/link";
import { useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PricingListAthome() {
  const t = useTranslations("home.pricing");
  const packages = t.raw("packages");

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
          {packages.map((pkg, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <CardTitle>{pkg.title}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <DoodleIcon
                        name="check"
                        boilId="boil"
                        size={16}
                        className="mt-0.5 shrink-0 text-primary"
                      />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="justify-between gap-4">
                <span className="text-lg font-semibold">{pkg.price}</span>
                <Button asChild size="sm">
                  <Link target="_blank" href={pkg.url}>
                    {t("cta", { default: "Get Quote" })}
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
