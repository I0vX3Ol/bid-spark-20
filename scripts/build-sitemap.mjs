#!/usr/bin/env node
/**
 * Generates public/sitemap.xml.
 *
 * It used to be maintained by hand, which is exactly why the four blog posts
 * were missing from it: /blog was listed, but none of the articles underneath
 * it were, so the only genuinely rankable long-form content on the site was
 * never submitted. Static pages are still listed explicitly here because their
 * priorities are a judgement call, but anything that grows — blog posts today,
 * more collections later — is derived, so adding content cannot silently fail
 * to reach the sitemap again.
 *
 * Runs before `vite build` so the result is copied into the deployed output.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOMAIN = "https://govscout.nexudel.com";

/** Hand-tuned because priority and changefreq are editorial decisions. */
const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/search", changefreq: "daily", priority: "0.9" },
  { path: "/resources", changefreq: "monthly", priority: "0.6" },
  { path: "/docs", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "yearly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
  { path: "/trust", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/privacy", changefreq: "yearly", priority: "0.3" },
];

// Read the slugs straight out of the module rather than importing it — this is
// a plain .mjs script and the data is TypeScript. The assertion below is what
// makes that safe: if the shape of data.ts ever changes, the build stops
// instead of quietly shipping a sitemap with no articles in it.
const blogSource = readFileSync(join(root, "src/modules/blog/data.ts"), "utf8");
const posts = [...blogSource.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((m) => m[1]);

if (posts.length === 0) {
  throw new Error(
    "build-sitemap: found no blog slugs in src/modules/blog/data.ts. " +
      "The file shape probably changed — fix the pattern above rather than shipping without them.",
  );
}

const urls = [
  ...staticRoutes,
  ...posts.map((slug) => ({
    path: `/blog/${slug}`,
    changefreq: "monthly",
    priority: "0.7",
  })),
];

const body = urls
  .map(
    ({ path, changefreq, priority }) =>
      `  <url><loc>${DOMAIN}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
  )
  .join("\n");

writeFileSync(
  join(root, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);

console.log(`✓ Wrote public/sitemap.xml — ${urls.length} URLs (${posts.length} blog posts)`);
