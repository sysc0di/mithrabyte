"use client";

import { createContext, useContext } from "react";

export const ConsentContext = createContext(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
