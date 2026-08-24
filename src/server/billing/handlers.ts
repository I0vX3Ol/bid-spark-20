/**
 * Stripe HTTP endpoints for GovScout, mounted from `src/server.ts`.
 *
 *   POST /api/billing/checkout   authenticated -> Stripe Checkout Session URL
 *   POST /api/billing/webhook    Stripe -> updates govscout.subscriptions
 *
 * TanStack Start 1.168 exposes server logic through `createServerFn` RPC, which
 * Stripe cannot post to (it has its own wire protocol and would mangle the raw
 * body needed for signature verification). The Worker `fetch` entry is the
 * correct place for plain HTTP endpoints, and it is where `env` — and therefore
 * the secrets — is available.
 *
 * GovScout is user-scoped: a subscription belongs to one `auth.users` row, not
 * to an organisation. That mirrors govscout.bookmarks and the RLS policy on
 * govscout.subscriptions.
 */

import {
  StripeError,
  createCheckoutSession,
  createPortalSession,
  retrieveSubscription,
  setCancelAtPeriodEnd,
  subscriptionPeriodEnd,
  verifyWebhookSignature,
  type StripeCheckoutSessionCompleted,
  type StripeEnv,
  type StripeEvent,
  type StripeSubscription,
} from "./stripe";
import { APP_KEY, isInterval, isPurchasablePlan } from "@/lib/plans";
import { planForPriceId, priceIdFor, type PlanEnv } from "./plans";

export type BillingEnv = StripeEnv &
  PlanEnv & {
    SUPABASE_URL?: string;
    /** Server-only. Bypasses RLS so the webhook can write subscription rows. */
    SUPABASE_SERVICE_ROLE_KEY?: string;
    /**
     * Public key, used only to satisfy the `apikey` header when asking Supabase
     * to identify a bearer token. Validating a user's token needs no privilege
     * of its own, so it should not be done with the service role.
     */
    SUPABASE_ANON_KEY?: string;
    /** Public origin, used to build success/cancel URLs. */
    APP_ORIGIN?: string;
  };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

/* -------------------------------------------------------------------------- */
/*                              Supabase helpers                              */
/* -------------------------------------------------------------------------- */

/**
 * Resolves the caller from their Supabase access token.
 *
 * Verified by Supabase itself rather than decoded here — we never trust a
 * client-supplied user id, and this avoids handling the JWT secret.
 */
async function getUserFromToken(
  env: BillingEnv,
  token: string,
): Promise<{ id: string; email?: string | undefined } | null> {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      // The bearer token is what authenticates the call; `apikey` only routes
      // it. Falls back to the service role so an unset binding degrades to the
      // previous behaviour rather than breaking sign-in.
      apikey: env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    },
  });

  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  return user.id ? { id: user.id, email: user.email } : null;
}

/** PostgREST call against the govscout schema, using the service role. */
async function db(env: BillingEnv, path: string, init: RequestInit = {}): Promise<Response> {
  const { headers, ...rest } = init;
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
      "Content-Type": "application/json",
      "Accept-Profile": APP_KEY,
      "Content-Profile": APP_KEY,
      ...(headers as Record<string, string>),
    },
  });
}

/** Any Stripe customer id already recorded for this user. */
async function existingCustomerId(env: BillingEnv, userId: string): Promise<string | undefined> {
  const res = await db(
    env,
    `subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=stripe_customer_id&order=created_at.desc&limit=1`,
  );
  if (!res.ok) return undefined;
  const rows = (await res.json()) as Array<{ stripe_customer_id?: string }>;
  return rows[0]?.stripe_customer_id;
}

/* -------------------------------------------------------------------------- */
/*                              POST /checkout                                */
/* -------------------------------------------------------------------------- */

export async function handleCheckout(request: Request, env: BillingEnv): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Billing is not configured: missing Stripe or Supabase env bindings.");
    return json({ error: "Billing is not configured." }, 503);
  }

  const auth = request.headers.get("authorization");
  const token = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  if (!token) return json({ error: "Not signed in." }, 401);

  const user = await getUserFromToken(env, token);
  if (!user) return json({ error: "Not signed in." }, 401);

  let body: { plan?: string; interval?: string };
  try {
    body = (await request.json()) as { plan?: string; interval?: string };
  } catch {
    return json({ error: "Malformed request." }, 400);
  }

  // Whitelist both fields. Never accept a client-supplied price id — that would
  // let anyone subscribe themselves at a price of their choosing.
  const plan = body.plan;
  if (!plan || !isPurchasablePlan(plan)) {
    return json({ error: "That plan cannot be bought online." }, 400);
  }

  const interval = body.interval ?? "month";
  if (!isInterval(interval)) return json({ error: "Unknown billing interval." }, 400);

  const priceId = priceIdFor(env, plan, interval);
  if (!priceId) {
    console.error(`No price id configured for ${plan}/${interval}.`);
    return json({ error: "That plan is not available yet." }, 503);
  }

  const origin = env.APP_ORIGIN ?? new URL(request.url).origin;

  try {
    const session = await createCheckoutSession(env.STRIPE_SECRET_KEY, {
      priceId,
      customerId: await existingCustomerId(env, user.id),
      customerEmail: user.email,
      successUrl: `${origin}/settings?checkout=success`,
      cancelUrl: `${origin}/pricing?checkout=cancelled`,
      metadata: { app: APP_KEY, user_id: user.id, plan, interval },
      // Bucketed to the minute rather than the second. A per-second bucket
      // deduplicated only two clicks inside the same second, which is not the
      // double-submit this is meant to catch; a minute covers a stalled request
      // and a retry while still letting somebody start a genuinely new checkout
      // shortly after abandoning one.
      idempotencyKey: `${user.id}:${plan}:${interval}:${Math.floor(Date.now() / 60_000)}`,
    });

    return json({ url: session.url });
  } catch (error) {
    console.error("Checkout session creation failed", error);
    // Surface Stripe's classification so a failure here is diagnosable from
    // the response alone. These are documented enum values and a field name —
    // never the message, which can carry account detail.
    const detail =
      error instanceof StripeError
        ? {
            stripe_status: error.status,
            stripe_type: error.stripeType,
            stripe_code: error.stripeCode,
            stripe_param: error.stripeParam,
          }
        : {};
    return json({ error: "Could not start checkout.", ...detail }, 502);
  }
}

/* -------------------------------------------------------------------------- */
/*                              POST /webhook                                 */
/* -------------------------------------------------------------------------- */

/**
 * Writes the current state of one Stripe subscription into the database.
 *
 * Delegates to govscout.apply_subscription_event so that idempotency and
 * ordering are decided inside one statement. Stripe retries deliveries and does
 * not guarantee order, and a plain upsert honoured whichever event happened to
 * arrive last — so a replay wrote twice and a late-arriving older
 * `customer.subscription.updated` could resurrect a stale status over a newer
 * one. The function drops duplicates by event id and ignores any event older
 * than the one already reflected in the row.
 */
async function upsertSubscription(
  env: BillingEnv,
  event: StripeEvent,
  sub: StripeSubscription,
  fallbackUserId?: string,
): Promise<void> {
  const userId = sub.metadata?.["user_id"] ?? fallbackUserId;
  if (!userId) {
    console.error(`Subscription ${sub.id} has no user_id metadata; cannot attribute it.`);
    return;
  }

  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan = planForPriceId(env, priceId) ?? sub.metadata?.["plan"] ?? "unknown";
  const periodEnd = subscriptionPeriodEnd(sub);

  const res = await db(env, "rpc/apply_subscription_event", {
    method: "POST",
    body: JSON.stringify({
      p_event_id: event.id,
      p_event_type: event.type,
      p_event_created: new Date(event.created * 1000).toISOString(),
      p_user_id: userId,
      p_customer_id: sub.customer,
      p_subscription_id: sub.id,
      p_plan: plan,
      p_status: sub.status,
      p_current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      p_cancel_at_period_end: sub.cancel_at_period_end ?? false,
    }),
  });

  if (!res.ok) {
    console.error("Subscription write failed", res.status, await res.text());
    // Throwing puts us in the caller's catch, which answers 500 and asks Stripe
    // to retry — correct for a transient database failure.
    throw new Error(`apply_subscription_event returned ${res.status}`);
  }
}

export async function handleWebhook(request: Request, env: BillingEnv): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Webhook is not configured: missing Stripe or Supabase env bindings.");
    return json({ error: "Not configured." }, 503);
  }

  // The raw body is required — parsing and re-serialising changes the bytes and
  // the HMAC will never match.
  const rawBody = await request.text();

  const valid = await verifyWebhookSignature(
    rawBody,
    request.headers.get("stripe-signature"),
    env.STRIPE_WEBHOOK_SECRET,
  );

  if (!valid) {
    // 400 tells Stripe not to retry an unverifiable payload.
    return json({ error: "Invalid signature." }, 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return json({ error: "Malformed payload." }, 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as unknown as StripeCheckoutSessionCompleted;
        if (!session.subscription) break;

        // The session carries only ids; read the subscription for status and
        // period end.
        const sub = await retrieveSubscription(env.STRIPE_SECRET_KEY, session.subscription);
        await upsertSubscription(
          env,
          event,
          sub,
          session.metadata?.["user_id"] ?? session.client_reference_id ?? undefined,
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // `deleted` still carries the object with status "canceled", which is
        // what we want recorded — the row stays for history and the gate closes
        // because the status is no longer entitling.
        await upsertSubscription(env, event, event.data.object as unknown as StripeSubscription);
        break;
      }

      default:
        // Unhandled types are acknowledged so Stripe stops retrying them.
        break;
    }
  } catch (error) {
    // 500 asks Stripe to retry — correct for a transient database failure.
    console.error(`Webhook handling failed for ${event.type}`, error);
    return json({ error: "Processing failed." }, 500);
  }

  return json({ received: true });
}

/* -------------------------------------------------------------------------- */
/*                     POST /cancel, /resume, /portal                         */
/* -------------------------------------------------------------------------- */

/**
 * The caller's current subscription, read server-side.
 *
 * Ownership is established here rather than trusting a subscription id from the
 * request body — otherwise anyone could cancel anyone else's subscription by
 * guessing an id.
 */
async function currentSubscriptionFor(
  env: BillingEnv,
  userId: string,
): Promise<{ stripe_subscription_id: string; stripe_customer_id: string } | null> {
  const res = await db(
    env,
    `subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=stripe_subscription_id,stripe_customer_id&order=created_at.desc&limit=1`,
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
  }>;
  const row = rows[0];
  if (!row?.stripe_subscription_id || !row.stripe_customer_id) return null;
  return {
    stripe_subscription_id: row.stripe_subscription_id,
    stripe_customer_id: row.stripe_customer_id,
  };
}

/** Shared auth + ownership resolution for the post-purchase endpoints. */
async function requireSubscriber(
  request: Request,
  env: BillingEnv,
): Promise<
  | { ok: true; sub: { stripe_subscription_id: string; stripe_customer_id: string } }
  | { ok: false; response: Response }
> {
  if (!env.STRIPE_SECRET_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Billing is not configured: missing Stripe or Supabase env bindings.");
    return { ok: false, response: json({ error: "Billing is not configured." }, 503) };
  }

  const auth = request.headers.get("authorization");
  const token = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  if (!token) return { ok: false, response: json({ error: "Not signed in." }, 401) };

  const user = await getUserFromToken(env, token);
  if (!user) return { ok: false, response: json({ error: "Not signed in." }, 401) };

  const sub = await currentSubscriptionFor(env, user.id);
  if (!sub) return { ok: false, response: json({ error: "No subscription to manage." }, 404) };

  return { ok: true, sub };
}

/** Cancels at period end, or clears a pending cancellation. */
export async function handleCancelOrResume(
  request: Request,
  env: BillingEnv,
  cancel: boolean,
): Promise<Response> {
  const gate = await requireSubscriber(request, env);
  if (!gate.ok) return gate.response;

  try {
    await setCancelAtPeriodEnd(env.STRIPE_SECRET_KEY!, gate.sub.stripe_subscription_id, cancel);
    // Stripe emits customer.subscription.updated, which the webhook writes to
    // the database. We deliberately do not write here as well — one writer
    // keeps the row an accurate mirror of Stripe.
    return json({ ok: true, cancel_at_period_end: cancel });
  } catch (error) {
    console.error("Subscription update failed", error);
    return json({ error: "Could not update your subscription." }, 502);
  }
}

/** Billing portal, for card updates and invoice history. */
export async function handlePortal(request: Request, env: BillingEnv): Promise<Response> {
  const gate = await requireSubscriber(request, env);
  if (!gate.ok) return gate.response;

  const origin = env.APP_ORIGIN ?? new URL(request.url).origin;

  try {
    const session = await createPortalSession(
      env.STRIPE_SECRET_KEY!,
      gate.sub.stripe_customer_id,
      `${origin}/settings`,
    );
    return json({ url: session.url });
  } catch (error) {
    // Most likely cause: the portal has never been activated in the Dashboard.
    console.error("Portal session creation failed", error);
    return json({ error: "The billing portal is not available yet. Please contact support." }, 502);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Router                                    */
/* -------------------------------------------------------------------------- */

/** Returns a Response for a billing route, or null to fall through to the SSR app. */
export function routeBilling(request: Request, env: BillingEnv): Promise<Response> | null {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/billing/checkout") {
    if (request.method !== "POST") {
      return Promise.resolve(
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      );
    }
    return handleCheckout(request, env);
  }

  if (pathname === "/api/billing/cancel" || pathname === "/api/billing/resume") {
    if (request.method !== "POST") {
      return Promise.resolve(
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      );
    }
    return handleCancelOrResume(request, env, pathname.endsWith("/cancel"));
  }

  if (pathname === "/api/billing/portal") {
    if (request.method !== "POST") {
      return Promise.resolve(
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      );
    }
    return handlePortal(request, env);
  }

  if (pathname === "/api/billing/webhook") {
    if (request.method !== "POST") {
      return Promise.resolve(
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      );
    }
    return handleWebhook(request, env);
  }

  return null;
}
