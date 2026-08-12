import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { products } from "@/config/site";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Public Sector Intelligence Suite | NexusDel" },
      {
        name: "description",
        content:
          "Contracts Intelligence is live today. Grants, permits, inspections and public records intelligence share the same platform, account and design system.",
      },
      { property: "og:title", content: "NexusDel Product Suite" },
      {
        property: "og:description",
        content: "One platform for contracts, grants, permits and public record intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        as="h1"
        eyebrow="Product suite"
        title="One platform for public sector intelligence"
        description="Contracts Intelligence is available today. Additional surfaces reuse the same authentication, billing, alerting and analytics layer."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.key}
            className="rounded-2xl border border-border bg-card p-6 shadow-subtle transition-shadow hover:shadow-card"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <Badge variant={product.status === "live" ? "default" : "secondary"}>
                {product.status === "live" ? "Available" : "On the roadmap"}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{product.tagline}</p>
            {product.status === "live" ? (
              <Button asChild variant="link" className="mt-4 px-0">
                <Link to="/search">
                  Explore opportunities <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
