import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Check } from "lucide-react";
import { AuthShell, authField } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your free GovScout account" },
      {
        name: "description",
        content:
          "Start free: search every federal, state and local contracting opportunity with AI summaries and saved searches.",
      },
      { property: "og:title", content: "Start free on GovScout" },
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
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signUp({ email, password, fullName });
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate({ to: "/dashboard" });
  }

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
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <div>
          <Label htmlFor="name">Full name</Label>
          <input
            id="name"
            required
            autoComplete="name"
            className={authField}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className={authField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={authField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
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
