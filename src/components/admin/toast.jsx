"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Minimal dependency-free toast system for admin feedback.
 */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ type = "success", title, description, duration = 4500 }) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }) {
  const Icon =
    toast.type === "error" ? XCircle : toast.type === "info" ? Info : CheckCircle2;
  const tone =
    toast.type === "error"
      ? "border-destructive/40 text-destructive"
      : toast.type === "info"
        ? "border-primary/40"
        : "border-emerald-500/40 text-emerald-400";

  return (
    <button
      type="button"
      onClick={onDismiss}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border bg-card/95 p-3 text-left shadow-lg backdrop-blur",
        tone
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">
        {toast.title && <span className="block text-sm font-semibold">{toast.title}</span>}
        {toast.description && (
          <span className="block text-xs text-muted-foreground">{toast.description}</span>
        )}
      </span>
    </button>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>.");
  return ctx;
}