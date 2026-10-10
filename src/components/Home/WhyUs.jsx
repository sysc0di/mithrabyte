"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { Button } from "@/components/ui/button";

function WhyUs() {
  const t = useTranslations("home.whyUs");

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
        <Button asChild className="w-fit gap-2">
          <Link target="_blank" href="https://bionluk.com/coderingewer">
            {t("cta")}
            <DoodleIcon name="arrow-up-right" boilId="boil" size={16} />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default WhyUs;
