"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/consent/consent-context";

/**
 * First-party pageview tracking. Sends one event per client-side navigation to
 * POST /api/analytics. No cookies and no raw IPs; a per-tab id lives in
 * sessionStorage only.
 */

function getSessionId() {
  try {
    let id = sessionStorage.getItem("mb_sid");
    if (!id) {
      id =
        window.crypto?.randomUUID?.() ||
        `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem("mb_sid", id);
    }
    return id.slice(0, 64);
  } catch {
    return undefined;
  }
}

function getDevice() {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function send(payload) {
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/analytics", blob)) return;
  } catch {
    // fall through to fetch
  }
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { analytics } = useConsent();
  const lastPath = useRef(null);

  useEffect(() => {
    // Only track after the visitor has granted analytics consent.
    if (!analytics) return;
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;

    const locale = pathname.split("/")[1];
    let referrer;
    if (document.referrer) {
      try {
        if (new URL(document.referrer).origin !== window.location.origin) {
          referrer = document.referrer;
        }
      } catch {
        referrer = undefined;
      }
    }

    send({
      name: "pageview",
      path: `${window.location.pathname}${window.location.search}`,
      referrer,
      locale: ["tr", "en"].includes(locale) ? locale : undefined,
      device: getDevice(),
      sessionId: getSessionId(),
    });
  }, [pathname, analytics]);

  return null;
}
