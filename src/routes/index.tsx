import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Building2,
  Database,
  Filter,
  LineChart,
  Search as SearchIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { FaqSection } from "@/components/marketing/FaqSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { products, siteConfig } from "@/config/site";
import { sampleOpportunities } from "@/modules/opportunities/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Search Every Government Contract | Nexudel Contracts Intelligence" },
      {
        name: "description",
        content:
          "Search federal, state and local contracting opportunities in one place. AI summaries, intelligent filters, personalized alerts and opportunity intelligence.",
      },
      { property: "og:title", content: "Search Every Government Contract | Nexudel" },
      {
        property: "og:description",
        content:
          "One searchable index of government contracting opportunities, with AI summaries, filters and alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const capabilities = [
  {
    icon: Database,
    title: "One unified index",
    body: "Federal, state, county and municipal solicitations normalized into a single consistent record structure.",
  },
  {
    icon: Sparkles,
    title: "AI summaries",
    body: "Plain-language scope, deliverables and evaluation criteria extracted from long solicitation documents.",
  },
  {
    icon: Filter,
    title: "Intelligent filtering",
    body: "Filter by NAICS, set-aside, agency, value band, place of performance and deadline window.",
  },
  {
    icon: Bell,
    title: "Personalized alerts",
    body: "Save a search once and get matches delivered in real time, daily or weekly.",
  },
  {
    icon: LineChart,
    title: "Opportunity intelligence",
    body: "Fit scoring, competition signals and agency buying history to prioritize your pipeline.",
  },
  {
    icon: ShieldCheck,
    title: "Source transparency",
    body: "Every record links back to the official notice so your team can verify before bidding.",
  },
];

const steps = [
  {
    n: "01",
    title: "Search",
    body: "Start with a keyword, agency or NAICS code across the full index.",
  },
  {
    n: "02",
    title: "Filter",
    body: "Narrow by set-aside, value, location and deadline until the list is yours.",
  },
  { n: "03", title: "Analyze", body: "Read the AI summary, requirements breakdown and fit score." },
  {
    n: "04",
    title: "Track",
    body: "Save the search, bookmark the opportunity and get alerted on changes.",
  },
];

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const featured = sampleOpportunities.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 hero-glow" />
        <div aria-hidden="true" className="absolute inset-0 grid-backdrop" />
        <div className="container-page relative py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <Sparkles aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 text-accent" />
              AI-powered procurement intelligence
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-6xl">
              Search every government contracting opportunity in one place
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              AI summaries, intelligent filtering, personalized alerts and opportunity intelligence
              — built for teams that win public sector work.
            </p>

            <form
              className="mx-auto mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/search", search: { q } });
              }}
              role="search"
            >
              <label htmlFor="hero-search" className="sr-only">
                Search opportunities
              </label>
              <div className="relative flex-1">
                <SearchIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="hero-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try “cybersecurity”, “Army”, or NAICS 541512"
                  className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base shadow-subtle outline-none transition-colors focus:border-accent"
                />
              </div>
              <Button type="submit" variant="accent" size="xl">
                Search
                <ArrowRight aria-hidden="true" />
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Popular:</span>
              {["cybersecurity", "IT services", "8(a) set-aside", "medical equipment"].map((t) => (
                <Link
                  key={t}
                  to="/search"
                  search={{ q: t }}
                  className="rounded-full border border-border px-3 py-1 transition-colors hover:border-accent hover:text-foreground"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
          {[
            { label: "Sources unified", value: "Federal, state & local" },
            { label: "Updated", value: "Continuously, every day" },
            { label: "Verification", value: "Links to official notices" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-lg font-semibold">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Platform"
          title="Everything a capture team needs before the bid decision"
          description="From discovery to qualification, in one workspace instead of six agency portals."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <article
              key={c.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <c.icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Live index"
            title="A sample of what's open right now"
            description="Each record carries deadlines, value, set-aside status and an AI summary."
          />
          <div className="mt-12 grid gap-5">
            {featured.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/search">
                Browse all opportunities
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="How it works" title="Four steps from search to submission-ready" />
        <ol className="mt-12 grid gap-5 md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-sm font-semibold text-accent">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-card/40 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Product suite"
            title="Built to expand beyond contracts"
            description="The same search, alerting and intelligence layer applied to every public sector data source."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.key} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Building2 aria-hidden="true" className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">{p.name}</h3>
                  <Badge
                    variant={p.status === "live" ? "secondary" : "outline"}
                    className="ml-auto"
                  >
                    {p.status === "live" ? "Live" : "Planned"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.tagline}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <PricingSection compact />
      </section>

      <section className="border-t border-border py-20">
        <div className="container-page">
          <FaqSection />
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary px-8 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Stop checking six portals every morning
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="accent" size="xl">
              <Link to="/signup">Start free</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/contact">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
