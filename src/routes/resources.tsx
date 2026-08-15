import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileText, GraduationCap, LifeBuoy } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources for Government Contractors | Nexudel" },
      {
        name: "description",
        content:
          "Guides, templates and reference material for federal, state and local contracting teams — from SAM.gov registration to proposal review.",
      },
      { property: "og:title", content: "Nexudel Resources" },
      {
        property: "og:description",
        content: "Practical guides and references for public sector capture teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

const groups = [
  {
    icon: BookOpen,
    title: "Getting started guides",
    body: "SAM.gov registration, NAICS selection, set-aside eligibility and capability statements.",
    href: "/blog",
  },
  {
    icon: FileText,
    title: "Proposal templates",
    body: "Compliance matrices, past performance formats and pricing narrative structures.",
    href: "/blog",
  },
  {
    icon: GraduationCap,
    title: "Procurement glossary",
    body: "Plain-language definitions for IDIQ, BPA, FAR clauses, CPARS, LPTA and more.",
    href: "/docs",
  },
  {
    icon: LifeBuoy,
    title: "Support center",
    body: "Account help, billing questions and data coverage requests.",
    href: "/contact",
  },
];

function ResourcesPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        as="h1"
        eyebrow="Resources"
        title="Everything your team needs to bid with confidence"
        description="Reference material maintained alongside the platform. New guides are published to the blog."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {groups.map((g) => (
          <Link
            key={g.title}
            to={g.href}
            className="rounded-2xl border border-border bg-card p-6 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card"
          >
            <g.icon aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="mt-4 text-lg font-semibold">{g.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{g.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
