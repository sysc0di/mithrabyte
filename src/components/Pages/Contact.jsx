"use client";
import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
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

export default function Contact() {
  const t = useTranslations("contact");
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
    <section className="w-full px-6 py-16 sm:py-20">
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
  );
}
