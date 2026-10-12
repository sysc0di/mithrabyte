"use client";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Data-fetching hook for admin list endpoints. */
export function useList({ path, query, page, pageSize, onData }) {
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryString = serializeQuery(query);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiList(path, queryString, page, pageSize);
      setItems(data.items || []);
      setTotal(data.total || 0);
      onData?.(data);
    } catch (err) {
      setItems([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, queryString, page, pageSize, onData]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, total, loading, error, refresh: load };
}

function serializeQuery(query) {
  if (!query) return "";
  const parts = [];
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.join("&");
}

async function apiList(base, queryString, page, pageSize) {
  const url = new URL(base, window.location.origin);
  if (queryString) {
    for (const pair of queryString.split("&")) {
      const [key, value] = pair.split("=");
      if (value !== undefined) url.searchParams.set(decodeURIComponent(key), decodeURIComponent(value));
    }
  }
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));

  const res = await fetch(url.toString(), { credentials: "same-origin", cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false, error: { message: "Invalid response." } }));
  if (!res.ok || !json.ok) throw new Error(json?.error?.message || "Request failed.");
  return json.data;
}

export function PaginationBar({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
      <span>
        {total} record{total === 1 ? "" : "s"} · page {page}/{pages}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(Math.max(1, page - 1))}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => onChange(Math.min(pages, page + 1))}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function ReloadButton({ onClick, busy }) {
  return (
    <Button variant="outline" size="icon" onClick={onClick} disabled={busy}>
      {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
    </Button>
  );
}

const STATUS_TONES = {
  ACTIVE: "border-emerald-500/40 text-emerald-400",
  AVAILABLE: "border-emerald-500/40 text-emerald-400",
  DRAFT: "border-border text-muted-foreground",
  COMING_SOON: "border-amber-500/40 text-amber-400",
  UPCOMING: "border-amber-500/40 text-amber-400",
  ARCHIVED: "border-border text-muted-foreground",
  NEW: "border-primary/50 text-primary",
  READ: "border-sky-500/40 text-sky-400",
  IN_PROGRESS: "border-amber-500/40 text-amber-400",
  RESOLVED: "border-emerald-500/40 text-emerald-400",
  SPAM: "border-destructive/40 text-destructive",
  PACKAGE: "border-primary/40 text-primary",
  MAINTENANCE: "border-cyan-500/40 text-cyan-400",
  ADMIN: "border-border text-muted-foreground",
  OWNER: "border-primary/50 text-primary",
};

export function StatusBadge({ value }) {
  if (!value) return null;
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_TONES[value])}>
      {value}
    </Badge>
  );
}

export function ConfirmDialog({ open, onOpenChange, title = "Are you sure?", description, confirmLabel = "Delete", busy = false, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={busy}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>
            {busy ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}