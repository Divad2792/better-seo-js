# Next.js App Router: `robots.ts` and `sitemap.ts` with `@better-seo/crawl`

Align **robots** and **sitemap** URLs with the same **`baseUrl`** you pass into `prepareNextSeo` / `createSEO` so crawl hints do not drift from canonical metadata.

## Install

```bash
npm install @better-seo/crawl
```

## Shared site URL

Use one env-backed origin (example: `NEXT_PUBLIC_SITE_URL` or `SITE_URL`):

```ts
// lib/site.ts
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
)
```

## `app/robots.ts` (Next `MetadataRoute`)

Keep **`sitemap`** on the same origin as **`siteUrl`**:

```ts
import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
```

For the **exact** UTF-8 body from **`renderRobotsTxt`** (custom rules, multiple `Sitemap:` lines, optional `Host:`), use a **Route Handler** (`Response` with `Content-Type: text/plain`) or write **`public/robots.txt`** in CI via **`npx @better-seo/cli crawl robots`**.

## `app/sitemap.ts`

Build the same URL list your app serves (or export it from a shared module). Feed **`renderSitemapXml`** or map entries to Next’s format:

```ts
import type { MetadataRoute } from "next"
import { renderSitemapXml } from "@better-seo/crawl"
import { siteUrl } from "@/lib/site"

const paths = ["/", "/about"]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = paths.map((path) => ({ loc: `${siteUrl}${path}` }))
  // Optional: const xml = renderSitemapXml(entries); use a route handler if you need raw XML
  return entries.map((e) => ({ url: e.loc }))
}
```

## CLI (build / CI)

```bash
npx @better-seo/cli crawl robots -o public/robots.txt --sitemap https://example.com/sitemap.xml
npx @better-seo/cli crawl sitemap -o public/sitemap.xml --loc https://example.com/ --loc https://example.com/about
```

See also: [`docs/commands.md`](../commands.md) (CLI **`crawl`**), and **`@better-seo/cli`** README for install and flags.
