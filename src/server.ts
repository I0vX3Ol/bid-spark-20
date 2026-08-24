import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { routeBilling, type BillingEnv } from "./server/billing/handlers";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * The Supabase origin this build talks to, in a form the CSP can use.
 *
 * Vite inlines VITE_* vars at build time, so this resolves to a literal in the
 * bundle. Returns both the https origin and its wss equivalent, because
 * Supabase Realtime opens a WebSocket that connect-src also governs.
 */
const SUPABASE_CONNECT_SRC = (() => {
  const raw = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  // Not a warning. Without this the policy still looks well-formed but blocks
  // every auth call and every data read, which presents as an app that loads
  // and then does nothing — far harder to diagnose than a failed build.
  if (!raw) {
    throw new Error(
      "VITE_SUPABASE_URL is not set at build time. The Content-Security-Policy " +
        "is derived from it, and without it the deployed app cannot reach Supabase at all.",
    );
  }
  try {
    const { origin } = new URL(raw);
    return `${origin} ${origin.replace(/^https:/, "wss:")}`;
  } catch {
    throw new Error(`VITE_SUPABASE_URL is not a valid URL: ${JSON.stringify(raw)}`);
  }
})();

/**
 * Google Analytics origins, added to the policy only when a measurement id was
 * configured at build time. Listing them unconditionally would widen the policy
 * for every deploy, including the ones with no analytics at all.
 */
const GA_ENABLED = Boolean(import.meta.env["VITE_GA4_ID"]);
const GA_SCRIPT_SRC = GA_ENABLED ? " https://www.googletagmanager.com" : "";
const GA_CONNECT_SRC = GA_ENABLED
  ? " https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com"
  : "";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    // Cloudflare injects its analytics beacon into the response; without this
    // the browser blocks it and logs a CSP violation on every page load.
    // 'unsafe-inline' is load-bearing here and cannot currently be removed:
    // TanStack Start emits a per-request inline hydration script (~13KB of
    // router state), so its hash changes on every response and a hash-based
    // policy is impossible. A nonce would work, but the framework provides no
    // way to stamp one onto the script it injects. Revisit if that changes.
    `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${GA_SCRIPT_SRC}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    // Supabase is a different origin, so 'self' alone blocks every auth call
    // and every data read — which silently made the whole app unusable.
    // Derived from the configured URL rather than hardcoded, so it cannot
    // drift out of step with VITE_SUPABASE_URL, and scoped to that one project
    // rather than a *.supabase.co wildcard.
    `connect-src 'self' ${SUPABASE_CONNECT_SRC} https://cloudflareinsights.com${GA_CONNECT_SRC}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    // Stripe Checkout is a top-level redirect, not a form post, so it needs no
    // form-action entry here.
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
};

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Cloudflare bindings (secrets) for the current request.
 *
 * Nitro's Cloudflare entry does `globalThis.__env__ = env` and then calls the
 * app with the request alone — the `env` argument never reaches this handler,
 * so reading it directly yields undefined and every binding looks unset. The
 * stash is the supported way to get at them from inside the app.
 *
 * Falls back to the argument in case a future Nitro version starts forwarding
 * it, and to an empty object so a missing binding is a clean 503 rather than a
 * crash.
 */
function resolveEnv(passed: unknown): BillingEnv {
  const stashed = (globalThis as { __env__?: unknown }).__env__;
  const candidate =
    passed && typeof passed === "object" && Object.keys(passed).length > 0 ? passed : stashed;
  return (candidate ?? {}) as BillingEnv;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Stripe endpoints are handled before the SSR router. They need the raw
      // request body and the Worker's secret bindings, neither of which survive
      // a trip through TanStack Start's server-function RPC layer.
      const billing = routeBilling(request, resolveEnv(env));
      if (billing) return withSecurityHeaders(await billing);

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
