import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="NexusDel home"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none">
          <path
            d="M4 19V5l8 9V5m4 0v14"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[0.98rem] font-semibold tracking-tight text-foreground">
        NexusDel
        <span className="ml-1.5 hidden font-sans text-xs font-medium text-muted-foreground sm:inline">
          Contracts
        </span>
      </span>
    </Link>
  );
}
