import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, authField } from "@/components/auth/AuthShell";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your GovScout password" },
      { name: "description", content: "Request a password reset link for your GovScout account." },
      { property: "og:title", content: "Reset your password" },
      { property: "og:description", content: "Request a GovScout password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new password."
      footer={
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await resetPassword(email);
          setSent(true);
        }}
      >
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
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Send reset link
        </Button>
        <p aria-live="polite" className="text-sm text-success">
          {sent ? "If that email is registered, a reset link is on its way." : ""}
        </p>
      </form>
    </AuthShell>
  );
}
