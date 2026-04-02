# `@better-seo/core`

[![npm](https://img.shields.io/npm/v/@better-seo/core?style=flat-square)](https://www.npmjs.com/package/@better-seo/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE)
[![CI](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml)

Framework-agnostic SEO **document model** for JavaScript and TypeScript: merge partial inputs into a canonical **`SEO`**, serialize HTML-safe **JSON-LD**, validate in development, render vanilla **tag descriptors**, and register framework adapters. **Zero runtime npm dependencies** so Node, Edge, and browser bundles stay light.

**Docs:** [Monorepo README](../../README.md) · [Usage & errors](../../internal-docs/USAGE.md) · [Architecture](../../internal-docs/ARCHITECTURE.md) · [FEATURES — C\* IDs](../../internal-docs/FEATURES.md)

---

## Install

```bash
npm install @better-seo/core
```

Use with **`@better-seo/next`** or your own adapter; OG/icon generation stays in **`@better-seo/assets`** / **`@better-seo/cli`**.

---

## What you get

| Area                | Exports (high level)                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| **Model**           | `createSEO`, `mergeSEO`, `withSEO`, types `SEO`, `SEOInput`, `SEOConfig`, … |
| **JSON-LD**         | `serializeJSONLD`, schema helpers (`webPage`, `article`, `organization`, …) |
| **Head (vanilla)**  | `renderTags`                                                                |
| **Quality**         | `validateSEO`, `ValidationIssueCode`, …                                     |
| **Extensibility**   | `defineSEOPlugin`, `registerAdapter`, `getAdapter`, `applyRules`, …         |
| **Context**         | `createSEOContext` (preferred for Edge / multi-tenant)                      |
| **Global (legacy)** | `initSEO`, `getGlobalSEOConfig` — see USAGE warnings                        |
| **Orchestration**   | `seoForFramework`, `useSEO` (stub until **`@better-seo/react`**)            |
| **Errors**          | `SEOError`, `isSEOError`                                                    |

Full API surface is **`src/index.ts`** (published as **`dist/index.*`**).

---

## Scripts (monorepo)

From **`packages/core`**:

```bash
npm run build          # tsup → dist/
npm run test           # vitest run
npm run test:coverage  # vitest + coverage thresholds (CI gate)
npm run lint
npm run typecheck
npm run size           # size-limit on dist/index.js
```

From repository root, core is built as part of **`npm run build`** / **`npm run check`**.

---

## Coverage

[`vitest.config.ts`](./vitest.config.ts) enforces **V8** coverage on `src/**/*.ts` (excluding tests, `index.ts`, `types.ts`).

| Metric         | Minimum |
| -------------- | ------- |
| **Lines**      | 90%     |
| **Statements** | 90%     |
| **Functions**  | 88%     |
| **Branches**   | 80%     |

CI runs **`npm run test:coverage`** via the root **`check`** script. LCov output: **`coverage/lcov.info`** (also uploaded from GitHub Actions for **`@better-seo/core`**).

---

## Size budget

Configured in **`package.json`** → **`size-limit`** (tracked in **`npm run ci`** at monorepo root).

---

## License

MIT — see [**LICENSE**](../../LICENSE).
