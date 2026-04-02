---
title: "@better-seo/next"
description: seo, prepareNextSeo, withSEO, toNextMetadata, route helpers, NextJsonLd.
---

# `@better-seo/next`

**What it does:** Maps **`SEO` → Next.js App Router `Metadata`** and exposes voilà helpers: **`seo`**, **`prepareNextSeo`**, **`prepareNextSeoForRoute`**, **`withSEO`**, **`seoRoute`**, **`seoLayout`**, **`seoPage`**, plus **`mergeNextMetadataSource`** when you merge Better SEO output with existing Next **`Metadata`**. Subpath **`@better-seo/next/json-ld`** exports **`NextJsonLd`**.

**When to use:** All App Router **`metadata`** / **`generateMetadata`** flows.

## Example

```ts
import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Home" })
```

JSON-LD + metadata from one call:

```tsx
import { NextJsonLd } from "@better-seo/next/json-ld"
import { prepareNextSeo } from "@better-seo/next"
import { webPage } from "@better-seo/core"

const site = process.env.NEXT_PUBLIC_SITE_URL!
const { metadata, seo: doc } = prepareNextSeo(
  { title: "Docs", canonical: "/", schema: [webPage({ name: "Docs", url: site })] },
  { baseUrl: site },
)
export { metadata }
// <NextJsonLd seo={doc} />
```

## Output

- **`Metadata`** for exports; **`SEO`** for **`NextJsonLd`** parity.

## Notes

- Route rules (N9): [**`seoRoute`** / **`prepareNextSeoForRoute`**](../recipes/n9-rules-route-next.md).
- Package README: [`packages/next/README.md`](../../packages/next/README.md).
