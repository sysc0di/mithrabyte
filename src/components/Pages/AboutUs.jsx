"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import StatsStrip from "@/components/Shared/StatsStrip";
import ProcessSteps from "@/components/Shared/ProcessSteps";
import FaqSection from "@/components/Shared/FaqSection";
import CtaBanner from "@/components/Shared/CtaBanner";

const VALUE_ICONS = ["users", "bulb", "circle"];
const HIGHLIGHT_ICONS = ["users", "bulb", "table", "code"];

export default function AboutUs() {
  const t = useTranslations("aboutus");
  const locale = useLocale();
  const highlights = t.raw("highlights.items");

  const values = [
    {
      icon: "users",
      title: t("values.collaboration.title"),
      description: t("values.collaboration.description"),
    },
    {
      icon: "bulb",
      title: t("values.innovation.title"),
      description: t("values.innovation.description"),
    },
    {
      icon: "circle",
      title: t("values.focus.title"),
      description: t("values.focus.description"),
    },
  ];

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
            <DoodleIcon name="bulb" boilId="boil" size={14} />
            {t("eyebrow")}
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>

          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href={`/${locale}/contact`}>
                {t("heroCta")}
                <DoodleIcon name="arrow-right" boilId="boil" size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/packages`}>{t("heroCta2")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("storyTitle")}
          </h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-card/40 px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("values.title")}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon, title, description }, i) => (
              <Card key={title} className="gap-4 p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <DoodleIcon name={VALUE_ICONS[i] ?? icon} boilId="boil" size={22} />
                </span>
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("highlights.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("highlights.subtitle")}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {highlights.map((item, i) => (
              <Card key={item.title} className="gap-3 p-6">
                <span className="h-9 w-9 grid place-items-center rounded-full bg-primary/10 text-primary">
                  <DoodleIcon
                    name={HIGHLIGHT_ICONS[i] ?? "users"}
                    boilId="boil"
                    size={18}
                  />
                </span>
                <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <StatsStrip namespace="aboutus.stats" />
      <ProcessSteps namespace="aboutus.process" />
      <FaqSection namespace="aboutus.faq" />
      <CtaBanner namespace="aboutus.cta" />
    </main>
  );
}