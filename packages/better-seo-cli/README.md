# `@better-seo/cli`

[![npm](https://img.shields.io/npm/v/@better-seo/cli?style=flat-square)](https://www.npmjs.com/package/@better-seo/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE)
[![CI](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml)

Command-line interface for Better SEO **asset** and **crawl-string** workflows: **OG** and **icons** via [**`@better-seo/assets`**](../better-seo-assets/README.md), **robots.txt** / **sitemap.xml** via [**`@better-seo/crawl`**](../better-seo-crawl/). Binaries: **`better-seo`** and **`better-seo-cli`** (same entry).

**Docs:** [Monorepo README](../../README.md) · [**Commands reference**](../../docs/commands.md)

### Terminal surface

- **Interactive (default in TTY):** run **`better-seo`** with **no subcommand** when **stdout** and **stdin** are TTYs and **`CI`** / **`BETTER_SEO_CI`** / **`BETTER_SEO_NO_TUI`** are unset → **[@clack/prompts](https://github.com/bombshell-dev/clack)** menu (OG, icons, crawl hints, doctor, init, migrate, exit).
- **Non-interactive:** pass a **subcommand** (`og`, `icons`, `crawl`, …), or put **`--no-interactive`**, **`-y`**, or **`--yes`** first, or set **`CI`** / **`BETTER_SEO_CI`** / **`BETTER_SEO_NO_TUI`** → no prompts; bare **`better-seo`** prints help and exits **`1`**.

**`@better-seo/core` stays zero-dep** — prompts and Clack live **only** in this package.

---

## Install / run

```bash
npm install -D @better-seo/cli
npx better-seo --help
```

Or **`npx @better-seo/cli`** without a project install.

---

## Commands

| Command       | Description                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`og`**      | Generate **1200×630** OG PNG (built-in template or **`--template ./card.mjs`**)                                  |
| **`icons`**   | Generate favicon + icon set from a logo; optional **`manifest.json`** (use **`--no-manifest`** to skip)          |
| **`crawl`**   | **`crawl robots`** / **`crawl sitemap`** — write **`public/robots.txt`**-style files via **`@better-seo/crawl`** |
| **`doctor`**  | Basic environment check (`--json`)                                                                               |
| **`init`**    | Print install + starter snippet (`--framework next\|react`)                                                      |
| **`migrate`** | e.g. **`migrate from-next-seo`** — migration hints                                                               |

**Next.js recipes:** [`docs/recipes/sitemap-robots-next.md`](../../docs/recipes/sitemap-robots-next.md) (shared **`baseUrl`**, `MetadataRoute`, CLI).

See **`src/run-cli.ts`**, **`src/launch-interactive.ts`**, and recipes: [**OG**](../../docs/recipes/og-wave2.md), [**icons**](../../docs/recipes/icons-wave3.md).

---

## Scripts (monorepo)

From **`packages/better-seo-cli`**:

```bash
npm run build    # emits dist/cli.cjs (bin), dist/run-cli.*
npm run test
npm run test:coverage
npm run lint
npm run typecheck
```

Tests cover argv paths, **TTY launcher** (mocked Clack), **`crawl` writes**, and a **binary smoke** on **`dist/cli.cjs`**.

---

## Dependency audit (repro)

From repo root after `npm install`, transitive issues come from **`to-ico`** (favicon.ico) via **`@better-seo/assets`** — old **`jimp` / `request`** chain. Reproduce:

```bash
cd packages/better-seo-cli && npm audit
cd ../better-seo-assets && npm audit
```

`npm audit fix --force` is **not** recommended here (it can pin unusable versions). Risk is **build-time / local file** usage (you control the logo path); still tracked for a future replacement (e.g. ICO-only path without `to-ico`). Run **`npm audit`** in CI as you already do at the monorepo level.

---

## Coverage

[`vitest.config.ts`](./vitest.config.ts) covers `src/**/*.ts` except **`cli.ts`** (thin re-export) and tests.

| Metric         | Minimum |
| -------------- | ------- |
| **Lines**      | 80%     |
| **Statements** | 80%     |
| **Functions**  | 75%     |
| **Branches**   | 65%     |

---

## License

MIT — see [**LICENSE**](../../LICENSE).
