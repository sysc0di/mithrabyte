"use client";

import { useTranslations } from "next-intl";
import Counter from "@/components/ui/counter";

function StatsStrip({ namespace = "home.stats" }) {
  const t = useTranslations(namespace);
  const items = t.raw("items");

  return (
    <section className="border-y border-border bg-card/30 px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <div className="flex items-baseline text-4xl font-bold text-primary sm:text-5xl">
                <Counter
                  value={item.value}
                  fontSize={48}
                  gap={2}
                  horizontalPadding={0}
                  textColor="currentColor"
                  gradientFrom="#000000"
                  gradientHeight={12}
                />
                <span>{item.suffix}</span>
              </div>
              <span className="mt-3 text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsStrip;
