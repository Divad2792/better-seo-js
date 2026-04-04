---
title: Better SEO vs React Helmet
description: Comparing better-seo.js with react-helmet and react-helmet-async for React SPA SEO — unified model, JSON-LD, and framework adapter pattern.
---

# Better SEO vs React Helmet

**react-helmet** and **react-helmet-async** are the go-to solutions for managing `<head>` in React SPAs. Here's how better-seo.js compares — and why you might want both.

## At a Glance

| Dimension           | react-helmet / react-helmet-async | @better-seo + @better-seo/react            |
| ------------------- | --------------------------------- | ------------------------------------------ |
| **Model**           | Props on `<Helmet>` component     | Unified `SEO` document → Helmet props      |
| **JSON-LD**         | Manual `<script>` tags            | `serializeJSONLD` + helpers                |
| **Fallbacks**       | None — you fill every field       | Title templates, OG → Twitter bridging     |
| **Merge strategy**  | Last-mounted wins (opaque)        | Explicit `mergeSEO` with rules             |
| **Validation**      | None                              | `validateSEO` with dev warnings            |
| **OG generation**   | External                          | `@better-seo/assets` + CLI                 |
| **Cross-framework** | React only                        | Core + adapters (Next, Remix, Astro, Nuxt) |
| **Zero-dep core**   | N/A                               | `@better-seo/core` — 0 runtime deps        |

## The Fundamental Difference

**React Helmet** is a **tag injection** tool. You pass it JSX, it renders to `<head>`. There's no model, no merge strategy, no validation.

**better-seo.js** is a **document model**. You describe SEO as a structured object, and the React adapter maps it to Helmet props:

```tsx
// react-helmet — manual, per-field
<Helmet>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content={twitterCard} />
  {/* Did you forget something? */}
</Helmet>

// better-seo.js — unified model
import { createSEO, webPage } from "@better-seo/core"
import { toHelmetProps } from "@better-seo/react"

const seo = createSEO({
  title: "Dashboard",
  description: "Your analytics dashboard",
  openGraph: { images: [{ url: "/og-dashboard.png" }] },
  schema: [webPage({ name: "Dashboard" })],
}, config)

<Helmet {...toHelmetProps(seo)} />
```

## What You Get from the Adapter

### 1. Automatic Field Bridging

| Input                     | Output                                                               |
| ------------------------- | -------------------------------------------------------------------- |
| `meta.title`              | `<title>`, `og:title`, `twitter:title`                               |
| `meta.description`        | `<meta name="description">`, `og:description`, `twitter:description` |
| `openGraph.images[0].url` | `og:image`, `twitter:image`                                          |
| `meta.canonical`          | `<link rel="canonical">`, `og:url`                                   |

### 2. JSON-LD Safety

```tsx
// react-helmet — risk of breaking the page
;<Helmet>
  <script type="application/ld+json">{`
    { "@context": "https://schema.org", "@type": "WebPage", name: "${userContent}" }
  `}</script>
  {/* What if userContent contains </script>? */}
</Helmet>

// better-seo.js — hardened serialization
import { serializeJSONLD, webPage } from "@better-seo/core"

;<Helmet>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: serializeJSONLD(webPage({ name: userContent })) }}
  />
</Helmet>
```

### 3. Layout + Page Composition

```tsx
// Without better-seo: you manage the merge manually
// With better-seo:
const layoutSEO = createSEO({ title: "My App" }, config)
const pageSEO = mergeSEO(layoutSEO, { title: "Dashboard" }, config)

// Helmet gets the fully-resolved document
<Helmet {...toHelmetProps(pageSEO)} />
```

## When to Use React Helmet Alone

- Your app has **< 10 pages**
- No structured data / JSON-LD needed
- You're comfortable managing `<title>` templates manually
- No cross-framework requirements

## When to Layer @better-seo/react

- You have **many pages** needing consistent SEO
- You want **JSON-LD** for rich results
- You might **migrate to Next.js** or add SSR later
- You want **validation** in dev (`validateSEO`)
- You want **OG image + icon pipelines** from the same ecosystem

## Using Both Together

`@better-seo/react` **uses** `react-helmet-async` under the hood. You can:

1. Use `toHelmetProps(seo)` with your existing `<Helmet>` setup
2. Use `BetterSEOHelmet` component for a drop-in replacement
3. Gradually migrate page by page from manual `<Helmet>` to `seo()` model

```tsx
import { BetterSEOHelmet } from "@better-seo/react"
import { SEOProvider } from "@better-seo/react"

// Wrap your app once
<SEOProvider config={seoConfig}>
  <App />
</SEOProvider>

// On any page
<BetterSEOHelmet seo={seo} />

// Or use the hook
const { seo, config } = useSEO()
```

## Summary

**React Helmet** is the mechanism for injecting tags into React's `<head>`. **better-seo.js** is the document model, merge strategy, validation, and cross-framework consistency layer that **feeds** Helmet with correct, complete, and safe data.

They work **together** — not in competition.
