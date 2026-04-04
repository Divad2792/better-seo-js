---
title: Better SEO vs Next.js Metadata API
description: How better-seo.js complements and extends Next.js Metadata API with unified model, JSON-LD, rules, plugins, and cross-framework support.
---

# Better SEO vs Next.js Metadata API

Next.js has a built-in **Metadata API** (`generateMetadata`, `metadata` export). So why use **better-seo.js**?

## The Short Answer

Next.js Metadata is a **rendering layer** — it maps config to `<head>` tags. **better-seo.js** is a **document model + pipeline** — it normalizes, merges, validates, serializes, and maps to multiple frameworks (including Next.js Metadata).

They're **complementary**, not competing. better-seo.js **uses** Next.js Metadata as its output target.

## What Next.js Metadata API Does Well

| Feature                                  | Status                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| Basic meta tags (`title`, `description`) | ✅ Built-in                                               |
| Open Graph (`openGraph` object)          | ✅ Built-in                                               |
| Twitter cards (`twitter` object)         | ✅ Built-in                                               |
| Alternate languages (`alternates`)       | ✅ Built-in                                               |
| Icons / manifest                         | ✅ Built-in                                               |
| Robots                                   | ✅ Built-in                                               |
| JSON-LD                                  | ⚠️ Via `other: { 'application/ld+json': [...] }` — manual |
| Fallback / merge logic                   | ❌ You write it                                           |
| Route-based rules                        | ❌ You write it                                           |
| Validation / dev warnings                | ❌ None                                                   |
| OG image generation                      | ❌ External                                               |
| Cross-framework consistency              | ❌ Next.js only                                           |

## What Better SEO Adds

### 1. Unified Document Model

Next.js Metadata requires you to juggle `metadata`, `generateMetadata`, and `other` for JSON-LD. better-seo.js gives you **one object**:

```ts
// Next.js Metadata API — scattered
export const metadata: Metadata = {
  title: "About",
  description: "About us",
  openGraph: { title: "About", images: [{ url: "/og.png" }] },
  twitter: { card: "summary_large_image" },
  other: { "application/ld+json": JSON.stringify({ ... }) }, // manual
}

// better-seo.js — unified
export const metadata = seo({
  title: "About",
  description: "About us",
  openGraph: { images: [{ url: "/og.png" }] },
  schema: [webPage({ name: "About", url: "https://example.com/about" })],
})
```

### 2. Deterministic Merge Strategy

When you have a root layout SEO and page-level overrides, Next.js Metadata **merges** — but the rules are opaque. better-seo.js makes it explicit:

```ts
// layout.tsx
const layoutSEO = createSEO({ title: "Site" }, config)

// page.tsx
const pageSEO = mergeSEO(layoutSEO, { title: "About" }, config)
// Final title: "About" (child wins for scalars)
```

### 3. JSON-LD as a First-Class Citizen

Next.js Metadata requires you to stringify JSON-LD into `other`. better-seo.js provides:

- **Schema.org helpers**: `webPage`, `article`, `product`, `organization`, `person`, `breadcrumbList`, `faqPage`
- **`customSchema`** escape hatch for any schema.org type
- **`serializeJSONLD`** — hardened HTML-safe serialization (prevents `</script>` injection, U+2028 breaks)
- **`NextJsonLd`** component for App Router

```tsx
import { NextJsonLd } from "@better-seo/next/json-ld"
import { article, organization } from "@better-seo/core"

export default function BlogPost({ post }) {
  const seo = createSEO(
    {
      title: post.title,
      schema: [
        article({ headline: post.title, datePublished: post.date, url: post.url }),
        organization({ name: "My Blog", url: siteUrl }),
      ],
    },
    config,
  )

  return (
    <article>
      <NextJsonLd seo={seo} />
      <h1>{post.title}</h1>
      {/* ... */}
    </article>
  )
}
```

### 4. Route Rules & Plugins

```ts
// Rules: apply SEO config based on route patterns
seo({
  rules: [
    { match: "/blog/*", schema: [article({ ... })] },
    { match: "/app/*", meta: { robots: "noindex,nofollow" } },
  ],
})

// Plugins: extend the pipeline
defineSEOPlugin({
  id: "canonical-normalizer",
  afterMerge: ({ seo }) => {
    seo.meta.canonical = normalizeUrl(seo.meta.canonical)
    return seo
  },
})
```

### 5. Cross-Framework Consistency

If you ever migrate from Next.js to Remix, Astro, or need a React SPA fallback — your SEO logic stays the same:

```
@better-seo/core (model + merge + serialize)
  → @better-seo/next → Next.js Metadata
  → @better-seo/react → React Helmet props
  → @better-seo/remix → Remix meta/links exports
  → @better-seo/astro → Astro frontmatter
  → vanilla → renderTags() → TagDescriptor[]
```

### 6. Dev Validation

```ts
// Dev-only warnings (stripped in production)
validateSEO(seo, { requireDescription: true, titleMaxLength: 60 })
// → [{ code: "TITLE_TOO_LONG", field: "meta.title", severity: "warning" }]
```

### 7. CLI Tooling

| Command                             | What it replaces                     |
| ----------------------------------- | ------------------------------------ |
| `better-seo og "Title"`             | Manual Satori/Puppeteer scripts      |
| `better-seo icons --input logo.png` | RealFaviconGenerator, manual uploads |
| `better-seo doctor`                 | Checking if adapter registered       |
| `better-seo scan`                   | Manual audit of pages missing SEO    |
| `better-seo crawl robots`           | robots.txt generator                 |
| `better-seo crawl sitemap`          | sitemap.xml generator                |

## When to Use Next.js Metadata Alone

- Simple site with **few pages**
- No JSON-LD / structured data needs
- No plans to support other frameworks
- Comfortable writing merge logic yourself

## When to Layer better-seo.js on Top

- You want **`seo({ title })`** to just work
- You need **JSON-LD** for rich results (Article, Product, FAQ)
- You have **layout + page** composition and want deterministic merge
- You want **OG images + icons** without external tooling
- You might need **other frameworks** later
- You want **CLI automation** for your team

## The Bottom Line

**Next.js Metadata API** is the output target. **better-seo.js** is the document model, pipeline, and tooling that sits **on top** of it — the same way Prisma sits on top of SQL, or tRPC sits on top of HTTP.

You don't choose between them. You use better-seo.js **to get** correct Next.js Metadata.
