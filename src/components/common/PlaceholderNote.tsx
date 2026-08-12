import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Explicit, honest labeling for demonstration content. */
export function PlaceholderNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}
