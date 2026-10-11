"use client";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Services() {
  const t = useTranslations("services");
  const services = t.raw("services");
  const icons = ["chip", "code", "globe"];

  return (
    <section className="w-full px-6 py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const icon = icons[i] ?? "chip";
            return (
              <Card key={i} className="h-full">
                <CardHeader>
                  <span className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <DoodleIcon name={icon} boilId="boil" size={22} />
                  </span>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
