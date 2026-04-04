---
title: next-seo vs better-seo.js — Complete Comparison
description: Detailed comparison of next-seo vs better-seo.js: model, JSON-LD, App Router support, OG generation, rules, plugins, and migration path.
---

# next-seo vs better-seo.js

**better-seo.js** isn't just another SEO helper — it's a **unified SEO document model** with framework adapters, JSON-LD as a first-class primitive, and a zero-dependency core. Here's how it compares to **next-seo**, the most popular Next.js SEO library.

## At a Glance

| Dimension              | next-seo                               | @better-seo                                                        |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| **Core model**         | Component + props per page             | Single `SEO` document, merge strategy                              |
| **Runtime deps**       | React + own deps                       | **0 runtime deps** (`@better-seo/core`)                            |
| **Bundle size**        | ~15KB+                                 | **~5KB gzip** (core)                                               |
| **JSON-LD**            | Manual `<script>` or helper components | `serializeJSONLD` — single, hardened path                          |
| **Next.js App Router** | Patterns vary, no official adapter     | `@better-seo/next` — `seo()`, `prepareNextSeo`, `NextJsonLd`       |
| **OG images**          | External tooling or manual             | `@better-seo/assets` + CLI `og` command                            |
| **Favicons / icons**   | Manual or `next-pwa`                   | CLI `icons` + manifest generation                                  |
| **Route rules**        | None built in                          | Glob-based `SEORule` engine                                        |
| **Plugins**            | None                                   | `beforeMerge`, `afterMerge`, `onRenderTags`, `extendChannels`      |
| **Multi-framework**    | Next.js only                           | Next.js, React, Remix, Astro, Nuxt (adapter pattern)               |
| **CLI**                | None                                   | `init`, `og`, `icons`, `doctor`, `scan`, `fix`, `crawl`, `migrate` |
| **Edge-safe**          | Depends on React                       | Core is Edge/Worker/Browser safe                                   |
| **Type safety**        | Good                                   | Strict — no `any` on public exports                                |

## Detailed Comparison

### 1. Data Model

**next-seo:** You pass props to a `<NextSeo />` component on each page. Layout-level defaults come from `_app.tsx`. There's no formal merge strategy — it's component composition.

```tsx
// next-seo
<NextSeo title="About" description="About us" canonical="https://..." />
```

**better-seo.js:** A single `SEO` object flows through `createSEO` → `mergeSEO` → adapter. Layout + page composition is explicit and deterministic.

```tsx
// better-seo.js
export const metadata = seo({ title: "About", description: "About us", canonical: "/" })
```

### 2. JSON-LD / Structured Data

**next-seo:** Provides `JsonLd` component, but you construct the raw object yourself. No serialization safety guarantees — risk of `</script>` injection or U+2028 breaking HTML.

**better-seo.js:** Schema.org helpers (`webPage`, `article`, `organization`, `product`, `person`, `breadcrumbList`, `faqPage`) + `customSchema` escape hatch. All JSON-LD goes through `serializeJSONLD` — hardened against HTML injection.

```tsx
// better-seo.js
import { webPage, organization } from "@better-seo/core"

seo({
  schema: [
    webPage({ name: "About", url: "https://example.com/about" }),
    organization({ name: "Acme", url: "https://example.com" }),
  ],
})
```

### 3. Next.js App Router Support

**next-seo:** Built for Pages Router (`<NextSeo />` component in `_app`). App Router support requires manual mapping to `metadata` export — no official adapter.

**better-seo.js:** First-class App Router support via `@better-seo/next`:

- `seo()` — voilà shorthand for `metadata` export
- `prepareNextSeo()` — full config + JSON-LD
- `withSEO()` — layered metadata with `mergeSEO`
- `NextJsonLd` — safe JSON-LD component for App Router

### 4. OG Image Generation

**next-seo:** You generate OG images yourself (Satori, Puppeteer, external service). No built-in pipeline.

**better-seo.js:** `@better-seo/assets` + CLI:

```bash
npx @better-seo/cli og "Hello World" --site-name "My Site" -o ./public/og.png
```

Programmatic API with Satori + Resvg, light/dark themes, custom templates.

### 5. Icons & Web Manifest

**next-seo:** Manual favicon setup, often via `next-pwa` or separate tooling.

**better-seo.js:** CLI `icons` command generates favicon set + `manifest.json`:

```bash
npx @better-seo/cli icons --input ./logo.png --out ./public
```

### 6. Route Rules

**next-seo:** No built-in route-based SEO rules.

**better-seo.js:** Glob-based rule engine:

```ts
seo({
  rules: [
    { match: "/blog/*", schema: [article({ ... })] },
    { match: "/app/*", meta: { robots: "noindex,nofollow" } },
    { match: "/docs/**", openGraph: { type: "article" } },
  ],
})
```

### 7. Extensibility (Plugins)

**next-seo:** No plugin system.

**better-seo.js:** Sync plugin hooks:
| Hook | When | Use Case |
|------|------|----------|
| `beforeMerge` | Rules + layout + page merged | Strip tracking params, normalize URLs |
| `afterMerge` | Final `SEO` before adapter | Enforce tenant `@id`, locale fallbacks |
| `onRenderTags` | Vanilla render path | Extra `<link>`, `dns-prefetch`, `preconnect` |
| `extendChannels` | Future meta namespaces | New preview surfaces without breaking types |

### 8. CLI Tooling

**next-seo:** No CLI.

**better-seo.js:** Full CLI with TUI:
| Command | Purpose |
|---------|---------|
| `init` | Wizard setup for framework |
| `og` | Generate OG images |
| `icons` | Generate favicon set + manifest |
| `doctor` | Validate config + adapter registration |
| `scan` | Detect SEO issues in codebase |
| `fix` | Auto-fix detected issues |
| `analyze` | Run `validateSEO` with exit codes |
| `snapshot` | Capture SEO state for diffing |
| `preview` | Static HTML preview of head tags |
| `crawl robots` | Generate robots.txt |
| `crawl sitemap` | Generate sitemap.xml |
| `migrate` | next-seo → better-seo migration hints |

## Migration from next-seo

**better-seo.js** provides `fromNextSeo()` to map common `next-seo` props:

```ts
import { fromNextSeo, createSEO } from "@better-seo/core"

const nextSeoProps = {
  title: "About",
  description: "About us",
  canonical: "https://example.com/about",
  openGraph: { title: "About", images: [{ url: "/og.png" }] },
}

const seo = createSEO(fromNextSeo(nextSeoProps), { baseUrl: "https://example.com" })
```

CLI migration hints:

```bash
npx better-seo migrate from-next-seo
```

## When to Stick with next-seo

- You're on **Pages Router only** with no plans to migrate to App Router
- Your SEO needs are **simple static titles + descriptions**
- You don't care about **JSON-LD / structured data**
- You already have a **working OG image pipeline**

## When to Switch to better-seo.js

- You use or plan to use **Next.js App Router**
- You need **JSON-LD / structured data** (Article, Product, FAQ, etc.)
- You want **consistent OG images** without manual setup
- You need **route-based rules** (e.g., `noindex` on staging, different OG types per route)
- You're building a **multi-tenant or i18n** app
- You want a **single source of truth** instead of 5 parallel config spots
- You care about **bundle size** (0-dep core vs heavier alternative)

## Summary

| If you need…             | next-seo     | better-seo.js                      |
| ------------------------ | ------------ | ---------------------------------- |
| Basic meta tags          | ✅           | ✅                                 |
| App Router `metadata`    | ⚠️ Manual    | ✅ Built-in                        |
| JSON-LD / Schema.org     | ⚠️ Manual    | ✅ Helpers + serialization         |
| OG image generation      | ❌ External  | ✅ Built-in                        |
| Icon / manifest pipeline | ❌ External  | ✅ Built-in                        |
| Route-based rules        | ❌           | ✅                                 |
| Plugins / extensibility  | ❌           | ✅                                 |
| Zero-dep core            | ❌           | ✅                                 |
| Multi-framework adapters | ❌ Next only | ✅ Next, React, Remix, Astro, Nuxt |
| CLI tooling              | ❌           | ✅ Full suite                      |

**better-seo.js** is **next-seo, but actually complete.**
