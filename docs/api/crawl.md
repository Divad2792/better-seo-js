---
title: "@better-seo/crawl"
description: Robots.txt and sitemap XML builders aligned with your SEO model.
---

# `@better-seo/crawl`

**What it does:** Builds **robots.txt** and **sitemap.xml** strings from configuration, sharing **`baseUrl`** / URL discipline with **`@better-seo/core`** where applicable.

**When to use:** Static or dynamic routes for crawlers; pairing with Next route handlers.

## Example

Use CLI wrappers or import builders from the package — walkthrough:

- [Robots + sitemap (Next)](../recipes/sitemap-robots-next.md)

## Output

- UTF-8 text suitable for **`Response`** bodies or files under **`public/`**.

## Notes

- Deeper RSS/Atom / llms.txt: **Roadmap** Wave 12 — see **`internal-docs/PROGRESS.md`** for what shipped vs planned.
- Source: [`packages/better-seo-crawl/`](../../packages/better-seo-crawl/) (npm **`@better-seo/crawl`**).
