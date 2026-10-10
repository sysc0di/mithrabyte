"use client";
import { useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const icons = ["chip", "code", "globe", "users"];

function CompanyCards() {
  const t = useTranslations("home.company");

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {icons.map((icon, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <span className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <DoodleIcon name={icon} boilId="boil" size={22} />
                </span>
                <CardTitle>{t(`card${index + 1}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`card${index + 1}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompanyCards;
