"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import StatsStrip from "@/components/Shared/StatsStrip";
import ProcessSteps from "@/components/Shared/ProcessSteps";
import FaqSection from "@/components/Shared/FaqSection";
import CtaBanner from "@/components/Shared/CtaBanner";

export default function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const info = [
    { icon: "map-pin", label: t("locationLabel"), value: t("address") },
    { icon: "phone", label: t("phoneLabel"), value: t("phone") },
    { icon: "mail", label: t("emailLabel"), value: t("email") },
    { icon: "calendar", label: t("hoursLabel"), value: t("hours") },
  ];

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`New message from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n${form.email}`);
    window.location.href = `mailto:${t("email")}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 py-20 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_60%_at_15%_0%,rgba(146,127,191,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background px-3 py-1 text-xs font-medium text-primary">
            <DoodleIcon name="mail" boilId="boil" size={14} />
            {t("eyebrow")}
          </span>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {t("heroTitle")}
          </h1>

          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <a href={`mailto:${t("email")}`}>
                {t("heroCta")}
                <DoodleIcon name="send" boilId="boil" size={16} />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/packages`}>{t("heroCta2")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="px-6 py-20">
        <div className="mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("formTitle")}</CardTitle>
              <CardDescription>{t("formSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("nameLabel")}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("namePlaceholder")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("emailLabel")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t("email")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">{t("messageLabel")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t("messagePlaceholder")}
                    required
                  />
                </div>
                <Button type="submit" className="w-fit gap-2">
                  {t("send")}
                  <DoodleIcon name="send" boilId="boil" size={16} />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              {info.map(({ icon, label, value }, index) => (
                <Fragment key={label}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <DoodleIcon name={icon} boilId="boil" size={20} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  </div>
                </Fragment>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <StatsStrip namespace="contact.stats" />
      <ProcessSteps namespace="contact.response" />
      <FaqSection namespace="contact.faq" />
      <CtaBanner namespace="contact.cta" href={`/${locale}/packages`} />
    </main>
  );
}