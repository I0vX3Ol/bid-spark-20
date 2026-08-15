import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Platform and API Reference | Nexudel" },
      {
        name: "description",
        content:
          "How Nexudel data is structured, how saved searches and alerts work, and how to access opportunity data programmatically.",
      },
      { property: "og:title", content: "Nexudel Documentation" },
      {
        property: "og:description",
        content: "Platform concepts, data schema and API reference for Nexudel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsPage,
});

const sections = [
  {
    id: "concepts",
    heading: "Core concepts",
    body: "An opportunity is a normalized procurement record with a jurisdiction level, an issuing agency, classification codes and a submission deadline. The same record shape backs every Nexudel surface, so grants and permits reuse the identical search, alerting and export layer.",
  },
  {
    id: "search",
    heading: "Search and filters",
    body: "Search combines keyword matching across title, agency, classification and summary text with structured facets for agency, jurisdiction, NAICS, PSC, set-aside, contract type, clearance, value range and dates. Filters compose with AND semantics; multiple values within one facet compose with OR.",
  },
  {
    id: "alerts",
    heading: "Saved searches and alerts",
    body: "Any search can be saved. Saved searches evaluate on a schedule and deliver matches by email in real time, daily or weekly. Deadline reminders fire relative to a record's submission date.",
  },
  {
    id: "ai",
    heading: "AI analysis",
    body: "Each record is enriched with a summary, extracted requirements, eligibility conditions, risk flags, a recommended action checklist and scoring for opportunity strength and company fit. Source documents are always linked next to generated output.",
  },
  {
    id: "api",
    heading: "API access",
    body: "Enterprise plans include REST access with API key authentication and scheduled bulk delivery. Endpoints mirror the product surfaces: opportunities, agencies, saved searches and alerts. Key management lives in account settings.",
  },
];

function DocsPage() {
  return (
    <div className="container-page grid gap-10 py-16 lg:grid-cols-12">
      <nav aria-label="Documentation" className="lg:col-span-3">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider">Contents</p>
          <ul className="mt-3 space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                  {s.heading}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="lg:col-span-9">
        <h1 className="text-3xl font-semibold sm:text-4xl">Documentation</h1>
        <p className="mt-4 max-w-[68ch] text-muted-foreground">
          How the platform is structured and how to work with it programmatically.
        </p>
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="mt-12 scroll-mt-24 max-w-[68ch]">
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
