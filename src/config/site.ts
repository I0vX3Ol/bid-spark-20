/**
 * Central site + product configuration.
 * Product surfaces (Contracts, Grants, Permits, ...) are registered here so the
 * navigation, dashboard and billing layers stay product-agnostic.
 */

export type ProductKey = "contracts" | "grants" | "permits" | "inspections" | "records";

export type ProductDefinition = {
  key: ProductKey;
  name: string;
  tagline: string;
  href: string;
  status: "live" | "planned";
};

export const siteConfig = {
  name: "GovScout",
  productSuiteName: "GovScout Intelligence",
  appName: "GovScout Contracts Intelligence",
  domain: "https://govscout.nexudel.com",
  description:
    "Search federal, state, and local contracting opportunities with AI-powered summaries, advanced filters, personalized alerts, and procurement intelligence.",
  primaryCta: { label: "Start Free", href: "/signup" },
  secondaryCta: { label: "Explore Opportunities", href: "/search" },
} as const;

export const products: ProductDefinition[] = [
  {
    key: "contracts",
    name: "Contracts Intelligence",
    tagline: "Federal, state and local contracting opportunities.",
    href: "/search",
    status: "live",
  },
  {
    key: "grants",
    name: "Grants Intelligence",
    tagline: "Discretionary and formula grant programs.",
    href: "/products",
    status: "planned",
  },
  {
    key: "permits",
    name: "Permits Intelligence",
    tagline: "Building permit activity and pipeline signals.",
    href: "/products",
    status: "planned",
  },
  {
    key: "inspections",
    name: "Inspections",
    tagline: "Inspection outcomes and compliance history.",
    href: "/products",
    status: "planned",
  },
  {
    key: "records",
    name: "Public Records",
    tagline: "Regulatory and public record intelligence.",
    href: "/products",
    status: "planned",
  },
];

export const mainNav = [
  { label: "Products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Documentation", href: "/docs" },
  { label: "About", href: "/about" },
] as const;

/** Analytics placeholders — wire real IDs in via environment configuration. */
export const analyticsConfig = {
  googleAnalyticsId: "" as string,
  posthogKey: "" as string,
  clarityId: "" as string,
  searchConsoleVerification: "" as string,
};
