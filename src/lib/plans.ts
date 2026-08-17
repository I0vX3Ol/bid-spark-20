/**
 * GovScout plan catalogue — safe for the client bundle.
 *
 * Only slugs, ordering and entitlement rules live here. The mapping from a plan
 * to its Stripe price id is in `src/server/billing/plans.ts`, read from the
 * Worker env, so no price id or key ever reaches the browser.
 *
 * GovScout differs from the other Nexudel apps in two ways:
 *   - it has a genuine Free tier, so "signed in" does not mean "paying"
 *   - Professional is billed monthly *or* annually, so checkout takes an interval
 */

export const APP_KEY = "govscout" as const;

/** Appended after the account's "NEXUDEL" prefix on card statements. */
export const STATEMENT_DESCRIPTOR_SUFFIX = "GOVSCOUT";

export const PLANS = ["free", "professional", "enterprise"] as const;
export type Plan = (typeof PLANS)[number];

/** The only plan that can be bought self-serve. Free is free; Enterprise is sales-led. */
export const PURCHASABLE_PLANS = ["professional"] as const;
export type PurchasablePlan = (typeof PURCHASABLE_PLANS)[number];

export const INTERVALS = ["month", "year"] as const;
export type Interval = (typeof INTERVALS)[number];

export function isPlan(value: string): value is Plan {
  return (PLANS as readonly string[]).includes(value);
}

export function isPurchasablePlan(value: string): value is PurchasablePlan {
  return (PURCHASABLE_PLANS as readonly string[]).includes(value);
}

export function isInterval(value: string): value is Interval {
  return (INTERVALS as readonly string[]).includes(value);
}

/**
 * Subscription statuses that should unlock paid features.
 *
 * `past_due` deliberately counts: the card failed but Stripe is still retrying,
 * and cutting off access mid-dunning reliably turns a recoverable payment into
 * a cancellation.
 */
export const ENTITLING_STATUSES = ["active", "trialing", "past_due"] as const;

export function isEntitled(status: string | null | undefined): boolean {
  return !!status && (ENTITLING_STATUSES as readonly string[]).includes(status);
}

const RANK: Record<Plan, number> = { free: 0, professional: 1, enterprise: 2 };

/**
 * Effective plan for a user: whatever they are paying for, else Free.
 *
 * Note this returns "free" rather than null — everyone signed in has a plan,
 * which keeps the gating checks honest about what the baseline actually is.
 */
export function effectivePlan(
  plan: string | null | undefined,
  status: string | null | undefined,
): Plan {
  if (!isEntitled(status)) return "free";
  return plan && isPlan(plan) ? plan : "free";
}

export function planAtLeast(plan: Plan, minimum: Plan): boolean {
  return RANK[plan] >= RANK[minimum];
}

/** Free-tier ceilings, mirrored from src/config/pricing.ts. */
export const FREE_LIMITS = {
  savedSearches: 3,
  aiAnalysesPerMonth: 10,
  exportsPerMonth: 5,
} as const;
