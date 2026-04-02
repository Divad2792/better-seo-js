---
title: CLI overview
description: Why the CLI exists, how to run it non-interactively, and where the full command matrix lives.
---

# CLI overview

**What it does:** Companion tooling for **better-seo.js** — asset generation (**`og`**, **`icons`**), crawl helpers (**`crawl`**), trust tooling (**`snapshot`**, **`preview`**, **`analyze`**), **`doctor`**, **`init`**, and **`migrate`** hints — without importing heavy dependencies into Edge or browser bundles.

**When to use:** After you can render **`Metadata`** / Helmet (see [Get started](../getting-started/index.md)); whenever you want reproducible CI scripts or local asset pipelines.

## Run it

Published package: **`@better-seo/cli`** (bin: **`better-seo`**).

```bash
npx @better-seo/cli --help
# or, when the binary is on PATH:
better-seo og "Hello" -o ./public/og.png
```

In **CI** or pipes, pass **`--no-interactive`** (or set **`CI=true`**) so the interactive launcher never opens — see [Command reference](../commands.md) for the full matrix.

## Map to packages

| Concern                | Typical CLI entry               | Library                                        |
| ---------------------- | ------------------------------- | ---------------------------------------------- |
| OG PNG, icons          | **`og`**, **`icons`**           | **`@better-seo/assets`**                       |
| Robots, sitemap, feeds | **`crawl …`** or route handlers | **`@better-seo/crawl`**                        |
| SEO model + Next       | (use app code, not CLI)         | **`@better-seo/core`**, **`@better-seo/next`** |

**Not shipped yet (roadmap):** **`add`**, **`scan`**, **`fix`**, **`splash`**, template switcher — called out in [Command reference](../commands.md) and [internal PROGRESS](https://github.com/0xMilord/better-seo-js/blob/main/internal-docs/PROGRESS.md).

## Next

- **Full flags, exit codes, TUI behavior:** [CLI command reference](../commands.md)
- **Robots + sitemap in Next:** [Robots + sitemap recipe](../recipes/sitemap-robots-next.md)
