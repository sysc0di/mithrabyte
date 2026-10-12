"use client";

import { useTranslations, useLocale } from "next-intl";
import Terminal from "@/components/Terminal/Terminal";

function TerminalSection() {
  const t = useTranslations("home.terminal");
  const locale = useLocale();

  const data = {
    windowTitle: t("windowTitle"),
    prompt: t("prompt"),
    placeholder: t("placeholder"),
    hint: t("hint"),
    unknownPrefix: t("unknownPrefix"),
    boot: t.raw("boot"),
    suggestions: t.raw("suggestions"),
    help: t.raw("help"),
    outputs: t.raw("outputs"),
  };

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Terminal key={locale} data={data} />
      </div>
    </section>
  );
}

export default TerminalSection;