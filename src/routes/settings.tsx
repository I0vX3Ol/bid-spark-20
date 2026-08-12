import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderNote } from "@/components/common/PlaceholderNote";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { plans } from "@/config/pricing";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings | NexusDel" },
      {
        name: "description",
        content:
          "Manage your profile, billing, notification preferences, saved searches, security settings and API keys.",
      },
      { property: "og:title", content: "NexusDel Account Settings" },
      { property: "og:description", content: "Manage profile, billing and notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const field =
  "mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent";

const notificationPrefs = [
  { id: "saved-search", label: "Saved search alerts", desc: "New opportunities matching saved searches." },
  { id: "deadlines", label: "Deadline reminders", desc: "Reminders before submission deadlines." },
  { id: "agency", label: "Agency updates", desc: "Amendments and notices from followed agencies." },
  { id: "daily", label: "Daily digest", desc: "One summary email each weekday morning." },
  { id: "weekly", label: "Weekly summary", desc: "Pipeline recap every Monday." },
  { id: "browser", label: "Browser notifications", desc: "Desktop notifications while signed in." },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-subtle">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const professional = plans.find((p) => p.id === "professional")!;

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">Account settings</h1>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Panel title="Profile">
            <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="p-name">Full name</Label>
                <input id="p-name" className={field} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="p-email">Work email</Label>
                <input id="p-email" type="email" className={field} autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="p-company">Company</Label>
                <input id="p-company" className={field} autoComplete="organization" />
              </div>
              <div>
                <Label htmlFor="p-naics">Primary NAICS</Label>
                <input id="p-naics" placeholder="541512" className={field} />
              </div>
              <div className="sm:col-span-2">
                <Button variant="accent" type="submit">
                  Save changes
                </Button>
              </div>
            </form>
          </Panel>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Panel title="Billing">
            <div className="rounded-xl border border-border p-5">
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="mt-1 text-lg font-semibold">Free</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Upgrade to {professional.name} for {professional.limits.alerts.toLowerCase()} alerts,
                unlimited AI analysis and exports.
              </p>
              <Button variant="accent" className="mt-4">
                Upgrade plan
              </Button>
            </div>
            <PlaceholderNote className="mt-5">
              Payment method and invoice history appear here once billing is connected.
            </PlaceholderNote>
          </Panel>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Panel title="Notification preferences">
            <ul className="divide-y divide-border">
              {notificationPrefs.map((pref) => (
                <li key={pref.id} className="flex items-start gap-4 py-4">
                  <div>
                    <Label htmlFor={pref.id} className="text-sm font-medium">
                      {pref.label}
                    </Label>
                    <p className="mt-1 text-sm text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch id={pref.id} className="ml-auto mt-1" defaultChecked={pref.id !== "browser"} />
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Panel title="Security">
            <form className="grid max-w-md gap-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="s-current">Current password</Label>
                <input id="s-current" type="password" className={field} autoComplete="current-password" />
              </div>
              <div>
                <Label htmlFor="s-new">New password</Label>
                <input id="s-new" type="password" className={field} autoComplete="new-password" />
              </div>
              <Button variant="accent" type="submit" className="w-fit">
                Update password
              </Button>
            </form>
            <div className="mt-6 flex items-start gap-4 border-t border-border pt-5">
              <div>
                <Label htmlFor="s-mfa" className="text-sm font-medium">
                  Two-factor authentication
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Require a verification code at sign-in.
                </p>
              </div>
              <Switch id="s-mfa" className="ml-auto mt-1" />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <Panel title="API keys">
            <p className="text-sm text-muted-foreground">
              API access is available on Enterprise plans. Keys are created, rotated and revoked
              here.
            </p>
            <PlaceholderNote className="mt-5">
              Placeholder — key management activates with an Enterprise subscription.
            </PlaceholderNote>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
