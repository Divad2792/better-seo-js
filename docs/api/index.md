---
title: API overview
description: Packages in the monorepo and where each surface lives.
---

# API overview

**What it does:** Maps **npm packages** to **jobs** — core model, adapters, assets, crawl builders, CLI.

**When to use:** Picking imports for a new file or onboarding.

| Package                  | Role                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@better-seo/core`**   | `createSEO`, `mergeSEO`, schema helpers, `serializeJSONLD`, `validateSEO`, `renderTags`, rules, context                                       |
| **`@better-seo/next`**   | `seo`, `prepareNextSeo`, `withSEO`, `toNextMetadata`, `seoRoute`, `seoLayout`, `seoPage`, `NextJsonLd`                                        |
| **`@better-seo/react`**  | Helmet / **`useSEO`** for SPAs                                                                                                                |
| **`@better-seo/assets`** | OG PNG, icons, manifest (Node)                                                                                                                |
| **`@better-seo/cli`**    | TUI, `og`, `icons`, `crawl`, `doctor`, …                                                                                                      |
| **`@better-seo/crawl`**  | `renderRobotsTxt`, `renderSitemapXml`, `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`, `defaultSitemapUrlFromSEO` |

Deep dives: [Core](./core.md) · [Next](./next.md) · [React](./react.md) · [Crawl](./crawl.md)
