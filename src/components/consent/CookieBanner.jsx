"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsent } from "@/components/consent/consent-context";
import { cn } from "@/lib/utils";

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function CookieBanner() {
  const t = useTranslations("cookieConsent");
  const locale = useLocale();
  const { loaded, consent, analytics, acceptAll, rejectOptional, savePreferences, openSettings, closeSettings, settingsOpen } =
    useConsent();
  const [analyticsPref, setAnalyticsPref] = useState(false);

  useEffect(() => {
    if (settingsOpen) setAnalyticsPref(analytics);
  }, [settingsOpen, analytics]);

  if (!loaded) return null;

  const showBanner = !consent && !settingsOpen;

  return (
    <>
      {showBanner && (
        <div
          role="region"
          aria-label={t("title")}
          className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-xl border border-border bg-card/95 p-4 text-foreground shadow-lg backdrop-blur sm:bottom-6 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold">{t("title")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t("description")}{" "}
                <Link href={`/${locale}/legal/cookie-policy`} className="text-primary underline">
                  {t("cookieLink")}
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap">
              <Button size="sm" variant="outline" onClick={openSettings}>
                {t("customize")}
              </Button>
              <Button size="sm" variant="outline" onClick={rejectOptional}>
                {t("rejectOptional")}
              </Button>
              <Button size="sm" onClick={acceptAll}>
                {t("acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={settingsOpen} onOpenChange={(open) => (open ? openSettings() : closeSettings())}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t("necessary")}</p>
                <p className="text-xs text-muted-foreground">{t("necessaryDesc")}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">{t("necessary")}</span>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t("analytics")}</p>
                <p className="text-xs text-muted-foreground">{t("analyticsDesc")}</p>
              </div>
              <Switch
                checked={analyticsPref}
                onChange={setAnalyticsPref}
                label={t("analytics")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={rejectOptional}>
              {t("rejectOptional")}
            </Button>
            <Button onClick={() => savePreferences({ analytics: analyticsPref })}>
              {t("savePreferences")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
