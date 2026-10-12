import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Consistent page header used across admin sections. */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardStat({ label, value, hint, className }) {
  return (
    <Card className={cn("gap-1 p-4", className)}>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="flex min-h-56 flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
      {Icon && (
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-6" />
        </span>
      )}
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </Card>
  );
}

export function LoadingRows({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-lg border border-border/60 bg-muted/40"
        />
      ))}
    </div>
  );
}

export function FormActions({ onCancel, busy, submitLabel = "Save" }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
      <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
        Cancel
      </Button>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}