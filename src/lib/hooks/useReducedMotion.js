"use client";

import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const handler = (event) => setReduced(event.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function useShouldReduceEffects() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  return reduced || isMobile;
}