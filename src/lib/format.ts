export function formatCurrencyCompact(value: number | null) {
  if (value === null) return "Not disclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function daysUntil(iso: string, now: Date = new Date()) {
  const ms = new Date(iso).getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

export function deadlineTone(days: number): "destructive" | "warning" | "success" {
  if (days <= 7) return "destructive";
  if (days <= 21) return "warning";
  return "success";
}
