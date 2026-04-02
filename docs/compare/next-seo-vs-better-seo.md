---
title: next-seo vs better-seo.js
description: Model, JSON-LD, App Router adapter, assets — and how migration fits today.
---

# next-seo vs better-seo.js (D6)

**What it does:** Honest positioning for teams comparing **next-seo** with the unified **`SEO`** model and **Next** adapter in this monorepo.

**When to use:** Migration planning; proving JSON-LD + OG + rules story in a **single document**.

| Topic           | next-seo (typical) | @better-seo / monorepo                                                    |
| --------------- | ------------------ | ------------------------------------------------------------------------- |
| Model           | Component + props  | Single **`SEO`** document + **`createSEO` / `mergeSEO`**                  |
| JSON-LD         | Add-on / manual    | **`serializeJSONLD`** as the only script path                             |
| Next App Router | Patterns vary      | **`@better-seo/next`**: **`seo`**, **`prepareNextSeo`**, **`NextJsonLd`** |
| OG / icons      | External tooling   | **`@better-seo/assets`** + **`@better-seo/cli`** (`og`, `icons`)          |
| Zero-dep core   | N/A                | **`@better-seo/core`** has **no runtime `dependencies`**                  |

**Migration:** **`fromNextSeo`** in **`@better-seo/core`** and **`npx better-seo migrate from-next-seo`** (hints today; codemods may expand later). Until then, map title/description/canonical/OG manually using **[`packages/core/README.md`](../../packages/core/README.md)**, **[`packages/next/README.md`](../../packages/next/README.md)**, and **[`docs/recipes/`](../recipes/index.md)**.
