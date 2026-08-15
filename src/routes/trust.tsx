import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, KeyRound, Lock, ScrollText } from "lucide-react";
import { PlaceholderNote } from "@/components/common/PlaceholderNote";
import { SectionHeading } from "@/components/common/SectionHeading";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust, Security and Compliance | Nexudel" },
      {
        name: "description",
        content:
          "How Nexudel handles data security, access control, availability and compliance commitments for procurement teams.",
      },
      { property: "og:title", content: "Nexudel Trust Center" },
      { property: "og:description", content: "Security, availability and compliance posture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        as="h1"
        eyebrow="Trust center"
        title="Security and reliability commitments"
        description="Procurement teams handle sensitive pursuit information. Here is how the platform protects it."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {[
          {
            icon: Lock,
            title: "Data protection",
            body: "Encryption in transit and at rest, isolated tenant data access and least-privilege internal controls.",
          },
          {
            icon: KeyRound,
            title: "Access control",
            body: "Role-based permissions, SSO/SAML and SCIM provisioning on Enterprise plans, with full audit logging.",
          },
          {
            icon: Activity,
            title: "Availability",
            body: "Continuous monitoring with a public status page for incident communication.",
          },
          {
            icon: ScrollText,
            title: "Compliance",
            body: "Compliance program documentation and certification status are published here as they are completed.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-subtle"
          >
            <item.icon aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <PlaceholderNote>
          Certification badges appear here once audits are complete. No badge is displayed before it
          is earned.
        </PlaceholderNote>
        <Link to="/contact" className="text-sm font-medium text-accent hover:underline">
          Request security documentation
        </Link>
      </div>
    </div>
  );
}
