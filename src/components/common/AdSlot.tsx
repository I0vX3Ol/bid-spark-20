import { cn } from "@/lib/utils";

/**
 * Reserved sponsored placement shown to free-tier users.
 * Always visually distinct from product content and clearly labeled.
 */
export function AdSlot({
  className,
  label = "Sponsored placement",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <aside
      aria-label="Sponsored placement"
      className={cn(
        "rounded-xl border border-dashed border-border bg-secondary/50 p-4 text-center",
        className,
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Reserved advertising slot for free accounts. Professional and Enterprise plans are ad-free.
      </p>
    </aside>
  );
}
