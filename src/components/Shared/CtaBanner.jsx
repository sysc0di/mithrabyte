"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { Button } from "@/components/ui/button";

function CtaBanner({ namespace, href }) {
  const t = useTranslations(namespace);
  const locale = useLocale();
  const target = href ?? `/${locale}/contact`;

  return (
    <section className="px-6 pt-4 pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent px-6 py-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-muted-foreground">{t("text")}</p>
        <Button asChild size="lg" className="mt-2">
          <Link href={target}>
            {t("button")}
            <DoodleIcon name="arrow-right" boilId="boil" size={16} />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default CtaBanner;
