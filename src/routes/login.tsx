import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, authField } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to Nexudel" },
      {
        name: "description",
        content: "Sign in to your Nexudel account to access saved searches, alerts and bookmarks.",
      },
      { property: "og:title", content: "Log in to Nexudel" },
      { property: "og:description", content: "Access your procurement intelligence workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your procurement intelligence workspace."
      footer={
        <>
          New to Nexudel?{" "}
          <Link to="/signup" className="font-medium text-accent hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="email">Work email</Label>
          <input id="email" type="email" required autoComplete="email" className={authField} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={authField}
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
