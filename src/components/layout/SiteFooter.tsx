import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Opportunity search", href: "/search" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },
      { label: "Product suite", href: "/products" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Agencies", href: "/search" },
      { label: "States", href: "/search" },
      { label: "NAICS codes", href: "/search" },
      { label: "Set-aside types", href: "/search" },
      { label: "Industries", href: "/search" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Resource library", href: "/resources" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/contact" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "/trust" },
      { label: "Compliance", href: "/trust" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Status", href: "/trust" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Procurement intelligence for teams that pursue public-sector work. Search, understand,
            monitor and win government opportunities.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            GovScout is an independent platform and is not affiliated with any government agency.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Data sourced from public procurement records.</p>
        </div>
      </div>
    </footer>
  );
}
