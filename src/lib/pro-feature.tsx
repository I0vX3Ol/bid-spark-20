import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription";
import type { Plan } from "@/lib/plans";

/**
 * Inline gate for Professional-only features.
 *
 * GovScout has a real Free tier, so gating is per-feature rather than
 * per-route: a free user should still reach the dashboard and search, and see
 * what upgrading would add. That is why this renders an upgrade prompt in place
 * instead of redirecting.
 *
 * Like RequireAuth, this decides what to render — it is not a security
 * boundary. Row Level Security protects the data, and govscout.subscriptions is
 * writable only by the Stripe webhook's service role, so a user cannot grant
 * themselves a plan from the client.
 */
export function ProFeature({
  children,
  feature,
  minimumPlan = "professional",
  /** Renders a compact one-line prompt instead of the full card. */
  compact = false,
}: {
  children: React.ReactNode;
  feature: string;
  minimumPlan?: Plan;
  compact?: boolean;
}) {
  const { loading, hasPlan } = useSubscription();

  // Render children while loading rather than flashing an upsell at a paying
  // customer; the data underneath is protected by RLS regardless.
  if (loading || hasPlan(minimumPlan)) return <>{children}</>;

  if (compact) {
    return (
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0" aria-hidden="true" />
        <span>{feature} is on Professional.</span>
        <Link to="/pricing" className="font-medium underline underline-offset-4">
          Upgrade
        </Link>
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-background">
        <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-semibold">{feature} is a Professional feature</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Free includes the full opportunity index. Professional adds real-time alerts, unlimited AI
        analysis and unlimited exports.
      </p>
      <Button asChild className="mt-4">
        <Link to="/pricing">See plans</Link>
      </Button>
    </div>
  );
}
