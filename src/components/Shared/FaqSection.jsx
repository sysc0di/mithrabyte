"use client";

import { useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";

function FaqSection({ namespace }) {
  const t = useTranslations(namespace);
  const items = t.raw("items");

  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-border bg-card/40 px-5 py-4 transition-colors open:border-primary/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <DoodleIcon
                  name="chevron-down"
                  boilId="boil"
                  size={16}
                  className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
