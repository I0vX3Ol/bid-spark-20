import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

/** POSTs to a billing endpoint with the caller's access token. */
async function billingAction<T = unknown>(path: string): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again to continue.");

  const res = await fetch(path, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });

  const body = (await res.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
  if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
  return body as T;
}

/** Cancels at the end of the paid period — access continues until then. */
export const cancelSubscription = () => billingAction("/api/billing/cancel");

/** Clears a pending cancellation. */
export const resumeSubscription = () => billingAction("/api/billing/resume");

/** Opens the Stripe Billing Portal for card updates and invoices. */
export async function openBillingPortal(): Promise<void> {
  const { url } = await billingAction<{ url: string }>("/api/billing/portal");
  window.location.assign(url);
}

/**
 * Refreshes subscription state after returning from Stripe Checkout.
 *
 * The webhook is asynchronous, so the row often does not exist yet at the
 * moment the browser lands back on the success URL. Without this the customer
 * sees "no subscription" straight after paying and reasonably concludes the
 * payment failed. Polls briefly until the subscription appears, then stops.
 */
export function useCheckoutReturn(): { settling: boolean; timedOut: boolean } {
  const queryClient = useQueryClient();
  const { subscription, entitled } = useSubscription();
  const [timedOut, setTimedOut] = useState(false);

  const isReturn =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("checkout") === "success";

  // Stops claiming to be "activating" once polling has given up. Previously
  // this was `isReturn && !entitled`, which stayed true forever when the
  // webhook never landed — the customer sat on "activating your subscription"
  // indefinitely with nothing telling them to do anything about it.
  const settling = isReturn && !entitled && !timedOut;

  useEffect(() => {
    if (!isReturn || entitled) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      void queryClient.invalidateQueries({ queryKey: ["subscription"] });
      // ~20s is comfortably longer than a healthy webhook round trip; past that
      // something is wrong and polling forever would just spin.
      if (attempts >= 10) {
        window.clearInterval(timer);
        setTimedOut(true);
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [isReturn, entitled, subscription, queryClient]);

  return { settling, timedOut };
}
