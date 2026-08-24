/**
 * Shared page metadata.
 *
 * Every marketing route shipped a title and a description but no canonical, no
 * `og:url` and no `og:image`. Google therefore saw no declared canonical on any
 * page — leaving it to guess between the apex domain, the Workers preview
 * hostname and any query-string variant — and every link shared into Slack,
 * LinkedIn or iMessage rendered as a bare text stub.
 *
 * Building all three from one place means a route added later cannot quietly
 * forget them. Pass the path; the absolute URL is derived from it.
 */
import { siteConfig } from "@/config/site";

/** The card in public/og-default.png. Absolute — relative OG URLs are ignored. */
const OG_IMAGE = `${siteConfig.domain}/og-default.png`;

export type SeoOptions = {
  /** Absolute path with a leading slash, e.g. "/pricing". Use "/" for home. */
  path: string;
  /** The <title>. Include the brand suffix; this is what Google shows. */
  title: string;
  description: string;
  /** Social title, when the <title> is too long or too keyword-shaped to share. */
  ogTitle?: string;
  /** Social description, when the meta description reads as a search snippet. */
  ogDescription?: string;
  type?: "website" | "article";
};

/**
 * Returns the `meta` and `links` for a route's `head`. Spread extra entries in
 * after it when a page needs more:
 *
 *   head: () => {
 *     const base = seo({ ... });
 *     return { ...base, scripts: [...] };
 *   }
 */
export function seo({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  type = "website",
}: SeoOptions) {
  const url = `${siteConfig.domain}${path}`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: ogTitle ?? title },
      { property: "og:description", content: ogDescription ?? description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: siteConfig.name },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${siteConfig.name} — ${siteConfig.productSuiteName}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
