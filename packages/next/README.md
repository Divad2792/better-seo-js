# `@better-seo/next`

[![npm](https://img.shields.io/npm/v/@better-seo/next?style=flat-square)](https://www.npmjs.com/package/@better-seo/next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE)
[![CI](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml)

Next.js integration for [**`@better-seo/core`**](../core/README.md): App Router **`Metadata`**, **`generateMetadata`** patterns, shorthand **`seo()`**, **`prepareNextSeo`**, layout merge via **`withSEO`**, and **`NextJsonLd`** so JSON-LD uses the same **`serializeJSONLD`** path as the rest of the stack.

**Peers:** `next` **>= 14.2**, `react` **>= 18.2** (see **`package.json`**).

**Docs:** [Monorepo README](../../README.md) · [Usage](../../internal-docs/USAGE.md) · [Recipes](../../docs/recipes/)

---

## Install

```bash
npm install @better-seo/core @better-seo/next
```

---

## Entry points

| Import                         | Role                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| **`@better-seo/next`**         | `seo`, `prepareNextSeo`, `withSEO`, `toNextMetadata`, adapter registration for `"next"` |
| **`@better-seo/next/json-ld`** | **`NextJsonLd`** — renders `<script type="application/ld+json">` from a **`SEO`**       |

---

## Scripts (monorepo)

From **`packages/next`**:

```bash
npm run build
npm run test
npm run test:coverage
npm run lint
npm run typecheck
```

**E2E:** Playwright tests in **`examples/nextjs-app`** exercise real HTML head output (runs in root **`npm run ci`**).

---

## Coverage

[`vitest.config.ts`](./vitest.config.ts) scopes coverage to **`src/to-next-metadata.ts`** (mapping logic); wiring in `surface` / `register` is covered by E2E.

| Metric         | Minimum |
| -------------- | ------- |
| **Lines**      | 82%     |
| **Statements** | 82%     |
| **Functions**  | 80%     |
| **Branches**   | 72%     |

LCov: **`coverage/lcov.info`** (uploaded from CI when present).

---

## License

MIT — see [**LICENSE**](../../LICENSE).
