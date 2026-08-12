import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AuthShell, authField } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your free NexusDel account" },
      {
        name: "description",
        content:
          "Start free: search every federal, state and local contracting opportunity with AI summaries and saved searches.",
      },
      { property: "og:title", content: "Start free on NexusDel" },
      {
        property: "og:description",
        content: "Government contracting intelligence, free to start.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <AuthShell
      title="Start free"
      subtitle="No credit card required. Upgrade when alerts and AI analysis become part of your workflow."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="name">Full name</Label>
          <input id="name" required autoComplete="name" className={authField} />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <input id="email" type="email" required autoComplete="email" className={authField} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className={authField}
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Create account
        </Button>
      </form>
      <ul className="mt-6 space-y-2 border-t border-border pt-5">
        {["Unlimited opportunity search", "3 saved searches", "Weekly digest email"].map((f) => (
          <li key={f} className="flex gap-2 text-sm text-muted-foreground">
            <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
