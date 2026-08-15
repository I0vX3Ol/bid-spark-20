import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, plans, type BillingPeriod } from "@/config/pricing";
import { cn } from "@/lib/utils";

export function PricingSection({ compact = false }: { compact?: boolean }) {
  const [period, setPeriod] = useState<BillingPeriod>("annual");

  return (
    <section className="container-page py-20" id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Plans that scale with your pipeline"
        description="Start free. Upgrade when alerts, AI analysis and exports become part of your capture process."
      />

      <div
        className="mx-auto mt-8 inline-flex w-full max-w-xs items-center rounded-xl border border-border bg-secondary/60 p-1"
        role="group"
        aria-label="Billing period"
      >
        {(["monthly", "annual"] as BillingPeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors",
              period === p
                ? "bg-card text-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-7 shadow-subtle transition-shadow hover:shadow-card",
              plan.highlight ? "border-accent/50 shadow-card" : "border-border",
            )}
          >
            {plan.highlight ? (
              <Badge className="absolute -top-3 left-7 bg-accent text-accent-foreground">
                Most popular
              </Badge>
            ) : null}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-semibold">
                {formatPrice(plan.price[period], period)}
              </span>
              {plan.price[period] !== null && plan.price[period] !== 0 ? (
                <span className="text-sm text-muted-foreground">/ user / mo</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {plan.price[period] === 0 ? "Free forever" : (plan.priceNote ?? "billed monthly")}
            </p>

            <Button
              asChild
              variant={plan.highlight ? "accent" : "outline"}
              className="mt-6 w-full"
              size="lg"
            >
              <Link to={plan.id === "enterprise" ? "/contact" : "/signup"}>{plan.cta.label}</Link>
            </Button>

            {!compact ? (
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-muted-foreground">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
