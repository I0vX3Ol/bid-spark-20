import { RequireAuth } from "@/lib/require-auth";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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
import {
  fetchBookmarks,
  fetchOpportunities,
  fetchProfile,
  fetchSavedSearches,
  deleteSavedSearch,
} from "@/modules/opportunities/remote";
import type { GovProfile, SavedSearch } from "@/modules/opportunities/remote";
import type { Opportunity } from "@/modules/opportunities/types";

export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    const [opportunities, savedSearches, bookmarks, profile] = await Promise.all([
      fetchOpportunities(),
      fetchSavedSearches(),
      fetchBookmarks(),
      fetchProfile(),
    ]);
    return { opportunities, savedSearches, bookmarks, profile };
  },
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
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
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

function DashboardPage() {
  const router = useRouter();
  const { opportunities, savedSearches, bookmarks, profile } = Route.useLoaderData() as {
    opportunities: Opportunity[];
    savedSearches: SavedSearch[];
    bookmarks: string[];
    profile: GovProfile | null;
  };

  const now = Date.now();
  const upcoming = [...opportunities]
    .filter((o) => +new Date(o.deadline) >= now)
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
    .slice(0, 4);
  const bookmarked = opportunities.filter((o) => bookmarks.includes(o.id));
  const recommended = [...opportunities]
    .sort((a, b) => b.intelligence.fitScore - a.intelligence.fitScore)
    .slice(0, 2);

  const removeSearch = async (id: string, name: string) => {
    try {
      await deleteSavedSearch(id);
      await router.invalidate();
    } catch {
      window.alert(`Couldn't delete ${name}.`);
    }
  };

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

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { label: "Saved searches", value: String(savedSearches.length), icon: SearchIcon },
              { label: "Bookmarks", value: String(bookmarks.length), icon: Bookmark },
              {
                label: "Alerts enabled",
                value: String(savedSearches.filter((s) => s.alertFrequency !== "none").length),
                icon: Bell,
              },
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

          <Widget title="Bookmarked" icon={Eye}>
            <ul className="space-y-2.5">
              {bookmarked.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Nothing bookmarked yet — save an opportunity from search.
                </li>
              ) : null}
              {bookmarked.slice(0, 5).map((o) => (
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
              {savedSearches.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  No saved searches yet — run a search and save it.
                </li>
              ) : null}
              {savedSearches.map((s) => (
                <li key={s.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-medium">{s.name}</p>
                    <button
                      type="button"
                      onClick={() => void removeSearch(s.id, s.name)}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.alertFrequency === "none" ? "No alerts" : `${s.alertFrequency} alerts`}
                  </p>
                </li>
              ))}
            </ul>
          </Widget>

          <Widget title="Plan" icon={Activity}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Saved searches</span>
                  <span className="font-medium">{savedSearches.length}</span>
                </div>
                <Progress
                  value={Math.min(100, savedSearches.length * 20)}
                  aria-label={`${savedSearches.length} saved searches`}
                  className="mt-1.5"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Bookmarks</span>
                  <span className="font-medium">{bookmarks.length}</span>
                </div>
                <Progress
                  value={Math.min(100, bookmarks.length * 10)}
                  aria-label={`${bookmarks.length} bookmarks`}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/8 p-4">
              <p className="text-sm font-medium">
                {profile?.plan === "free" ? "Free plan" : `${profile?.plan ?? "Free"} plan`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Paid plans are not available yet.
              </p>
            </div>
          </Widget>

          <Widget title="Recent saves" icon={Clock}>
            <ul className="space-y-3">
              {savedSearches.length === 0 ? (
                <li className="text-sm text-muted-foreground">Nothing yet.</li>
              ) : null}
              {savedSearches.slice(0, 5).map((s) => (
                <li key={s.id} className="text-sm">
                  <p className="text-foreground">Saved “{s.name}”</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
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
