/**
 * Shared date/formatting helpers (safe for both server and client).
 */

const TR_LONG = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return TR_LONG.format(date);
}

/**
 * Splits a stored analytics path/URL into a display pathname and the
 * trailing query/hash. Never mutates or drops the original value.
 */
export function splitPathQuery(fullPath) {
  const value = fullPath || "/";
  try {
    if (value.includes("?")) {
      const u = new URL(value, "http://example.invalid");
      return { pathname: u.pathname + (u.hash || ""), query: u.search };
    }
  } catch {
    /* fall through to plain string split */
  }
  const idx = value.indexOf("?");
  if (idx > -1) {
    return { pathname: value.slice(0, idx), query: value.slice(idx) };
  }
  return { pathname: value, query: "" };
}

const RTF = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

export function fromNow(value, now = Date.now()) {
  if (!value) return "—";
  const date = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (Number.isNaN(date)) return "—";
  const diff = date - now;
  const abs = Math.abs(diff);
  if (abs < 60_000) return RTF.format(Math.round(diff / 1000), "second");
  if (abs < 3_600_000) return RTF.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return RTF.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 2_592_000_000) return RTF.format(Math.round(diff / 86_400_000), "day");
  if (abs < 31_104_000_000) return RTF.format(Math.round(diff / 2_592_000_000), "month");
  return RTF.format(Math.round(diff / 31_104_000_000), "year");
}