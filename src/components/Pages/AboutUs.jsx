"use client";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutUs() {
  const t = useTranslations("aboutus");

  const values = [
    { icon: "users", title: t("values.collaboration.title"), description: t("values.collaboration.description") },
    { icon: "bulb", title: t("values.innovation.title"), description: t("values.innovation.description") },
    { icon: "circle", title: t("values.focus.title"), description: t("values.focus.description") },
  ];

  return (
    <section className="w-full px-6 py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <Card>
            <CardContent className="p-6">
              <p className="leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("values.title")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon, title, description }) => (
              <Card key={title} className="h-full">
                <CardHeader>
                  <span className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <DoodleIcon name={icon} boilId="boil" size={22} />
                  </span>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
