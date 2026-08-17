/**
 * Minimal Stripe client for the Cloudflare Workers runtime.
 *
 * Deliberately hand-rolled rather than pulling in the `stripe` npm package: we
 * need exactly two operations (create a Checkout Session, verify a webhook
 * signature), and the official SDK expects Node built-ins, which would force
 * `nodejs_compat` on the Worker and a much larger bundle for no benefit.
 *
 * Everything here runs server-side only. The secret key is read from the
 * Worker's env bindings and must never be imported into client code — see
 * `src/server/billing/README.md`.
 */

const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_API_VERSION = "2024-06-20";

export type StripeEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
};

/** Stripe's API is form-encoded, including nested keys like `metadata[app]`. */
function toFormBody(value: unknown, prefix = "", form = new URLSearchParams()): URLSearchParams {
  if (value === undefined || value === null) return form;

  if (Array.isArray(value)) {
    value.forEach((item, i) => toFormBody(item, `${prefix}[${i}]`, form));
    return form;
  }

  if (typeof value === "object") {
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      toFormBody(val, prefix ? `${prefix}[${key}]` : key, form);
    }
    return form;
  }

  form.append(prefix, String(value));
  return form;
}

export class StripeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "StripeError";
  }
}

async function stripeRequest<T>(
  secretKey: string,
  path: string,
  body: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
    "Stripe-Version": STRIPE_API_VERSION,
  };

  // Guards against a double-submitted checkout creating two subscriptions.
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers,
    body: toFormBody(body).toString(),
  });

  const json = (await res.json()) as { error?: { message?: string } };

  if (!res.ok) {
    // Stripe's message can contain account detail; log it, don't return it.
    console.error("Stripe API error", res.status, json.error?.message);
    throw new StripeError("Stripe request failed", res.status);
  }

  return json as T;
}

export type CheckoutSession = { id: string; url: string };

export function createCheckoutSession(
  secretKey: string,
  params: {
    priceId: string;
    customerId?: string | undefined;
    customerEmail?: string | undefined;
    successUrl: string;
    cancelUrl: string;
    /** Shown on the card statement after the account prefix, e.g. NEXUDEL* GOVSCOUT */
    statementDescriptorSuffix: string;
    /** Echoed back on the webhook so we can attach the sub to the right tenant. */
    metadata: Record<string, string>;
    idempotencyKey?: string | undefined;
  },
): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(
    secretKey,
    "/checkout/sessions",
    {
      mode: "subscription",
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.metadata["user_id"],
      // Reuse the existing Stripe customer when we know it, so a returning
      // subscriber does not end up with duplicate customer records.
      ...(params.customerId
        ? { customer: params.customerId }
        : params.customerEmail
          ? { customer_email: params.customerEmail }
          : {}),
      metadata: params.metadata,
      subscription_data: {
        metadata: params.metadata,
        // Per-app suffix so a customer can tell which product charged them.
        statement_descriptor: params.statementDescriptorSuffix,
      },
      allow_promotion_codes: true,
    },
    params.idempotencyKey,
  );
}

/* -------------------------------------------------------------------------- */
/*                           Webhook signature check                          */
/* -------------------------------------------------------------------------- */

/** Constant-time compare — never short-circuit on the first differing byte. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies a `Stripe-Signature` header against the raw request body.
 *
 * Implements Stripe's documented scheme: the header carries a timestamp `t` and
 * one or more `v1` HMAC-SHA256 signatures over `${t}.${payload}`. We recompute
 * the HMAC and compare in constant time, and reject anything older than the
 * tolerance so a captured request cannot be replayed later.
 *
 * The payload MUST be the exact raw body string. Parsing to JSON and
 * re-stringifying changes the bytes and the signature will never match.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!signatureHeader) return false;

  let timestamp = "";
  const signatures: string[] = [];

  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key?.trim() === "t") timestamp = value ?? "";
    else if (key?.trim() === "v1" && value) signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) return false;

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  const expected = toHex(mac);

  // Stripe may send several v1 signatures during a secret rotation.
  return signatures.some((candidate) => timingSafeEqual(candidate, expected));
}

/* -------------------------------------------------------------------------- */
/*                              Event shapes                                  */
/* -------------------------------------------------------------------------- */

export type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  items?: { data?: Array<{ price?: { id?: string } }> };
  metadata?: Record<string, string>;
};

export type StripeCheckoutSessionCompleted = {
  id: string;
  customer: string | null;
  subscription: string | null;
  client_reference_id: string | null;
  metadata?: Record<string, string>;
};

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

/** Reads a subscription by id — used to fill in detail the event may omit. */
export async function retrieveSubscription(
  secretKey: string,
  subscriptionId: string,
): Promise<StripeSubscription> {
  const res = await fetch(`${STRIPE_API}/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_API_VERSION,
    },
  });

  if (!res.ok) {
    console.error("Stripe subscription fetch failed", res.status);
    throw new StripeError("Could not load subscription", res.status);
  }

  return (await res.json()) as StripeSubscription;
}

/**
 * Sets or clears `cancel_at_period_end` on a subscription.
 *
 * Cancelling at period end rather than immediately is deliberate: the customer
 * has paid for the current period, so they keep access until it runs out. The
 * resulting `customer.subscription.updated` event flows back through the
 * webhook and updates our row, so the database stays Stripe's mirror rather
 * than a second source of truth we have to keep in step by hand.
 */
export function setCancelAtPeriodEnd(
  secretKey: string,
  subscriptionId: string,
  cancelAtPeriodEnd: boolean,
): Promise<StripeSubscription> {
  return stripeRequest<StripeSubscription>(secretKey, `/subscriptions/${subscriptionId}`, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });
}

export type PortalSession = { id: string; url: string };

/**
 * Creates a Stripe Billing Portal session for updating cards and reading
 * invoices.
 *
 * Requires the portal to have been activated once in the Stripe Dashboard
 * (Settings -> Billing -> Customer portal). Until then Stripe returns an error,
 * which the handler surfaces as a clear message rather than a stack trace —
 * cancelling does not depend on the portal, so the rest of billing still works.
 */
export function createPortalSession(
  secretKey: string,
  customerId: string,
  returnUrl: string,
): Promise<PortalSession> {
  return stripeRequest<PortalSession>(secretKey, "/billing_portal/sessions", {
    customer: customerId,
    return_url: returnUrl,
  });
}
