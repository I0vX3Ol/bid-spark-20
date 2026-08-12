import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="hero-glow">
      <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/legal/terms" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/legal/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export const authField =
  "mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent";
