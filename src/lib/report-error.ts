/**
 * Client-side error reporting.
 *
 * This replaces lovable-error-reporting.ts, which forwarded to
 * `window.__lovableEvents` and `window.__lovableReportRuntimeError` — globals
 * that exist only inside the Lovable editor preview. In production both were
 * undefined, so every error caught by a React boundary went nowhere at all.
 *
 * Server-side errors are already handled: error-capture.ts wraps console.error
 * and expands the cause chain, and Cloudflare collects Worker logs. The gap was
 * only ever the browser, which is what this covers.
 */
import { describeError } from "./describe-error";

type Gtag = (command: "event", name: string, params: Record<string, unknown>) => void;

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const description = describeError(error);
  const route = window.location.pathname;

  // Always visible in the browser console, formatted the same way the server
  // formats its own errors so the two read alike.
  console.error(`[govscout] ${description}`, { route, ...context });

  // Google Analytics doubles as the error sink when a measurement id is
  // configured; `exception` is a standard GA4 event. Sent only if gtag actually
  // loaded, so a blocked or unconfigured tag is not an error in itself.
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") {
    gtag("event", "exception", {
      // GA truncates long values; the first line carries the message.
      description: description.slice(0, 300),
      fatal: true,
      route,
    });
  }
}
