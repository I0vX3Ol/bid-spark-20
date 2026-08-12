/** Plan configuration. Pricing is never hardcoded in components. */

export type BillingPeriod = "monthly" | "annual";

export type Plan = {
  id: "free" | "professional" | "enterprise";
  name: string;
  description: string;
  price: Record<BillingPeriod, number | null>;
  priceNote?: string;
  cta: { label: string; href: string };
  highlight?: boolean;
  features: string[];
  limits: {
    savedSearches: string;
    aiAnalyses: string;
    exports: string;
    alerts: string;
    seats: string;
    ads: boolean;
  };
};

export const currency = { code: "USD", symbol: "$" };

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Explore the full opportunity index and validate fit.",
    price: { monthly: 0, annual: 0 },
    cta: { label: "Start Free", href: "/signup" },
    features: [
      "Unlimited opportunity search",
      "Standard filters and sorting",
      "3 saved searches",
      "10 AI summaries per month",
      "Weekly digest email",
      "Supported by clearly labeled sponsored placements",
    ],
    limits: {
      savedSearches: "3",
      aiAnalyses: "10 / month",
      exports: "5 / month",
      alerts: "Weekly digest",
      seats: "1",
      ads: true,
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "For capture teams that need alerts, AI analysis and exports.",
    price: { monthly: 89, annual: 74 },
    priceNote: "per user, billed annually",
    cta: { label: "Start 14-day trial", href: "/signup?plan=professional" },
    highlight: true,
    features: [
      "Everything in Free, ad-free",
      "Unlimited saved searches",
      "Real-time and daily alerts",
      "Unlimited AI summaries, risk and fit analysis",
      "Unlimited CSV / XLSX exports",
      "Deadline reminders and agency updates",
      "Award history and vendor insights",
    ],
    limits: {
      savedSearches: "Unlimited",
      aiAnalyses: "Unlimited",
      exports: "Unlimited",
      alerts: "Real-time",
      seats: "1+",
      ads: false,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For multi-team programs with governance requirements.",
    price: { monthly: null, annual: null },
    priceNote: "Custom pricing",
    cta: { label: "Talk to sales", href: "/contact" },
    features: [
      "Everything in Professional",
      "Team workspaces and shared pipelines",
      "API access and data delivery",
      "SSO / SAML and SCIM provisioning",
      "Advanced analytics and reporting",
      "Role-based access and audit logs",
      "Dedicated support and onboarding",
    ],
    limits: {
      savedSearches: "Unlimited",
      aiAnalyses: "Unlimited",
      exports: "Unlimited + API",
      alerts: "Real-time + webhooks",
      seats: "Unlimited",
      ads: false,
    },
  },
];

export function formatPrice(value: number | null, period: BillingPeriod) {
  if (value === null) return "Custom";
  if (value === 0) return `${currency.symbol}0`;
  return `${currency.symbol}${value}`;
}
