import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Bookmark,
  CalendarClock,
  Clock,
  Eye,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";
import { PlaceholderNote } from "@/components/common/PlaceholderNote";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { daysUntil, formatDate } from "@/lib/format";
import { sampleOpportunities } from "@/modules/opportunities/data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Procurement Dashboard | GovScout" },
      {
        name: "description",
        content:
          "Saved searches, bookmarked opportunities, alerts, deadlines and AI insights in one workspace.",
      },
      { property: "og:title", content: "GovScout Dashboard" },
      { property: "og:description", content: "Your personalized procurement workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function Widget({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-subtle ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold">{title}</h2>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const savedSearches = [
  { name: "Cybersecurity · Federal · Secret", matches: 12, alert: "Real-time" },
  { name: "Virginia IT services", matches: 7, alert: "Daily" },
  { name: "SDVOSB medical equipment", matches: 4, alert: "Weekly" },
];

const activity = [
  { text: "New match for “Cybersecurity · Federal · Secret”", when: "2 hours ago" },
  { text: "Deadline reminder sent for PHX-WS-26-114", when: "Yesterday" },
  { text: "Weekly summary delivered", when: "3 days ago" },
];

function DashboardPage() {
  const upcoming = [...sampleOpportunities]
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
    .slice(0, 4);
  const recommended = [...sampleOpportunities]
    .sort((a, b) => b.intelligence.fitScore - a.intelligence.fitScore)
    .slice(0, 2);

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything matching your profile, updated continuously.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button asChild variant="outline">
            <Link to="/settings">Settings</Link>
          </Button>
          <Button asChild variant="accent">
            <Link to="/search">
              <SearchIcon aria-hidden="true" /> New search
            </Link>
          </Button>
        </div>
      </div>

      <PlaceholderNote className="mt-5">
        Demonstration workspace populated with sample data.
      </PlaceholderNote>

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { label: "Saved searches", value: "3", icon: SearchIcon },
              { label: "Bookmarks", value: "11", icon: Bookmark },
              { label: "Alerts this week", value: "24", icon: Bell },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-5 shadow-subtle"
              >
                <stat.icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                <p className="mt-3 font-display text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <Widget
            title="Recommended for you"
            icon={Sparkles}
            action={
              <Button asChild variant="link" size="sm" className="px-0">
                <Link to="/search">View all</Link>
              </Button>
            }
          >
            <div className="grid gap-4">
              {recommended.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} compact />
              ))}
            </div>
          </Widget>

          <Widget title="Upcoming deadlines" icon={CalendarClock}>
            <ul className="divide-y divide-border">
              {upcoming.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/contract/$id"
                      params={{ id: o.id }}
                      className="block truncate text-sm font-medium hover:text-accent"
                    >
                      {o.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{o.agency}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto shrink-0">
                    {daysUntil(o.deadline)}d · {formatDate(o.deadline)}
                  </Badge>
                </li>
              ))}
            </ul>
          </Widget>

          <Widget title="Recently viewed" icon={Eye}>
            <ul className="space-y-2.5">
              {sampleOpportunities.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <Link
                    to="/contract/$id"
                    params={{ id: o.id }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Widget>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Widget title="Saved searches" icon={SearchIcon}>
            <ul className="space-y-3">
              {savedSearches.map((s) => (
                <li key={s.name} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.matches} new matches · {s.alert} alerts
                  </p>
                </li>
              ))}
            </ul>
          </Widget>

          <Widget title="Account usage" icon={Activity}>
            <div className="space-y-4">
              {[
                { label: "AI analyses", used: 7, total: 10 },
                { label: "Exports", used: 2, total: 5 },
                { label: "Saved searches", used: 3, total: 3 },
              ].map((u) => (
                <div key={u.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{u.label}</span>
                    <span className="font-medium">
                      {u.used} / {u.total}
                    </span>
                  </div>
                  <Progress
                    value={(u.used / u.total) * 100}
                    aria-label={`${u.label}: ${u.used} of ${u.total} used`}
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/8 p-4">
              <p className="text-sm font-medium">Free plan</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upgrade for unlimited AI analysis, exports and real-time alerts.
              </p>
              <Button asChild variant="accent" size="sm" className="mt-3 w-full">
                <Link to="/pricing">Upgrade to Professional</Link>
              </Button>
            </div>
          </Widget>

          <Widget title="Activity feed" icon={Clock}>
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.text} className="text-sm">
                  <p className="text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.when}</p>
                </li>
              ))}
            </ul>
          </Widget>

          <AdSlot />
        </div>
      </div>
    </div>
  );
}
