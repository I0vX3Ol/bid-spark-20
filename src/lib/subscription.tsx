import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  effectivePlan,
  isEntitled,
  planAtLeast,
  type Interval,
  type Plan,
  type PurchasablePlan,
} from "@/lib/plans";

/**
 * Subscription state for the signed-in user.
 *
 * Reads `public.govscout_subscriptions`, a security_invoker view over
 * `govscout.subscriptions`. RLS restricts rows to the caller, and the view
 * omits Stripe identifiers — the client only needs the plan, the status and the
 * period end.
 *
 * GovScout has a real Free tier, so a signed-in user with no subscription is
 * on "free" rather than locked out. `hasPlan("professional")` is the check that
 * actually gates paid features.
 *
 * This is a convenience gate for rendering. It is not what protects data —
 * Row Level Security does that, whether or not this hook is consulted.
 */

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const { data, error } = await supabase
        .from("govscout_subscriptions")
        .select("id, user_id, plan, status, current_period_end, cancel_at_period_end")
        // Newest first, so a resubscribe supersedes an old cancelled row.
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as SubscriptionRow | null) ?? null;
    },
  });

  const subscription = query.data ?? null;
  const plan = effectivePlan(subscription?.plan, subscription?.status);

  return {
    subscription,
    /** True while we genuinely do not know yet — avoids gate flicker. */
    loading: authLoading || (!!user && query.isPending),
    /** The plan in force, defaulting to "free" for signed-in users. */
    plan,
    /** True only when a paid plan is active. */
    entitled: isEntitled(subscription?.status),
    /** e.g. hasPlan("professional") for "Professional or above". */
    hasPlan: (minimum: Plan) => planAtLeast(plan, minimum),
  };
}

/** Starts Stripe Checkout and redirects the browser to it. */
export async function startCheckout(
  plan: PurchasablePlan,
  interval: Interval = "month",
): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again to continue.");

  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan, interval }),
  });

  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!res.ok || !body.url) {
    throw new Error(body.error ?? "Could not start checkout. Please try again.");
  }

  window.location.assign(body.url);
}
