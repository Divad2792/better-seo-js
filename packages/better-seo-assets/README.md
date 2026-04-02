# `@better-seo/assets`

[![npm](https://img.shields.io/npm/v/@better-seo/assets?style=flat-square)](https://www.npmjs.com/package/@better-seo/assets)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE)
[![CI](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml)

Optional **Node-side** helpers for Better SEO: **Open Graph** PNGs (**1200×630**) via Satori + Resvg (built-in card + optional **compiled `.js` / `.mjs` template**), and **icons + PWA manifest** from a source image (Sharp, **`to-ico`** favicon). Intended for **build scripts**, servers, and [**`@better-seo/cli`**](../better-seo-cli/README.md)—**not** for Edge or lightweight client bundles.

**Docs:** [Monorepo README](../../README.md) · [OG recipe](../../docs/recipes/og-wave2.md) · [Icons recipe](../../docs/recipes/icons-wave3.md) · [FEATURES — A\*](../../internal-docs/FEATURES.md)

---

## Install

```bash
npm install @better-seo/assets
```

Brings in **React**, **Satori**, **Sharp**, **Resvg**, etc. Keep this dependency out of hot browser/Edge paths.

---

## Main capabilities

| API                                                                               | Purpose                                                                                                                                                     |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`generateOG`**                                                                  | Render OG PNG; **`OGConfig`** (title, theme, logo, optional **`template`** path to `.js`/`.mjs` module exporting a Satori component with **`OgCardProps`**) |
| **`generateIcons`**                                                               | PNG sizes + **`favicon.ico`** + Apple / maskable assets from SVG or raster                                                                                  |
| **`buildWebAppManifest`**, **`formatWebManifest`**, **`defaultWebManifestIcons`** | PWA **`manifest.json`** data                                                                                                                                |

Types: **`OgCardProps`**, **`OgCardPalette`**, and related exports — see **`src/index.ts`**.

---

## CLI

Most teams invoke the same stack via **`npx @better-seo/cli`** (`og`, `icons`) — see [**`@better-seo/cli`**](../better-seo-cli/README.md).

---

## Scripts (monorepo)

From **`packages/better-seo-assets`**:

```bash
npm run build
npm run test
npm run test:coverage
npm run lint
npm run typecheck
```

---

## Coverage

[`vitest.config.ts`](./vitest.config.ts) enforces **V8** coverage on implementation files under **`src/`** (excluding tests, barrel **`index.ts`**, **`types.ts`**).

| Metric         | Minimum |
| -------------- | ------- |
| **Lines**      | 85%     |
| **Statements** | 85%     |
| **Functions**  | 85%     |
| **Branches**   | 75%     |

---

## Runtime

Requires **Node >= 20**. Sharp uses native binaries; CI covers Linux; local dev on Windows/macOS is supported by Sharp’s prebuilds.

---

## License

MIT — see [**LICENSE**](../../LICENSE).
