"use client";

import { useTranslations } from "next-intl";
import { resolveIcon } from "@/lib/icons";

function SolutionsSection() {
  const t = useTranslations("home.solutions");
  const items = t.raw("items");

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="max-w-2xl">
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

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = resolveIcon(item.icon);
            return (
            <div
              key={item.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-accent/40 text-primary">
                <Icon className="size-[22px]" />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="mr-2 font-medium uppercase tracking-wide text-foreground/60">
                  {t("problemLabel")}
                </span>
                {item.problem}
              </p>

              <div className="mt-auto border-t border-border pt-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SolutionsSection;
