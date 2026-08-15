import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/common/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nexudel — Public Sector Intelligence" },
      {
        name: "description",
        content:
          "Nexudel builds procurement intelligence software that makes public sector opportunity data searchable, understandable and actionable.",
      },
      { property: "og:title", content: "About Nexudel" },
      {
        property: "og:description",
        content: "Why we are building procurement intelligence for public sector bidders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="About"
        title="Public procurement data should be usable, not just available"
        description="Government opportunity data is public, fragmented and hard to act on. Nexudel normalizes it, explains it and puts it in front of the teams who can deliver the work."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Clarity over volume",
            body: "A thousand matches is not a result. We optimize for the handful of opportunities your team can actually win.",
          },
          {
            title: "Verifiable by design",
            body: "Every AI output sits next to the source document. Analysis accelerates review; it never replaces it.",
          },
          {
            title: "Built to extend",
            body: "Contracts is the first surface. Grants, permits, inspections and public records reuse the same platform.",
          },
        ].map((v) => (
          <div key={v.title} className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
            <h2 className="text-lg font-semibold">{v.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 max-w-[68ch]">
        <h2 className="text-2xl font-semibold">How we work</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          We ingest publicly available procurement records, normalize them into a single schema, and
          enrich each record with structured analysis. Coverage, freshness and data lineage are
          treated as product features, not implementation details.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Nexudel is an independent company and is not affiliated with, endorsed by, or acting on
          behalf of any government agency.
        </p>
      </section>
    </div>
  );
}
