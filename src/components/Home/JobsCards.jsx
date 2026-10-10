"use client";
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

function JobsCards() {
  const t = useTranslations("home.jobs");

  return (
    <section style={{ display: "none" }} className="w-full px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(`card${n}.title`)}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{t(`card${n}.description`)}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="mailto:yatli5645@gmail.com" target="_blank">
                    {t(`card${n}.cta`)}
                    <DoodleIcon name="arrow-right" boilId="boil" size={16} />
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

export default JobsCards;
