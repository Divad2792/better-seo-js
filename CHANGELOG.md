# Changelog

## 0.1.0 (2026-04-04)

### Features

- **@better-seo/core**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).
- **@better-seo/next**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).
- **@better-seo/react**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).
- **@better-seo/assets**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).
- **@better-seo/cli**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).
- **@better-seo/crawl**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).
- **@better-seo/compiler**: Major release v0.1.0: Docs site, release infra, and feature completion. - **Docs site**: Pure HTML/CSS/JS GitHub Pages site — zero build, zero cost. Dark/light theme toggle, syntax highlighting, copy-to-clipboard, mobile-first responsive. All 10 pages: landing, getting-started, concepts, API, recipes, CLI, commands, adapters, assets, compare. - **Release infra**: Complete rewrite. `npm run release` (lint → test → build → size → changesets → bump → commit → tag → push). `npm run release:dry-run` for dry runs. `npm run changeset` interactive helper. Tag-based GitHub Actions release workflow. Dependabot configured. - **@better-seo/cli**: Added `scan`, `fix`, `add` commands (Wave 10 automation). Added `splash` command (Wave 11). Enhanced TUI launcher with crawl sub-menu. - **@better-seo/assets**: Added `generateSplash` (iOS/iPadOS splash screens). Added `ogPaletteFromTokens` (design tokens → OG palette). - **@better-seo/crawl**: Added `renderSitemapIndexXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`. Full syndication/discovery suite. - **@better-seo/core**: Added `defineSEO` (C18), codemods for next-seo migration, `techArticle` schema helper, plugin system with `extendChannels`, `features` capability flags, hardened `serializeJSONLD` with Reflect.ownKeys prototype pollution prevention. - **@better-seo/compiler**: `fromMdx` with gray-matter frontmatter extraction. - **E2E**: Added rich-results test suite, 354 total unit tests across 7 packages, 94%+ core coverage. - **Removed**: `apps/docs` (Nextra app replaced by static HTML), `scripts/release-menu.mjs` (replaced by release.js).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release history is also summarized against **roadmap waves** in [`internal-docs/PROGRESS.md`](./internal-docs/PROGRESS.md): **0.0.1** ↔ waves **1–5**; **0.0.2** ↔ waves **6–12** (plus ongoing stretch items called out below).

Version bumps for published **`@better-seo/*`** packages are applied with [Changesets](https://github.com/changesets/changesets); this changelog is the human-readable map across the monorepo.

## [0.0.2] - 2026-04-02

Per **PROGRESS.md**, this release focuses on **wave 6** (complete) and **waves 7–12** (baselines and partials shipped; stretch goals noted).

### Wave 6 — Rules / SEO scale (complete)

- **`@better-seo/core`:** `SEOConfig.rules`, `seoRoute`, glob-style rule matching, `createSEOContext.createSEOForRoute`, and rule application tests (`rules.test.ts`).
- **`@better-seo/next`:** `prepareNextSeoForRoute`, **`seoLayout` / `seoPage`** (voilà helpers), integration with the rules pipeline.
- **Docs:** recipe **`docs/recipes/n9-rules-route-next.md`** (N9 rules + route behavior; **V6** limits documented there).

### Wave 7 — Content compiler (baseline, C16–C17)

- **`@better-seo/core`:** **`fromContent`**, **`fromMdxString`** (string/Markdown + frontmatter path to SEO inputs).
- **`@better-seo/compiler`:** **`fromMdx`** (gray-matter + body via **`fromContent`**); not a full MDX AST compiler.
- **`@better-seo/cli`:** **`content from-mdx`** (`--input`, `--out`) producing JSON compatible with snapshot / preview / analyze.
- **Tests / docs:** compiler tests, **`docs/recipes/mdx-frontmatter-wave7.md`** and API stubs under **`docs/api/compiler.md`**.

### Wave 8 — Snapshot / preview CLI (baseline)

- **`@better-seo/cli`:** **`snapshot`** (write tags JSON, **`compare a b`**) and **`preview`** (static HTML head fixture).
- **`preview`:** **`--open`** to open the default browser; respects **`BETTER_SEO_NO_OPEN`** and CI (`CI`) so automated runs do not launch a UI.
- **Stretch vs PRD:** multi-network **L6** “platform preview” matrix not in scope for this baseline.

### Wave 9 — TUI, init, doctor, templates (baseline)

- **Clack-powered** interactive launcher and trust-oriented flows (see **`docs/commands.md`**).
- **`doctor`:** Node / **`engines`**, workspace **`@better-seo/*`** hints, **`--json`** output where applicable.
- **`init`**, **`migrate`** entry points and guidance (full codemods remain roadmap).
- **`template`:** `list`, `print`, `preview` for industry presets (**L9** baseline) built on **`defineSEO`** (C18).
- **Stretch:** deeper hosted template catalog (**L10–L11**), richer **L8** TUI depth.

### Wave 10 — Analyze CLI (baseline)

- **`@better-seo/cli`:** **`analyze`** wired to **`validateSEO`**; non-zero exit on validation errors.
- **Stretch:** **`add`**, **`scan`**, **`fix`** (**L3**) and AST codemods not shipped in this line.

### Wave 11 — Design-system OG (baseline)

- **`@better-seo/assets`:** **`ogPaletteFromTokens`** (+ tests) bridging tokens to OG palette usage.
- **Stretch:** **`splash`** icons and deeper OG / design-token integration.

### Wave 12 — Crawl + syndication (baseline)

- **`@better-seo/crawl`:** **`renderRobotsTxt`**, **`renderSitemapXml`**, **`renderRssXml`**, **`renderAtomFeed`**, **`renderLlmsTxt`**, **`renderSitemapIndexXml`**, **`defaultSitemapUrlFromSEO`** (+ **`syndication.test.ts`** and CLI integration tests).
- **`@better-seo/cli`:** **`crawl`** subcommands (robots, sitemap, **rss**, **atom**, **llms**, **sitemap-index**) aligned with the crawl package.
- **`fromNextSeo`:** baseline mapping for common **next-seo** props; edge cases and **migrate** codemods still on the roadmap.
- **Stretch:** hreflang sitemap depth, **L7**-style **`migrate`** codemods, extra **D\*** docs per roadmap.

### Ongoing (not version-gated as “done” in PROGRESS)

- **`@better-seo/compiler`:** full MDX AST / PRD §3.9 compiler depth.
- **CLI:** **add / scan / fix**, richer **doctor** CI matrix.
- **Ecosystem:** packaged plugins (**P3/P4**), playground (**D8**), Pages Router / i18n and related **NX** roadmap tracks in **`Roadmap.md`**.

### Tooling / monorepo (0.0.2 window)

- **Node 24** targeted for **`engines`** and CI; **winget** / **`.nvmrc`** guidance in **`CONTRIBUTING.md`**.
- **`@better-seo/react`:** tsup DTS uses **`dts: { resolve: true }`** so **`@better-seo/core`** types resolve in declaration builds.
- **Examples:** Next 16 example lint uses **`eslint`** ( **`next lint`** removed from Next 16 CLI ).
- **Coverage:** expanded tests for **`resolveLogoDataUrl`**, icon favicon fallbacks, CLI template/content paths, and **`openPathInDefaultApp`** mocks.

---

## [0.0.1] - 2026-01-15

Per **PROGRESS.md**, this release covers **waves 1–5**: core pipeline, OG, icons, distribution polish, and React + validation.

### Wave 1 — Core + Next + E2E

- **`@better-seo/core`:** `SEO` / `SEOConfig` types, **`createSEO`**, **`mergeSEO`**, **`withSEO`**, **`schemaMerge`** / dedupe, **`serializeJSONLD`** (safe JSON-LD path), **`validateSEO`** baseline, **`renderTags`**, route rules API (pre–wave-6 rule config surface), schema helpers, plugin hooks **`beforeMerge` / `afterMerge` / `onRenderTags`**, structured **`SEOError`** / codes.
- **`@better-seo/next`:** **`registerAdapter`**, **`toNextMetadata`**, **`seo`**, **`prepareNextSeo`**, **`NextJsonLd`** surface, golden metadata tests.
- **`@better-seo/core/node`:** package/env inference (**`readPackageJsonForSEO`**, **`inferSEOConfigFromEnvAndPackageJson`**, **`initSEOFromPackageJson`**).
- **Examples / CI:** **`examples/nextjs-app`** with Playwright (**home**, **with-seo**, **head-tags**, blog route).
- **Docs / recipes:** N5, N6, N9-facing docs (layout merge, async metadata, rules recipe later extended in 0.0.2).

### Wave 2 — Open Graph

- **`@better-seo/assets`:** **`generateOG`** (Satori + Resvg), themes, optional logo URL/path, **`--template`** for compiled **`.js`/`.mjs`** OG modules.
- **`@better-seo/cli`:** **`og`** command (title, **`--out`**, **`--site-name`**, theme, template).
- **Docs:** **`docs/recipes/og-wave2.md`**, **`README`** / **`USAGE`** OG story.

### Wave 3 — Icons + PWA manifest

- **`@better-seo/assets`:** **`generateIcons`**, **`buildWebAppManifest`**, **`formatWebManifest`**, Sharp pipeline, **`to-ico`** favicon.
- **`@better-seo/cli`:** **`icons`** command.
- **Docs:** **`docs/recipes/icons-wave3.md`**. (**`splash`** deferred to later roadmap / wave 11+.)

### Wave 4 — Distribution and polish

- **Monorepo:** Changesets, **`PACKAGE.md`**, dual ESM/CJS via **tsup**, **size-limit** on **`@better-seo/core`**, **`npm run ci`** wiring.
- **Docs:** **`docs/compare/next-seo-vs-better-seo.md`**, public **`docs/`** + Nextra **`apps/docs`** path.
- **Examples:** **`examples/vanilla-render-tags`** (D7), **`examples/react-seo-vite`**, **`examples/nextjs-app`** **`predev` / `prebuild`** asset pipeline (**`npm run assets`**).

### Wave 5 — React adapter + validation depth

- **`@better-seo/react`:** **`toHelmetProps`**, **`BetterSEOHelmet`**, **`SEOProvider`**, **`useSEO`** (incl. **`USE_SEO_NO_PROVIDER`** behavior), **`prepareReactSeo`**, **`react`** adapter registration.
- **`renderTags`** parity extensions (OG URL/type, multiple OG images, verification/pagination hooks) aligned with Next metadata mapping.
- **Tests:** Vitest for React package; Playwright on **`react-seo-vite`** (Helmet title, description, canonical).
- **Docs:** **`docs/recipes/react-wave5.md`**. **`docs/adapters/future-frameworks.md`** for non-Next adapters (stubs/docs only).

---

## Unreleased

- Items in progress are tracked in **`internal-docs/PROGRESS.md`** and **`internal-docs/Roadmap.md`**; use Changesets when shipping the next semver.
