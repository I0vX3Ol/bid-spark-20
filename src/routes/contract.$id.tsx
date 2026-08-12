import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Building2,
  CalendarClock,
  Download,
  FileText,
  MapPin,
  Share2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { PlaceholderNote } from "@/components/common/PlaceholderNote";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { daysUntil, formatCurrencyCompact, formatDate } from "@/lib/format";
import { getOpportunity, similarOpportunities } from "@/modules/opportunities/query";

export const Route = createFileRoute("/contract/$id")({
  loader: ({ params }) => {
    const opportunity = getOpportunity(params.id);
    if (!opportunity) throw notFound();
    return { opportunity, similar: similarOpportunities(opportunity) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Opportunity unavailable | NexusDel" }, { name: "robots", content: "noindex" }],
      };
    }
    const o = loaderData.opportunity;
    const title = `${o.title} — ${o.agency} | NexusDel`;
    const description = o.aiSummary.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${siteConfig.domain}/contract/${o.id}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GovernmentService",
            name: o.title,
            serviceOperator: { "@type": "GovernmentOrganization", name: o.agency },
            areaServed: `${o.city}, ${o.stateCode}`,
            description: o.aiSummary,
          }),
        },
      ],
    };
  },
  component: ContractPage,
});

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-subtle">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ContractPage() {
  const { opportunity: o, similar } = Route.useLoaderData();
  const days = daysUntil(o.deadline);

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/search" className="hover:text-foreground">
              Opportunities
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{o.solicitationNumber}</li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <header className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{o.level}</Badge>
              <Badge variant="outline">{o.setAside}</Badge>
              <Badge variant="outline">{o.contractType}</Badge>
              {o.vehicle ? <Badge variant="outline">{o.vehicle}</Badge> : null}
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{o.title}</h1>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Agency</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <Building2 aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                  {o.agency}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                  {o.city}, {o.stateCode}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Due</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <CalendarClock aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                  {formatDate(o.deadline)} ({days} days)
                </dd>
              </div>
            </dl>
          </header>

          <Section id="overview" title="Overview">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Solicitation number", o.solicitationNumber],
                ["Estimated value", formatCurrencyCompact(o.estimatedValue)],
                ["NAICS", `${o.naics.code} — ${o.naics.label}`],
                ["PSC", o.psc ? `${o.psc.code} — ${o.psc.label}` : "Not specified"],
                ["Award type", o.awardType],
                ["Security clearance", o.clearance],
                ["Posted", formatDate(o.postedDate)],
                ["Contracting office", o.office ?? o.agency],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="ai-summary" title="AI summary">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Generated analysis
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{o.aiSummary}</p>
            <Separator className="my-5" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Risk analysis</h3>
                <ul className="mt-2 space-y-2">
                  {o.intelligence.risks.map((risk) => (
                    <li key={risk} className="flex gap-2 text-sm text-muted-foreground">
                      <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                      />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Recommended actions</h3>
                <ol className="mt-2 space-y-2">
                  {o.intelligence.nextSteps.map((step, i) => (
                    <li key={step} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/12 text-[0.7rem] font-semibold text-accent">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Section>

          <Section id="requirements" title="Requirements">
            <ul className="space-y-2.5">
              {o.requirements.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="eligibility" title="Eligibility">
            <ul className="space-y-2.5">
              {o.eligibility.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="timeline" title="Timeline and important dates">
            <ol className="relative space-y-5 border-l border-border pl-6">
              {o.timeline.map((t) => (
                <li key={t.label} className="relative">
                  <span className="absolute -left-[1.85rem] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(t.date)}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="documents" title="Documents">
            <ul className="divide-y divide-border">
              {o.documents.map((doc) => (
                <li key={doc.name} className="flex items-center gap-3 py-3">
                  <FileText aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.type} · {doc.size}
                  </span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Download aria-hidden="true" /> Download
                  </Button>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="agency" title="Agency and award history">
            <p className="text-sm text-muted-foreground">
              Award history and vendor insights for {o.agency} appear here once the historical award
              feed is connected for this agency.
            </p>
            <PlaceholderNote className="mt-4">
              Placeholder — historical award data not yet connected.
            </PlaceholderNote>
          </Section>

          <section id="similar">
            <h2 className="mb-4 text-lg font-semibold">Similar opportunities</h2>
            <div className="grid gap-4">
              {similar.map((s) => (
                <OpportunityCard key={s.id} opportunity={s} compact />
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Opportunity score
              </p>
              <p className="mt-1 text-3xl font-semibold">{o.intelligence.opportunityScore}</p>
              <Progress value={o.intelligence.opportunityScore} className="mt-3" />
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Company fit</dt>
                  <dd className="font-medium">{o.intelligence.fitScore}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Competition</dt>
                  <dd className="font-medium">{o.intelligence.competition}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Proposal complexity</dt>
                  <dd className="font-medium">{o.intelligence.proposalComplexity}</dd>
                </div>
              </dl>
              <div className="mt-5 grid gap-2">
                <Button variant="accent">
                  <Bookmark aria-hidden="true" /> Save opportunity
                </Button>
                <Button variant="outline">
                  <Bell aria-hidden="true" /> Follow updates
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm">
                    <Share2 aria-hidden="true" /> Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download aria-hidden="true" /> Export
                  </Button>
                </div>
              </div>
            </div>

            <nav
              aria-label="On this page"
              className="rounded-2xl border border-border bg-card p-5 shadow-subtle"
            >
              <p className="text-xs font-semibold uppercase tracking-wider">On this page</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["overview", "Overview"],
                  ["ai-summary", "AI summary"],
                  ["requirements", "Requirements"],
                  ["eligibility", "Eligibility"],
                  ["timeline", "Timeline"],
                  ["documents", "Documents"],
                  ["agency", "Agency"],
                  ["similar", "Similar opportunities"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-muted-foreground hover:text-foreground">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
