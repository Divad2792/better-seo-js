---
title: Framework Adapters
description: How better-seo.js adapter pattern works across Next.js, React, Remix, Astro, and Nuxt — one SEO document model, multiple framework outputs.
---

# Framework Adapters

**better-seo.js** uses an **adapter pattern**: the core SEO document model stays the same, and thin framework-specific adapters map it to each platform's native head/metadata API.

## The Adapter Contract

Every adapter implements:

```ts
interface SEOAdapter<TOutput> {
  id: string
  toFramework(seo: SEO): TOutput
}
```

The adapter receives a normalized **`SEO`** object and returns the framework's native metadata type. No framework logic lives in core.

## Adapter Matrix

| Priority | Framework              | Package             | Output                             | Status        |
| -------- | ---------------------- | ------------------- | ---------------------------------- | ------------- |
| **P0**   | Next.js (App Router)   | `@better-seo/next`  | `Metadata`                         | ✅ Shipped    |
| **P0**   | Next.js (Pages Router) | `@better-seo/next`  | `<NextSeo />` patterns             | ✅ Documented |
| **P1**   | React (SPA / Vite)     | `@better-seo/react` | Helmet props                       | ✅ Shipped    |
| **P1**   | Remix                  | `@better-seo/remix` | `meta` / `links` exports           | 🟨 Planned    |
| **P2**   | Astro                  | `@better-seo/astro` | Frontmatter + layout               | 🟨 Planned    |
| **P2**   | Nuxt                   | `@better-seo/nuxt`  | `useHead` bridge                   | 🟨 Planned    |
| —        | Vanilla / Custom       | `@better-seo/core`  | `renderTags()` → `TagDescriptor[]` | ✅ Shipped    |

## Using Adapters

### Explicit Registration (Recommended for Production)

```ts
import { registerAdapter, seoForFramework } from "@better-seo/core"
import { adapter as nextAdapter } from "@better-seo/next"

registerAdapter("next", nextAdapter)

const metadata = seoForFramework("next", { title: "Home" })
```

### Auto-Registration (Dev Convenience)

Importing an adapter package auto-registers it:

```ts
import "@better-seo/next" // self-registers as "next"
import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Home" })
```

### Vanilla / Non-Framework

```ts
import { createSEO, renderTags } from "@better-seo/core"

const seo = createSEO({ title: "Home" }, config)
const tags = renderTags(seo)
// → [{ kind: "meta", name: "title", content: "Home" }, ...]
```

## Framework-Specific Guides

| Framework              | Guide                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Next.js App Router** | [Get started](../getting-started/index.md) · [API: @better-seo/next](../api/next.md)  |
| **React SPA / Vite**   | [React recipe](../recipes/react-wave5.md) · [API: @better-seo/react](../api/react.md) |
| **Remix**              | [Future frameworks guide](./future-frameworks.md)                                     |
| **Astro**              | [Future frameworks guide](./future-frameworks.md)                                     |
| **Nuxt**               | [Future frameworks guide](./future-frameworks.md)                                     |

## Building a Custom Adapter

If your framework isn't covered yet, write an adapter:

```ts
import type { SEOAdapter, SEO, TagDescriptor } from "@better-seo/core"

const myAdapter: SEOAdapter<string> = {
  id: "my-framework",
  toFramework(seo: SEO): string {
    // Map SEO object to your framework's metadata format
    return generateHeadTags(seo)
  },
}

registerAdapter("my-framework", myAdapter)
```

### Adapter Responsibilities

1. **Map all fields** from `SEO` to framework output
2. **Handle fallbacks** — core has already applied defaults
3. **Don't re-serialize JSON-LD** — use `serializeJSONLD` from core
4. **Stay typed** — no `any` in adapter output type
5. **Test with golden fixtures** — snapshot `SEO` input → expected output

## When to Use Which Adapter

| Situation                     | Recommended Adapter                                      |
| ----------------------------- | -------------------------------------------------------- |
| Next.js 13+ App Router        | `@better-seo/next` (`seo()`, `prepareNextSeo`)           |
| Next.js Pages Router          | `@better-seo/next` (documented patterns)                 |
| React SPA (Vite, CRA)         | `@better-seo/react` (`BetterSEOHelmet`, `toHelmetProps`) |
| Server-side rendering (other) | Write custom adapter using `renderTags()`                |
| Static site generation        | `renderTags()` → manual injection                        |
| Multi-framework monorepo      | Core + multiple adapters, same `SEO` model               |

## Next

- [Next.js API reference](../api/next.md)
- [React adapter API reference](../api/react.md)
- [Building a custom adapter](./future-frameworks.md)
