---
title: "@better-seo/crawl"
description: Robots.txt, sitemap urlset, sitemap index, RSS, Atom, and llms.txt builders — UTF-8 strings for routes or static files.
---

# `@better-seo/crawl`

**What it does:** Builds **crawl and syndication** artifacts as plain strings: **`robots.txt`**, **`urlset`** sitemaps, **sitemap index**, **RSS 2.0**, **Atom 1.0**, **llms.txt**, plus **`defaultSitemapUrlFromSEO`** to derive a default sitemap URL from a resolved **`SEO`** document.

**When to use:** Next.js **Route Handlers**, build scripts, or any server that should emit the same URLs you use in **`meta.canonical`** and **`SEOConfig.baseUrl`**.

## Crawl / index

| Export                         | Role                                                                      |
| ------------------------------ | ------------------------------------------------------------------------- |
| **`renderRobotsTxt`**          | `User-agent`, `Allow` / `Disallow`, optional `Host`, `Sitemap:` lines     |
| **`renderSitemapXml`**         | Single **urlset** (`<loc>`, optional `lastmod`, `changefreq`, `priority`) |
| **`renderSitemapIndexXml`**    | **Sitemap index** listing child sitemap `<loc>` URLs                      |
| **`defaultSitemapUrlFromSEO`** | `${origin}/sitemap.xml` from absolute canonical or `baseUrl`              |

## Syndication & discovery

| Export               | Role                                             |
| -------------------- | ------------------------------------------------ |
| **`renderRssXml`**   | RSS 2.0 channel + items                          |
| **`renderAtomFeed`** | Atom 1.0 feed + entries                          |
| **`renderLlmsTxt`**  | Plain-text **llms.txt** (title, summary, blocks) |

Types **`RssChannelOptions`**, **`RssItem`**, **`AtomFeedOptions`**, **`AtomEntry`**, **`LlmsBlock`** describe the inputs (see package source).

## Example

```ts
import type { SEO } from "@better-seo/core"
import {
  defaultSitemapUrlFromSEO,
  renderRobotsTxt,
  renderSitemapXml,
} from "@better-seo/crawl"

const seo: SEO = /* … */

const robots = renderRobotsTxt({
  sitemap: defaultSitemapUrlFromSEO(seo, "https://example.com") ?? "https://example.com/sitemap.xml",
})

const sitemap = renderSitemapXml([
  { loc: "https://example.com/", changefreq: "daily", priority: 1 },
])
```

CLI wrappers: **`better-seo crawl rss`**, **`atom`**, **`llms`**, **`sitemap-index`** (and robots / sitemap flows) — [CLI commands](../commands.md).

## Output

- **UTF-8** text suitable for `Response` bodies, `fs.writeFile`, or `public/` in static export.

## Notes

- **Hreflang**-rich sitemap entries and deeper **Next** integration patterns are still evolving; see [Robots + sitemap (Next)](../recipes/sitemap-robots-next.md) and repo **`internal-docs/Roadmap.md`**.
- Package: [`packages/better-seo-crawl/`](../../packages/better-seo-crawl/) · npm **`@better-seo/crawl`**.
