---
title: "@better-seo/core"
description: createSEO, mergeSEO, schema helpers, serializeJSONLD, validateSEO, renderTags.
---

# `@better-seo/core`

**What it does:** Pure, **zero runtime dependency** transforms: **`SEOInput` + `SEOConfig` → `SEO`**, plus merge, serialization, validation, and vanilla tag descriptors.

**When to use:** Every stack; adapters only map **`SEO`** out — they don’t redefine the model.

## Example

```ts
import { createSEO, mergeSEO, webPage, serializeJSONLD } from "@better-seo/core"

const parent = createSEO({ title: "App" }, { baseUrl: "https://x.com", titleTemplate: "%s | App" })
const child = mergeSEO(parent, { title: "Settings" })
const jsonLd = serializeJSONLD(webPage({ name: "Settings", url: "https://x.com/settings" }))
```

## Output

- **`child.meta.title`** follows template and overrides.
- **`jsonLd`** is safe to embed in a script tag.

## Reference surface (selected)

| Area                | Symbols                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model               | **`createSEO`**, **`mergeSEO`**, **`withSEO`**, types **`SEO`**, **`SEOInput`**, **`SEOConfig`**, **`SEORule`**, **`SEOPlugin`**                            |
| Schema              | **`webPage`**, **`article`**, **`product`**, **`organization`**, **`person`**, **`breadcrumbList`**, **`faqPage`**, **`techArticle`**, **`customSchema`**   |
| JSON-LD / tags      | **`serializeJSONLD`**, **`renderTags`**                                                                                                                     |
| Validation          | **`validateSEO`** (+ **`ValidationIssue`**, **`ValidationIssueCode`**)                                                                                      |
| Rules               | **`applyRules`**, **`applyRulesToSEO`**, **`createSEOForRoute`**                                                                                            |
| Context / globals   | **`createSEOContext`**, **`initSEO`**, **`getGlobalSEOConfig`** (prefer context on SSR / multi-tenant)                                                      |
| Adapters registry   | **`registerAdapter`**, **`getAdapter`**, **`listAdapterIds`**, **`detectFramework`** (detection is best-effort; prefer explicit adapter imports in prod)    |
| Plugins             | **`defineSEOPlugin`** (`beforeMerge`, `afterMerge`, `onRenderTags`)                                                                                         |
| Migration / content | **`fromNextSeo`**, **`fromContent`**, **`fromMdxString`** (content helpers are baseline; full MDX compile is roadmap — see **`internal-docs/PROGRESS.md`**) |
| Voilà (generic)     | **`seoForFramework`**, **`seoRoute`**, **`useSEO`** ( **`useSEO`** in SPA apps: use **`@better-seo/react`**)                                                |

## Notes

- **`@better-seo/core/node`** — optional inference (`readPackageJsonForSEO`, `inferSEOConfigFromEnvAndPackageJson`, …); **Node only**, not for Edge.
- Next.js **`metadata`**: import **`seo`** from **`@better-seo/next`**, not from core alone — the Next package registers the adapter.
- Package README: [`packages/core/README.md`](../../packages/core/README.md).
