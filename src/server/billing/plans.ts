/**
 * Server-side plan → Stripe price mapping for GovScout.
 *
 * Price ids come from the Worker env, so the same build can point at test-mode
 * prices and nothing price-related reaches the client bundle.
 *
 * Live price ids (Stripe account acct_1U5VNTQvnGDiWSOu):
 *   professional / month   price_1U5WUoQvnGDiWSOuLtDAHtdL   $89.00 per month
 *   professional / year    price_1U5WUwQvnGDiWSOupaRMlzJv   $888.00 per year ($74/mo)
 *
 * Free has no Stripe object. Enterprise is sales-led and has no self-serve price.
 */

import type { Interval, PurchasablePlan } from "@/lib/plans";

export type PlanEnv = {
  STRIPE_PRICE_PROFESSIONAL_MONTHLY?: string;
  STRIPE_PRICE_PROFESSIONAL_ANNUAL?: string;
};

/** Maps a purchasable plan + interval to its configured Stripe price id. */
export function priceIdFor(
  env: PlanEnv,
  plan: PurchasablePlan,
  interval: Interval,
): string | undefined {
  if (plan !== "professional") return undefined;
  return interval === "year"
    ? env.STRIPE_PRICE_PROFESSIONAL_ANNUAL
    : env.STRIPE_PRICE_PROFESSIONAL_MONTHLY;
}

/** Reverse lookup, so the webhook can record which plan was bought. */
export function planForPriceId(
  env: PlanEnv,
  priceId: string | undefined,
): PurchasablePlan | undefined {
  if (!priceId) return undefined;
  if (
    priceId === env.STRIPE_PRICE_PROFESSIONAL_MONTHLY ||
    priceId === env.STRIPE_PRICE_PROFESSIONAL_ANNUAL
  ) {
    return "professional";
  }
  return undefined;
}
