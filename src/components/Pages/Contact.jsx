"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatsStrip from "@/components/Shared/StatsStrip";
import ProcessSteps from "@/components/Shared/ProcessSteps";
import FaqSection from "@/components/Shared/FaqSection";
import CtaBanner from "@/components/Shared/CtaBanner";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { resolveIcon } from "@/lib/icons";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" };
const SUBJECTS = ["Support", "Order", "Question"];

export default function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const info = [
    { icon: "map-pin", label: t("locationLabel"), value: t("address") },
    { icon: "phone", label: t("phoneLabel"), value: t("phone") },
    { icon: "mail", label: t("emailLabel"), value: t("email") },
    { icon: "calendar", label: t("hoursLabel"), value: t("hours") },
  ];

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          honeypot: form.website,
          pageRef: `/${locale}/contact`,
          locale,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error?.message || t("form.error"));
      }
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus("error");
      setError(err?.message || t("form.error"));
    }
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
            <Sparkles className="size-[14px]" />
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
                <ArrowRight className="size-[16px]" />
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
              <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
                >
                  <label htmlFor="company-website">Company website</label>
                  <input
                    id="company-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>
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
                  <Label htmlFor="subject">{t("subjectLabel")}</Label>
                  <Select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      {t("subjectPlaceholder")}
                    </option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {t(`subjects.${subject.toLowerCase()}`)}
                      </option>
                    ))}
                  </Select>
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
                <Button type="submit" className="w-fit gap-2" disabled={status === "sending"}>
                  {status === "sending" ? t("form.sending") : t("send")}
                  {status === "sending" ? (
                    <Loader2 className="size-[16px] animate-spin" />
                  ) : (
                    <ArrowRight className="size-[16px]" />
                  )}
                </Button>

                <p
                  role="status"
                  aria-live="polite"
                  className="min-h-5 text-sm"
                >
                  {status === "success" && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="size-4 shrink-0" />
                      {t("form.success")}
                    </span>
                  )}
                  {status === "error" && (
                    <span className="inline-flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {error}
                    </span>
                  )}
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              {info.map(({ icon, label, value }, index) => {
                const InfoIcon = resolveIcon(icon);
                return (
                <Fragment key={label}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <InfoIcon className="size-[20px]" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  </div>
                </Fragment>
                );
              })}
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
