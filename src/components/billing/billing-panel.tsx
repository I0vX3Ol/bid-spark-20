import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cancelSubscription,
  openBillingPortal,
  resumeSubscription,
  startCheckout,
  useCheckoutReturn,
  useSubscription,
} from "@/lib/subscription";
import type { Interval } from "@/lib/plans";

/**
 * Current plan plus the Professional upgrade path.
 *
 * Prices shown here are display copy. The amount actually charged comes from
 * the Stripe price id configured on the Worker — checkout takes a plan slug and
 * an interval, and looks the price up server-side, so the browser cannot
 * influence what it is billed.
 */

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
};

const PRO_FEATURES = [
  "Everything in Free, ad-free",
  "Unlimited saved searches",
  "Real-time and daily alerts",
  "Unlimited AI summaries, risk and fit analysis",
  "Unlimited CSV / XLSX exports",
  "Award history and vendor insights",
];

export function BillingPanel() {
  const { subscription, loading, entitled, plan } = useSubscription();
  const { settling, timedOut } = useCheckoutReturn();
  const [interval, setInterval] = useState<Interval>("year");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState<"cancel" | "resume" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (kind: "cancel" | "resume" | "portal") => {
    setError(null);
    setNotice(null);
    setBusy(kind);
    try {
      if (kind === "portal") {
        await openBillingPortal();
        return;
      }
      if (kind === "cancel") {
        await cancelSubscription();
        setNotice("Your plan will end when the current period does. You keep access until then.");
      } else {
        await resumeSubscription();
        setNotice("Your subscription will continue as normal.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const onUpgrade = async () => {
    setError(null);
    setPending(true);
    try {
      await startCheckout("professional", interval);
      // startCheckout navigates away on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground">Current plan</p>

        {loading ? (
          <p className="mt-1 text-sm text-muted-foreground">Checking your subscription…</p>
        ) : (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold capitalize">{plan}</p>
              {subscription && (
                <Badge variant={entitled ? "default" : "secondary"}>
                  {STATUS_LABEL[subscription.status] ?? subscription.status}
                </Badge>
              )}
            </div>

            {subscription?.current_period_end && entitled && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subscription.cancel_at_period_end ? "Ends" : "Renews"}{" "}
                <time dateTime={subscription.current_period_end}>
                  {new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </p>
            )}

            {subscription?.status === "past_due" && (
              <p className="mt-2 text-sm text-muted-foreground">
                We could not take the last payment. Your access stays on while Stripe retries.
              </p>
            )}

            {!entitled && (
              <p className="mt-2 text-sm text-muted-foreground">
                Free includes the full opportunity index, 3 saved searches and 10 AI summaries a
                month.
              </p>
            )}

            {settling && (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                Payment received — activating your subscription. This usually takes a few seconds.
              </p>
            )}

            {timedOut && !entitled && (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                Your payment went through, but the subscription has not activated yet. Nothing
                further is needed from you — reload in a minute, and if it still has not appeared,
                contact support and we will sort it out.
              </p>
            )}

            {notice && (
              <p role="status" className="mt-3 text-sm font-medium">
                {notice}
              </p>
            )}

            {entitled && subscription && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" disabled={busy !== null} onClick={() => run("portal")}>
                  {busy === "portal" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Opening…
                    </>
                  ) : (
                    "Manage payment method"
                  )}
                </Button>

                {subscription.cancel_at_period_end ? (
                  <Button variant="outline" disabled={busy !== null} onClick={() => run("resume")}>
                    {busy === "resume" ? "Resuming…" : "Resume subscription"}
                  </Button>
                ) : (
                  <Button variant="ghost" disabled={busy !== null} onClick={() => run("cancel")}>
                    {busy === "cancel" ? "Cancelling…" : "Cancel subscription"}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!entitled && !loading && (
        <div className="rounded-xl border border-border p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-lg font-semibold">Professional</h3>

            {/* Annual first — it is the better deal and the default we suggest. */}
            <div
              role="radiogroup"
              aria-label="Billing interval"
              className="flex rounded-lg border border-border p-0.5 text-sm"
            >
              {(["year", "month"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={interval === value}
                  onClick={() => setInterval(value)}
                  className={
                    interval === value
                      ? "rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground"
                      : "rounded-md px-3 py-1 text-muted-foreground"
                  }
                >
                  {value === "year" ? "Annual" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3">
            <span className="text-3xl font-semibold">{interval === "year" ? "$74" : "$89"}</span>
            <span className="text-sm text-muted-foreground"> / month</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {interval === "year"
              ? "Billed annually at $888. Save $180 a year."
              : "Billed monthly. Switch to annual any time."}
          </p>

          <ul className="mt-4 space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button className="mt-5 w-full" disabled={pending} onClick={onUpgrade}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Redirecting…
              </>
            ) : (
              <>
                Upgrade to Professional
                <ExternalLink className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>

          <p className="mt-3 text-xs text-muted-foreground">
            Payments are handled by Stripe — we never see your card details. Charges appear on your
            statement as <strong>NEXUDEL* GOVSCOUT</strong>.
          </p>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Need team workspaces, SSO or API access?{" "}
        <Link to="/contact" className="font-medium underline underline-offset-4">
          Talk to us about Enterprise
        </Link>
        .
      </p>
    </div>
  );
}
