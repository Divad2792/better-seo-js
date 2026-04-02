---
title: "@better-seo/react"
description: Helmet props and useSEO for Vite/SPA-style React.
---

# `@better-seo/react`

**What it does:** Bridges **`SEO`** to **react-helmet-async** (`toHelmetProps`, **`BetterSEOHelmet`**, **`useSEO`**) with an **`SEOProvider`**.

**When to use:** Client-heavy React apps without App Router metadata.

## Example

```tsx
import { Helmet } from "react-helmet-async"
import { createSEO } from "@better-seo/core"
import { toHelmetProps } from "@better-seo/react"

const seo = createSEO(
  { title: "Dashboard", description: "…" },
  { defaultTitle: "App", baseUrl: "https://example.com", titleTemplate: "%s | App" },
)

export function Page() {
  return (
    <>
      <Helmet {...toHelmetProps(seo)} />
      <h1>Dashboard</h1>
    </>
  )
}
```

Prefer **`SEOProvider`** + **`useSEO`** or **`BetterSEOHelmet`** when you want lifecycle helpers — see [React + Helmet (Wave 5)](../recipes/react-wave5.md) and **`prepareReactSeo`** / **`helmetFromInput`** in [`packages/react`](../../packages/react/README.md).

## Output

- Document title and meta tags updated from **`SEO`** shape.

## Notes

- For Next.js App Router, prefer **`@better-seo/next`** — this package targets SPA patterns.
- Package README: [`packages/react/README.md`](../../packages/react/README.md).
