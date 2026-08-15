import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/format";
import { getPost, relatedPosts } from "@/modules/blog/data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post, related: relatedPosts(post) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Article unavailable | Nexudel" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} | Nexudel Blog` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${siteConfig.domain}/blog/${post.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: post.author.name },
            publisher: { "@type": "Organization", name: siteConfig.name },
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();

  return (
    <div className="container-page py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/blog" className="hover:text-foreground">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{post.category}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <Badge variant="secondary">{post.category}</Badge>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{post.author.role}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
            <Button variant="ghost" size="sm" className="ml-auto">
              <Share2 aria-hidden="true" /> Share
            </Button>
          </div>

          <Separator className="my-8" />

          <div className="max-w-[68ch]">
            {post.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mt-10 text-xl font-semibold first:mt-0">{section.heading}</h2>
                {section.body.map((p) => (
                  <p key={p.slice(0, 32)} className="mt-4 leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Get new guides by email</h2>
            <form
              className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="post-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="post-newsletter"
                type="email"
                required
                placeholder="you@company.com"
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              />
              <Button variant="accent" type="submit">
                Subscribe
              </Button>
            </form>
          </section>

          <section
            aria-label="Comments"
            className="mt-8 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground"
          >
            Comments placeholder — discussion will be enabled here.
          </section>
        </article>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <nav
              aria-label="Table of contents"
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider">Table of contents</p>
              <ul className="mt-3 space-y-2 text-sm">
                {post.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider">Related articles</p>
              <ul className="mt-3 space-y-4">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: r.slug }}
                      className="text-sm font-medium leading-snug hover:text-accent"
                    >
                      {r.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{r.category}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
