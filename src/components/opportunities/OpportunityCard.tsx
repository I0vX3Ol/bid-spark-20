import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Building2,
  CalendarClock,
  ChevronDown,
  Columns2,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { daysUntil, deadlineTone, formatCurrencyCompact, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/modules/opportunities/types";

const toneClass = {
  destructive: "bg-destructive/10 text-destructive border-destructive/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/35 dark:text-warning",
  success: "bg-success/12 text-success border-success/30",
} as const;

export function OpportunityCard({
  opportunity,
  compact = false,
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const days = daysUntil(opportunity.deadline);
  const tone = deadlineTone(days);

  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-md font-medium">
          {opportunity.level}
        </Badge>
        <Badge variant="outline" className="rounded-md font-medium">
          {opportunity.setAside}
        </Badge>
        <Badge variant="outline" className="rounded-md font-medium">
          {opportunity.contractType}
        </Badge>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
            toneClass[tone],
          )}
        >
          <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
          {days > 0 ? `${days} days left` : "Closed"}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug">
        <Link
          to="/contract/$id"
          params={{ id: opportunity.id }}
          className="transition-colors hover:text-accent"
        >
          {opportunity.title}
        </Link>
      </h3>

      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          <dt className="sr-only">Agency</dt>
          <dd className="truncate">{opportunity.agency}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
          <dt className="sr-only">Location</dt>
          <dd>
            {opportunity.city}, {opportunity.stateCode}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-muted-foreground">Estimated value</dt>
          <dd className="font-semibold text-foreground">
            {formatCurrencyCompact(opportunity.estimatedValue)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-muted-foreground">Due</dt>
          <dd className="font-medium text-foreground">{formatDate(opportunity.deadline)}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-xl border border-border bg-secondary/45 p-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> AI summary
        </p>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-muted-foreground",
            !expanded && "line-clamp-2",
          )}
        >
          {opportunity.aiSummary}
        </p>
        {expanded ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Key requirements
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {opportunity.requirements.slice(0, 3).map((req) => (
                  <li key={req}>• {req}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Recommended actions
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {opportunity.intelligence.nextSteps.slice(0, 3).map((step) => (
                  <li key={step}>• {step}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
          NAICS {opportunity.naics.code}
        </span>
        <span className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
          Posted {formatDate(opportunity.postedDate)}
        </span>
        <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
          Opportunity score {opportunity.intelligence.opportunityScore}
        </span>
      </div>

      {!compact ? (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
          <Button
            variant={saved ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSaved((s) => !s)}
            aria-pressed={saved}
          >
            <Bookmark aria-hidden="true" className={cn(saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 aria-hidden="true" /> Share
          </Button>
          <Button variant="ghost" size="sm">
            <Columns2 aria-hidden="true" /> Compare
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
          >
            {expanded ? "Collapse" : "Expand"}
            <ChevronDown
              aria-hidden="true"
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </Button>
        </div>
      ) : null}
    </article>
  );
}
