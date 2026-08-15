import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | GovScout" },
      {
        name: "description",
        content:
          "The terms that govern use of the GovScout platform, including acceptable use, subscriptions and data accuracy disclaimers.",
      },
      { property: "og:title", content: "GovScout Terms of Service" },
      { property: "og:description", content: "Terms governing use of the GovScout platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    heading: "Using the service",
    body: "You may use GovScout for lawful business purposes. You are responsible for the security of your account credentials and for activity performed under your account.",
  },
  {
    heading: "Subscriptions and billing",
    body: "Paid plans renew automatically for the selected term until cancelled. Plan entitlements are described on the pricing page.",
  },
  {
    heading: "Data accuracy",
    body: "Opportunity records are derived from public sources and AI-generated analysis is provided to support review. Always verify against the official solicitation before submitting a bid.",
  },
  {
    heading: "Acceptable use",
    body: "Automated scraping, resale of platform data outside a licensed API agreement, and attempts to circumvent access controls are prohibited.",
  },
  {
    heading: "Termination",
    body: "You may cancel at any time. We may suspend accounts that violate these terms or place the service at risk.",
  },
];

function TermsPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-[68ch]">
        <h1 className="text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This summary is provided as a starting template and should be reviewed by counsel before
          launch.
        </p>
        {sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
