import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Check, Minus } from "lucide-react";
import { FaqSection } from "@/components/marketing/FaqSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { plans } from "@/config/pricing";

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo({
      path: "/pricing",
      title: "Pricing — Procurement Intelligence Plans | GovScout",
      description:
        "Compare GovScout plans: free opportunity search, Professional alerts and AI analysis, and Enterprise workspaces with API access and SSO.",
      ogTitle: "GovScout Pricing",
      ogDescription: "Free, Professional and Enterprise plans for government contracting teams.",
    }),
  component: PricingPage,
});

const rows: { label: string; key: keyof (typeof plans)[number]["limits"] }[] = [
  { label: "Saved searches", key: "savedSearches" },
  { label: "AI analyses", key: "aiAnalyses" },
  { label: "Exports", key: "exports" },
  { label: "Alerts", key: "alerts" },
  { label: "Seats", key: "seats" },
];

function PricingPage() {
  return (
    <>
      <div className="border-b border-border hero-glow">
        <div className="container-page py-16 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Every plan includes the full opportunity index. Upgrade for alerts, unlimited AI
            analysis and exports.
          </p>
        </div>
      </div>

      <PricingSection />

      <section className="container-page pb-20">
        <h2 className="text-2xl font-semibold">Plan comparison</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">Feature comparison across GovScout plans</caption>
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th scope="col" className="p-4 font-semibold">
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className="p-4 font-semibold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <th scope="row" className="p-4 text-left font-medium text-muted-foreground">
                    {row.label}
                  </th>
                  {plans.map((p) => (
                    <td key={p.id} className="p-4">
                      {String(p.limits[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="p-4 text-left font-medium text-muted-foreground">
                  Ad-free experience
                </th>
                {plans.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.limits.ads ? (
                      <Minus aria-label="Not included" className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Check aria-label="Included" className="h-4 w-4 text-success" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
