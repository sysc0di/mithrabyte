"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import {
  readConsent,
  serializeConsent,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "@/lib/cookie-consent";
import { ConsentContext } from "@/components/consent/consent-context";
import CookieBanner from "@/components/consent/CookieBanner";

const GA_ID = process.env.NEXT_PUBLIC_GTM_ID || "G-LP24PHV0M0";

/** Removes Google Analytics cookies when consent is withdrawn. */
function clearAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((name) => name === "_ga" || name === "_gid" || name.startsWith("_ga_"));
  const host = window.location.hostname;
  for (const name of names) {
    for (const domain of ["", host, `.${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

function GoogleAnalytics({ enabled }) {
  if (!enabled) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
        }}
      />
    </>
  );
}

export default function ConsentProvider({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setLoaded(true);
  }, []);

  const persist = useCallback((categories) => {
    const value = serializeConsent(categories);
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      // Storage unavailable: keep in-memory state so the UI still works.
    }
    setConsent({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: { analytics: categories?.analytics === true },
    });
    setSettingsOpen(false);
  }, []);

  const acceptAll = useCallback(() => persist({ analytics: true }), [persist]);
  const rejectOptional = useCallback(() => persist({ analytics: false }), [persist]);
  const savePreferences = useCallback((categories) => persist(categories), [persist]);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const analytics = consent?.categories?.analytics === true;

  // When consent is withdrawn after GA has loaded, remove its cookies so no
  // optional identifiers remain until the user consents again.
  useEffect(() => {
    if (loaded && consent && !analytics) clearAnalyticsCookies();
  }, [loaded, consent, analytics]);

  const value = useMemo(
    () => ({ loaded, consent, analytics, acceptAll, rejectOptional, savePreferences, openSettings, closeSettings, settingsOpen }),
    [loaded, consent, analytics, acceptAll, rejectOptional, savePreferences, openSettings, closeSettings, settingsOpen]
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <GoogleAnalytics enabled={analytics} />
      <CookieBanner />
    </ConsentContext.Provider>
  );
}
