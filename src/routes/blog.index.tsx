import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { blogCategories, blogPosts } from "@/modules/blog/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Government Contracting Blog — Guides and Analysis | Nexudel" },
      {
        name: "description",
        content:
          "Practical guidance on federal contracting, SAM.gov, proposal writing, compliance and procurement strategy from the Nexudel research team.",
      },
      { property: "og:title", content: "Nexudel Blog" },
      {
        property: "og:description",
        content: "Guides and analysis for government contracting teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [active, setActive] = useState<string>("All");
  const posts = active === "All" ? blogPosts : blogPosts.filter((p) => p.category === active);

  return (
    <div className="container-page py-16">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="Blog"
        title="Guides and analysis for public sector bidders"
        description="Written by the Nexudel research team. No fluff, no invented statistics."
      />

      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {["All", ...blogCategories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            aria-pressed={active === cat}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              active === cat
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <Badge variant="secondary" className="w-fit">
              {post.category}
            </Badge>
            <h2 className="mt-4 text-lg font-semibold leading-snug">
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="transition-colors hover:text-accent"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.description}
            </p>
            <p className="mt-5 text-xs text-muted-foreground">
              {formatDate(post.publishedAt)} · {post.readingMinutes} min read
            </p>
          </article>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No articles published in this category yet.
        </p>
      ) : null}

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-subtle">
        <h2 className="text-xl font-semibold">Get new guides by email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          One email per week. Unsubscribe at any time.
        </p>
        <form
          className="mt-5 flex max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="accent">
            Subscribe
          </Button>
        </form>
      </section>
    </div>
  );
}
