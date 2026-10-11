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

const icons = ["chip", "code", "globe"];

export default function Services() {
  const t = useTranslations("services");
  const locale = useLocale();
  const services = t.raw("services");
  const capabilities = t.raw("capabilities.items");

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
            <DoodleIcon name="chip" boilId="boil" size={14} />
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

      {/* Core services */}
      <section className="px-6 py-20">
        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-3">
          {services.map((service, i) => {
            const icon = icons[i] ?? "chip";
            return (
              <Card key={i} className="gap-4 p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <DoodleIcon name={icon} boilId="boil" size={22} />
                </span>
                <div>
                  <CardTitle className="text-lg font-bold">
                    {service.title}
                  </CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <ul className="flex flex-col gap-2 border-t border-border pt-4">
                  {service.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm leading-snug"
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
              </Card>
            );
          })}
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y border-border bg-card/40 px-6 py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("capabilities.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("capabilities.subtitle")}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {capabilities.map((item, i) => (
              <Card key={i} className="gap-2 p-6">
                <CardTitle className="text-base font-bold">
                  {item.title}
                </CardTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <StatsStrip namespace="services.stats" />
      <ProcessSteps namespace="services.process" />
      <FaqSection namespace="services.faq" />
      <CtaBanner namespace="services.cta" />
    </main>
  );
}
