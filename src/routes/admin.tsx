import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  FileStack,
  Mail,
  Megaphone,
  ScrollText,
  Settings2,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { PlaceholderNote } from "@/components/common/PlaceholderNote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sampleOpportunities } from "@/modules/opportunities/data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console | NexusDel" },
      {
        name: "description",
        content: "Internal console for user management, content operations and platform analytics.",
      },
      { property: "og:title", content: "NexusDel Admin" },
      { property: "og:description", content: "Internal operations console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const modules = [
  { icon: Users, title: "Users", body: "Accounts, plans, impersonation and suspensions." },
  { icon: FileStack, title: "Records", body: "Ingested opportunities, source health and overrides." },
  { icon: Star, title: "Featured", body: "Curate promoted opportunities and homepage highlights." },
  { icon: BarChart3, title: "Analytics", body: "Acquisition, activation, retention and revenue." },
  { icon: Mail, title: "Email campaigns", body: "Digests, lifecycle sequences and broadcasts." },
  { icon: Megaphone, title: "Announcements", body: "In-app banners and release notes." },
  { icon: ShieldCheck, title: "Moderation", body: "Reported content and review queue." },
  { icon: Settings2, title: "System settings", body: "Feature flags, limits and ingestion schedules." },
  { icon: ScrollText, title: "Audit logs", body: "Administrative actions with actor and timestamp." },
];

function AdminPage() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Admin console</h1>
        <Badge variant="secondary">Internal</Badge>
        <Button variant="outline" size="sm" className="ml-auto">
          Manage roles
        </Button>
      </div>

      <PlaceholderNote className="mt-5">
        Interface scaffold — actions are wired once the backend and role checks are enabled.
      </PlaceholderNote>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <section
            key={m.title}
            className="rounded-2xl border border-border bg-card p-5 shadow-subtle transition-shadow hover:shadow-card"
          >
            <m.icon aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="mt-4 text-base font-semibold">{m.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recently ingested records</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">Recently ingested opportunity records</caption>
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">Title</th>
                <th scope="col" className="p-3 font-semibold">Agency</th>
                <th scope="col" className="p-3 font-semibold">Posted</th>
                <th scope="col" className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleOpportunities.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="max-w-xs truncate p-3">{o.title}</td>
                  <td className="p-3 text-muted-foreground">{o.agency}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(o.postedDate)}</td>
                  <td className="p-3">
                    <Badge variant="secondary">Published</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
