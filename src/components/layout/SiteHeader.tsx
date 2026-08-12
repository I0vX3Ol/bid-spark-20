import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function HeaderSearch({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onDone?.();
        navigate({ to: "/search", search: { q: value } });
      }}
      className="relative w-full"
    >
      <label htmlFor="global-search" className="sr-only">
        Search opportunities
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        id="global-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search opportunities…"
        className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
      />
    </form>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              activeProps={{ className: "text-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-64 xl:block">
          <HeaderSearch />
        </div>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link to={siteConfig.primaryCta.href}>{siteConfig.primaryCta.label}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-2">
                <HeaderSearch onDone={() => setOpen(false)} />
              </div>
              <nav aria-label="Mobile" className="mt-6 grid gap-1">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 grid gap-2">
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="accent" onClick={() => setOpen(false)}>
                  <Link to={siteConfig.primaryCta.href}>{siteConfig.primaryCta.label}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
