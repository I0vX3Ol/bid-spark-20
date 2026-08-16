import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessagesSquare, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitContactMessage } from "@/modules/opportunities/remote";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Sales and Support | GovScout" },
      {
        name: "description",
        content:
          "Talk to the GovScout team about Enterprise workspaces, API access, data coverage requests or account support.",
      },
      { property: "og:title", content: "Contact GovScout" },
      { property: "og:description", content: "Reach sales, support or the security team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const field =
  "mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent";

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h1 className="text-3xl font-semibold sm:text-4xl">Talk to our team</h1>
        <p className="mt-4 text-muted-foreground">
          Enterprise requirements, data coverage requests and account support all route to a human.
        </p>
        <ul className="mt-8 space-y-5">
          {[
            {
              icon: MessagesSquare,
              title: "Sales",
              body: "Enterprise workspaces, SSO and API access.",
            },
            { icon: Mail, title: "Support", body: "Billing, account and data questions." },
            {
              icon: ShieldCheck,
              title: "Security",
              body: "Vulnerability reports and compliance reviews.",
            },
          ].map((item) => (
            <li key={item.title} className="flex gap-3">
              <item.icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            setError("");
            void submitContactMessage({
              name: String(data.get("name") ?? ""),
              email: String(data.get("email") ?? ""),
              topic: String(data.get("company") ?? ""),
              message: String(data.get("message") ?? ""),
            })
              .then(() => {
                setSent(true);
                form.reset();
              })
              .catch(() => setError("Something went wrong. Please email us instead."));
          }}
          className="rounded-2xl border border-border bg-card p-7 shadow-subtle"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <input id="name" name="name" required className={field} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={field}
                autoComplete="email"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="company">Company</Label>
              <input id="company" name="company" className={field} autoComplete="organization" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="message">How can we help?</Label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>
          <Button type="submit" variant="accent" size="lg" className="mt-6">
            Send message
          </Button>
          <p aria-live="polite" className="mt-3 text-sm text-success">
            {sent ? "Thanks — we have your message and will be in touch." : ""}
          </p>
          <p aria-live="polite" className="mt-1 text-sm text-destructive">
            {error}
          </p>
        </form>
      </div>
    </div>
  );
}
