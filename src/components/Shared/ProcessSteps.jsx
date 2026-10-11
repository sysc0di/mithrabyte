"use client";

import { useTranslations } from "next-intl";

function ProcessSteps({ namespace }) {
  const t = useTranslations(namespace);
  const steps = t.raw("steps");

  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={i} className="flex flex-col gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-border bg-background text-sm font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ProcessSteps;
