# `@better-seo/cli`

[![npm](https://img.shields.io/npm/v/@better-seo/cli?style=flat-square)](https://www.npmjs.com/package/@better-seo/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE)
[![CI](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml)

Command-line interface for Better SEO **asset** workflows, powered by [**`@better-seo/assets`**](../better-seo-assets/README.md). Binaries: **`better-seo`** and **`better-seo-cli`** (same entry).

**Docs:** [Monorepo README](../../README.md) · [FEATURES — L2](../../internal-docs/FEATURES.md)

---

## Install / run

```bash
npm install -D @better-seo/cli
npx better-seo --help
```

Or **`npx @better-seo/cli`** without a project install.

---

## Commands

| Command     | Description                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **`og`**    | Generate **1200×630** OG PNG (built-in template or **`--template ./card.mjs`**)                         |
| **`icons`** | Generate favicon + icon set from a logo; optional **`manifest.json`** (use **`--no-manifest`** to skip) |

See **`src/run-cli.ts`** and monorepo recipes: [**OG**](../../docs/recipes/og-wave2.md), [**icons**](../../docs/recipes/icons-wave3.md).

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

Tests include **Vitest** for argv parsing paths and a **binary smoke** test that runs the built **`og`** command.

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
