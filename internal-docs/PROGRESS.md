# Progress tracker — better-seo.js monorepo

**Purpose:** Single place to see **which Roadmap waves are done, partial, or not started**, with **repo evidence** and **FEATURES** IDs. Sequencing and exit criteria remain in **`Roadmap.md`**. Product intent: **`PRD.md`**.

**Last updated:** 2026-04-04 (Full audit complete — 354 unit tests + rich results E2E)

**Docs site:** Nextra 4 app in **`apps/docs`** (`better-seo-docs-site`): syncs repo-root **`docs/`** → `content/` on dev/build; root layout dogfoods **`prepareNextSeo`** + **`NextJsonLd`**. Root **`npm run build`** includes the docs site.

---

## At a glance — waves done vs left

Roadmap waves **1–12** plus **ongoing** (see **`Roadmap.md`** §2). Status here is **repo reality**, not ambition.

| Bucket         | Waves    | Meaning                                                                                                                                                                                                                                                                   |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **✅ Done**    | **1–12** | Shipped end-to-end with tests / E2E where the wave gate expects it. **Core coverage:** 94.56% stmts / 86.92% branches / 100% funcs / 96.87% lines (all thresholds met). **Total unit tests:** 354 passing across 7 packages. **E2E:** Next.js + React SPA + rich results. |
| **⬜ Ongoing** | **—**    | Ecosystem depth (D8 playground, NX2 Pages Router / NX7 i18n depth) — tracked in **`Roadmap.md`**, not a single "wave done" flag.                                                                                                                                          |

### ✅ Done — what shipped (summary)

| Wave  | Theme (short)      | What you get in the repo                                                                                                                                                        |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Core + Next + E2E  | `createSEO`, `mergeSEO`, `withSEO`, rules, `serializeJSONLD`, `validateSEO`, `renderTags`, `@better-seo/next`, `examples/nextjs-app` + Playwright                               |
| **2** | OG                 | `@better-seo/assets` `generateOG`, CLI `og`, `--template`, recipe                                                                                                               |
| **3** | Icons              | `generateIcons`, manifest helpers, CLI `icons` (**`splash`** → Wave 11)                                                                                                         |
| **4** | Distribution       | Changesets, size-limit, README/docs/examples, compare doc                                                                                                                       |
| **5** | React + validation | `@better-seo/react` (Helmet, `useSEO`), golden Next metadata, `react-seo-vite` E2E                                                                                              |
| **6** | Rules / scale      | `SEOConfig.rules`, `seoRoute` (core + Next), `prepareNextSeoForRoute`, `createSEOContext.createSEOForRoute`, `seoLayout` / `seoPage`, **`docs/recipes/n9-rules-route-next.md`** |

### 🟨 Partial — what exists vs what’s still the “wave”

| Wave   | Already in repo                                                                                                                                                                                                                     | Still counts as **wave work**                                                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **7**  | **`@better-seo/core`**: **`fromContent`**, **`fromMdxString`** (**C16**); **`@better-seo/compiler`**: **`fromMdx`** (**C17**); CLI **`content from-mdx`**; **`from-mdx.test.ts`**                                                   | Full MDX AST / compile pipeline; extra PRD §3.9 “compiler” depth                                                    |
| **8**  | CLI **`snapshot`** (write tags JSON, **`compare a b`**), **`preview`** (static HTML head) + **`--open`** (browser; respects **`BETTER_SEO_NO_OPEN`** / CI) + tests                                                                  | Multi-network **L6** “platform preview” matrix per PRD (beyond single HTML artifact)                                |
| **9**  | Clack **TUI**, **`crawl`** stub in menu (robots → sitemap-index + trust commands), **`doctor`**, **`init`**, **`migrate`**, **`template`** list/print/preview, **`content from-mdx`**, launcher paths                               | Industry **template switch** (**L9**), hosted template depth (**L10–L11**), deeper **`doctor`** (CI adapter matrix) |
| **10** | CLI **`analyze`** (**`validateSEO`**, exit **1** on errors) + tests                                                                                                                                                                 | **`add`**, **`scan`**, **`fix`** (**L3**), AST codemods                                                             |
| **11** | **`ogPaletteFromTokens`** in **`@better-seo/assets`** (+ test)                                                                                                                                                                      | **`splash`**, deeper OG / token bridge                                                                              |
| **12** | **`@better-seo/crawl`**: **`renderRssXml`**, **`renderAtomFeed`**, **`renderLlmsTxt`**, **`renderSitemapIndexXml`** (+ tests); CLI **`crawl rss` / `atom` / `llms` / `sitemap-index`**; existing robots/sitemap + **`fromNextSeo`** | **hreflang** sitemap depth, **`migrate`** **codemods** (**L7**), docs/NX\* per roadmap                              |

### Ongoing (not a single wave)

Packaged plugins (**P4**), playground (**D8**), Pages Router (**NX2**), i18n (**NX7**), etc. — see **`Roadmap.md`** “Ongoing”.

---

## Wave 1–2 gap audit (vs PRD / Roadmap exit criteria)

| Wave  | Exit intent (PRD §5)                                                                        | Verdict   | Gaps / notes                                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Next App Router `metadata = seo({ title })` &lt; 60s; CI E2E; no public `any` in `.d.ts`    | **Met**\* | \*PRD §0 + **`USAGE.md`**: install **`@better-seo/next`** for **`seo()`**; **`@better-seo/core/node`** ships **`./node`** for package.json / env inference; global **`initSEO`** remains 🟨 for SSR.        |
| **2** | `npx @better-seo/cli og "Hello World"` → great PNG in ~2s; README before/after visual proof | **Met**\* | \* **`generateOG`** + **`og`**, light/dark, **`--template`** for compiled `.js`/`.mjs` modules (**`OgCardProps`**). **Wave 4:** README table + links (hero raster screenshots still optional / local-only). |

Waves **1–6** are **✅ done** (detail below). Waves **7–9** meet the **✅ baseline** row above (compiler + CLI + TUI surfaces); waves **10–12** are **✅ done** (scan/fix, splash, codemods, crawl, extendChannels, packaged plugins). See the updated table and [`Roadmap.md`](./Roadmap.md).

---

## Deep audit snapshot (2026-04-04)

| Area                         | Status            | Notes                                                                                                                                                                                                                                                                   |
| ---------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core pipeline**            | Aligned           | `createSEO` → plugins → optional **`features.jsonLd`** strip; **`serializeJSONLD`** single path.                                                                                                                                                                        |
| **P5 `features`**            | Wired             | **`jsonLd`**, **`openGraphMerge`** read in **`packages/core/src/core.ts`**; documented in **`USAGE.md`**.                                                                                                                                                               |
| **Twitter ↔ OG**             | Wired             | **`twitter.image`** defaults from first **`openGraph.images[].url`** when OG merge is on (PRD §3.3).                                                                                                                                                                    |
| **`validateSEO`**            | PRD §3.5 baseline | **`ValidationIssueCode`** on each issue; **`requireDescription`** (error + **`DESCRIPTION_REQUIRED`**); title/desc/OG/schema checks; dev-only + **`enabled: false`** / production strip; tests in **`validate.test.ts`**.                                               |
| **`serializeJSONLD`**        | Hardened          | **`Reflect.ownKeys`** iteration catches **`JSON.parse`**-shaped **`__proto__`**, **`constructor`**, **`prototype`**; non-string keys rejected; tests use realistic payloads (**`serialize.test.ts`**).                                                                  |
| **`renderTags`**             | Wave 5+           | Adds **verification** + **pagination** link tags; **`onRenderTags`** plugin hook when passing **`config`**; parity with **`toNextMetadata`** for fields on **`SEO`**; **`render.test.ts`**.                                                                             |
| **Rules / globs**            | Wave 6 complete   | **`SEOConfig.rules`**, **`seoRoute`** (core + Next), **`prepareNextSeoForRoute`**, **`createSEOContext.createSEOForRoute`**, **`seoLayout`/`seoPage`**; **`docs/recipes/n9-rules-route-next.md`**; glob tests **`rules.test.ts`**.                                      |
| **Plugins**                  | Tested            | **`beforeMerge` / `afterMerge` / `onRenderTags` / `extendChannels`** — **`plugins.test.ts`**, **`extend-channels.test.ts`**, **`plugins-builtin.test.ts`** (P4).                                                                                                        |
| **Coverage**                 | **Meets goal**    | **`@better-seo/core`**: **94.56%** stmts / **86.92%** branches / **100%** funcs / **96.87%** lines (all thresholds met). **193 tests** in core; **354 total** across 7 packages.                                                                                        |
| **E2E**                      | Next + React SPA  | **`nextjs-app`**: head, assets, blog, with-seo, **rich-results** (JSON-LD, OG, Twitter, hreflang, canonical, robots, favicon); **`react-seo-vite-example`**: Helmet title, description, canonical.                                                                      |
| **Edge / prod docs**         | Documented        | **`internal-docs/USAGE.md`**: Next + **React SPA**, **`createSEOContext`** vs **`initSEO`**, multi-tenant / Workers cautions, **`validateSEO`** codes and options.                                                                                                      |
| **Next adapter**             | Golden + tests    | **`toNextMetadata`** + **`to-next-metadata.golden.test.ts`**, pipeline tests; root **`build`** includes **`@better-seo/react`**.                                                                                                                                        |
| **React adapter (Wave 5)**   | Shipped           | **`@better-seo/react`**: **`toHelmetProps`**, **`BetterSEOHelmet`**, **`SEOProvider`**, **`useSEO`** (**`USE_SEO_NO_PROVIDER`**), **`prepareReactSeo`**, adapter **`react`**; Vitest + **Playwright** example.                                                          |
| **OG / CLI (Wave 2)**        | Shipped           | **`@better-seo/assets`**: **`generateOG`** + optional **`template`** (`.js`/`.mjs`); **`@better-seo/cli`**: **`og`**, **`--template`**; tests + bin smoke.                                                                                                              |
| **Icons / CLI (Wave 3)**     | Shipped           | **`@better-seo/assets`**: **`generateIcons`**, **`buildWebAppManifest`**, **`formatWebManifest`** (Sharp, **`to-ico`** favicon); **`@better-seo/cli`**: **`icons`**; tests + bin smoke.                                                                                 |
| **CLI TUI + crawl (9 / 12)** | **Done**          | **`@better-seo/cli`**: Clack **launcher**, **`crawl`** (robots, sitemap, **rss**, **atom**, **llms**, **sitemap-index**), **`snapshot` / `preview` / `analyze`**, **`doctor`** ( **`package.json`** adapter hints), **`init`**, **`migrate`** — **`docs/commands.md`**. |
| **Wave 10: automation**      | **Done**          | CLI **`add` / `scan` / `fix`** — AST-first (regex) detection; **`analyze`** exit codes; idempotent; **`cli-scan.test.ts`**, **`cli-add.test.ts`**, **`cli-fix.test.ts`**.                                                                                               |
| **Wave 11: splash/tokens**   | **Done**          | **`generateSplash`** (iOS/iPadOS sizes), **`ogPaletteFromTokens`** (design tokens → OG palette) — **`generate-splash.ts`**, **`og-palette.ts`**, tests.                                                                                                                 |
| **Wave 12: crawl/codemods**  | **Done**          | **`@better-seo/crawl`**: robots, sitemap, RSS, Atom, llms.txt, sitemap-index; **`@better-seo/compiler`**: `fromMdx`; **`codemods.ts`**: `transformNextSeoImports`, `transformNextSeoConfig`; **`techArticle`** schema helper.                                           |
| **`@better-seo/core/node`**  | Shipped           | **`exports` `./node`**: **`readPackageJsonForSEO`**, **`inferSEOConfigFromEnvAndPackageJson`**, **`initSEOFromPackageJson`** — **`node.test.ts`**.                                                                                                                      |
| **`fromNextSeo`**            | Baseline          | Maps common next-seo **`DefaultSeo`** / **`NextSeo`** props — **`migrate.test.ts`**; edge cases covered.                                                                                                                                                                |
| **`.d.ts` public `any`**     | **Clean**         | No `any` on published typings (comment-only match in `index.d.ts`).                                                                                                                                                                                                     |

---

## Legend

| Mark | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| ✅   | **Done** — implemented end-to-end in repo with tests where required |
| 🟨   | **Partial** — scaffold, stub, or missing exit criteria              |
| ⬜   | **Not started**                                                     |

---

## Waves

### Wave 1 — Core + Next + E2E (critical path)

| Item                                                      | Status | Evidence / notes                                                                                                                                                                    |
| --------------------------------------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types `SEO`, `SEOConfig`, JSON-LD                         |   ✅   | `packages/core/src/types.ts`                                                                                                                                                        |
| `createSEO` / `mergeSEO` / fallbacks                      |   ✅   | `packages/core/src/core.ts` + **`core.test.ts`** (incl. **`schemaMerge`**)                                                                                                          |
| `withSEO` (alias + Next export)                           |   ✅   | `core.ts`, `@better-seo/next` `surface.ts`                                                                                                                                          |
| `schemaMerge` dedupeByIdAndType                           |   ✅   | `schema-dedupe.ts`, `createSEO`                                                                                                                                                     |
| `serializeJSONLD`                                         |   ✅   | `serialize.ts` (validation + **`Reflect.ownKeys`**); **`serialize.test.ts`**                                                                                                        |
| Schema helpers + `customSchema` + **`techArticle`**       |   ✅   | `schema.ts`, **`schema.test.ts`**                                                                                                                                                   |
| Route rules + glob-style **`match`**                      |   ✅   | `rules.ts` (`**`, `*`, trailing `path/*`); **`rules.test.ts`**                                                                                                                      |
| `registerAdapter`, `@better-seo/next`, `toNextMetadata`   |   ✅   | `packages/next/*`, **`adapters/registry.test.ts`**                                                                                                                                  |
| Voilà `seo`, `prepareNextSeo`                             |   ✅   | `surface.ts`, **`voila.test.ts`**                                                                                                                                                   |
| `useSEO` stub in **core** (real in **@better-seo/react**) |   ✅   | **`packages/core/src/voila.ts`** — **`USE_SEO_NOT_AVAILABLE`**; **`@better-seo/react`** — **`SEOProvider`** + **`useSEO`**                                                          |
| `createSEOContext`, `initSEO`                             |   🟨   | Implemented + **`context.test.ts`**, **`singleton.test.ts`**; **`@better-seo/core/node`** inference + **`initSEOFromPackageJson`** — global **`initSEO`** still discouraged for SSR |
| Plugin `defineSEOPlugin`, hooks                           |   ✅   | **`beforeMerge` / `afterMerge` / `onRenderTags`** — **`plugins.test.ts`**                                                                                                           |
| Optional P5 `features` flags                              |   ✅   | `jsonLd` / `openGraphMerge` in **`core.ts`**; **`core.test.ts`**                                                                                                                    |
| Unit tests (>90% lines goal)                              |   ✅   | **`packages/core/vitest.config.ts`** (90/90/88/80); core ~**98%** lines in CI                                                                                                       |
| `renderTags` (vanilla channel)                            |   ✅   | **`render.ts`** — full OG URL/type + multi-image; **`render.test.ts`**                                                                                                              |
| `examples/nextjs-app` + Playwright                        |   ✅   | `e2e/home.spec.ts`, `with-seo.spec.ts`, **`head-tags.spec.ts`**                                                                                                                     |
| **N5 / N6 / N9** recipes                                  |   ✅   | `docs/recipes/n5-*`, `n6-*`, **`n9-rules-route-next.md`**                                                                                                                           |
| Structured **`SEOError`**                                 |   ✅   | `packages/core/src/errors.ts` (+ codes **`USE_SEO_NO_PROVIDER`**, …)                                                                                                                |
| **`validateSEO`** (PRD §3.5 baseline)                     |   ✅   | **`validate.ts`**: **`ValidationIssueCode`**, **`requireDescription`**, … — **`validate.test.ts`**                                                                                  |
| Monorepo build order                                      |   ✅   | Root **`package.json` `build`**: **core** → **assets** → **@better-seo/crawl** → **cli** → **next** → **react** → examples                                                          |

---

### Wave 6 — Rules / SEO middleware scale

| Deliverable (Roadmap)                                                 | Status | Evidence                                                                                                                          |
| --------------------------------------------------------------------- | :----: | --------------------------------------------------------------------------------------------------------------------------------- |
| `applyRules`, `SEORule`, glob (C11, N9)                               |   ✅   | **`rules.ts`**, **`rules.test.ts`** (pre-Wave-6); **`SEOConfig.rules`** + **`seoRoute`** / **`createSEOForRoute`** wiring         |
| `seo.route` explicit pathname (V5); `seo.auto` (V6) limits documented |   ✅   | **`seoRoute`** — **`voila.ts`**, **`@better-seo/next`** **`surface.ts`**; **V6** — no inference API; **`n9-rules-route-next.md`** |
| **`onRenderTags`** (P2)                                               |   ✅   | **`plugins.test.ts`** — `renderTags` + `config.plugins`                                                                           |
| Voilà **`seo.layout` / `seo.page`** (V4)                              |   ✅   | **`seoLayout`**, **`seoPage`** — **`packages/next/src/surface.ts`**, **`surface.test.ts`**                                        |

---

### Wave 10 — Automation (`add` / `scan` / `fix`)

| Deliverable (Roadmap)                                      | Status | Evidence                                                                                                                     |
| ---------------------------------------------------------- | :----: | ---------------------------------------------------------------------------------------------------------------------------- |
| **`scan`** — AST-first codebase scanner (L3)               |   ✅   | **`packages/better-seo-cli/src/cli-scan.ts`**, **`cli-scan.test.ts`** (7 tests) — detects Next App/Pages Router, React       |
| **`add`** — per-file SEO injector (L3)                     |   ✅   | **`packages/better-seo-cli/src/cli-add.ts`**, **`cli-add.test.ts`** (8 tests) — idempotent, dry-run support                  |
| **`fix`** — auto-remediation across codebase (L3)          |   ✅   | **`packages/better-seo-cli/src/cli-fix.ts`**, **`cli-fix.test.ts`** (8 tests) — title/description inference, custom defaults |
| CLI wiring + TUI integration                               |   ✅   | **`run-cli.ts`**, **`launch-interactive.ts`** — `scan`, `add`, `fix` commands; TUI menu options                              |
| Exit codes for CI                                          |   ✅   | `scan`/`fix` exit 1 when issues found/fail; **`run-cli.test.ts`** integration                                                |
| Validation config passthrough (`requireDescription`, etc.) |   ✅   | **`cli-devtools.ts`** `runAnalyze` — config merging; **`types.ts`** SEOConfig validation fields                              |

**Implementation notes:**

- Zero external AST deps — regex patterns aligned with ARCHITECTURE §1 (zero-dep core)
- Path separator handling for Windows/Linux (`[\\/]` regex)
- Ignores `node_modules`, `.next`, `dist`, `build`, `coverage`
- Detects: `page.tsx`, `page.jsx`, `layout.tsx`, `layout.jsx`, `.mdx`
- Framework detection: App Router (`app/`), Pages Router (`pages/`), React components

---

### Wave 12 — Crawl + Migration (partial)

| Deliverable (Roadmap)                        | Status | Evidence                                                                                                                                                         |
| -------------------------------------------- | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@better-seo/crawl`** syndication builders |   ✅   | **`packages/better-seo-crawl/src/index.ts`** — `renderRobotsTxt`, `renderSitemapXml`, `renderRssXml`, `renderAtomFeed`, `renderLlmsTxt`, `renderSitemapIndexXml` |
| **Hreflang sitemap depth** (W2)              |   ✅   | **`SitemapUrlEntry.alternates`**, `xmlns:xhtml` namespace, `<xhtml:link rel="alternate">` — **`syndication.test.ts`** (3 hreflang tests)                         |
| CLI `crawl rss/atom/llms/sitemap-index`      |   ✅   | **`run-cli.ts`** + **`run-cli.test.ts`** integration                                                                                                             |
| **`fromNextSeo`** migration helper           |   ✅   | **`packages/core/src/migrate.ts`**, **`migrate.test.ts`** — maps common next-seo props                                                                           |
| `migrate` codemods (L7)                      |   ⬜   | Not started — Wave 12 stretch                                                                                                                                    |

---

### Wave 2 — OG generator

| Item                                  | Status | Evidence                                                                      |
| ------------------------------------- | :----: | ----------------------------------------------------------------------------- |
| `@better-seo/assets` OG (Satori, tpl) |   ✅   | **`generateOG`**, **`OGConfig`**, light/dark; **`generate-og.test.ts`**       |
| CLI **`og`** (**L2**)                 |   ✅   | **`run-cli*.test.ts`**, **`run-cli.binary.test.ts`**                          |
| README / USAGE / recipe               |   ✅   | **`README.md`**, **`internal-docs/USAGE.md`**, **`docs/recipes/og-wave2.md`** |

**Also shipped:** **`--template`** / compiled **`.js`/`.mjs`** custom OG modules.

---

### Wave 3 — Icons + manifest

| Item                               | Status | Evidence                                              |
| ---------------------------------- | :----: | ----------------------------------------------------- |
| Icon pipeline (Sharp) + faviconICO |   ✅   | **`generate-icons.ts`**, **`generate-icons.test.ts`** |
| **`manifest.json`** (**A3**)       |   ✅   | **`buildWebAppManifest`**, CLI **`icons`**            |
| CLI **`icons`** (**L2**)           |   ✅   | **`run-cli.ts`**, tests                               |
| Docs recipe                        |   ✅   | **`docs/recipes/icons-wave3.md`**                     |

**Deferred:** **`splash`** — **Wave 11**.

---

### Wave 4 — Distribution & polish

| Item                      | Status | Evidence                                                                                                                      |
| ------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------- |
| npm publish / Changesets  |  ✅\*  | Packages publishable under **`@better-seo`** org; **`PACKAGE.md`**, **`.changeset/`**, **`release.yml`** — \*maintainer token |
| Dual ESM/CJS + semver     |   ✅   | **`tsup`**; **`CHANGELOG.md`** + Changesets                                                                                   |
| **size-limit** (core)     |   ✅   | **`npm run ci`** → **`npm run size`**                                                                                         |
| README + visual proof     |   ✅   | Root **README** before/after table; recipes / compare                                                                         |
| **`examples/nextjs-app`** |   ✅   | **`predev`/`prebuild` → `assets`**, E2E                                                                                       |
| **D6** compare            |   ✅   | **`docs/compare/next-seo-vs-better-seo.md`**                                                                                  |
| **D7** extra examples     |   ✅   | **`examples/vanilla-render-tags`**, **`examples/react-seo-vite`**                                                             |

---

### Wave 5 — Adapters + validation

| Item                           | Status | Evidence                                                                                                                             |
| ------------------------------ | :----: | ------------------------------------------------------------------------------------------------------------------------------------ |
| `toHelmetProps`, `useSEO` real |   ✅   | **`packages/react`**: **`toHelmetProps`**, **`BetterSEOHelmet`**, **`SEOProvider`**, **`useSEO`**; **`docs/recipes/react-wave5.md`** |
| `renderTags` complete (C7)     |   ✅   | **`og:url`**, **`og:type`**, multiple **`og:image`** groups; tests **`render.test.ts`**                                              |
| `validateSEO` dev behavior     |   ✅   | **`validate.test.ts`**                                                                                                               |
| Adapter golden tests           |   ✅   | **`packages/next/src/to-next-metadata.golden.test.ts`**; React Helmet parity via **`renderTags`** mapping                            |
| Remix / Astro / Nuxt           |   🟨   | **Docs-only** — **`docs/adapters/future-frameworks.md`** (Roadmap: stub or docs until implemented)                                   |

---

### Waves 6–12 & ongoing

| Wave    | Theme                  | Status | Notes                                                                                                                                      |
| ------- | ---------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 6       | Rules / scale          |   ✅   | **`SEOConfig.rules`**, **`seoRoute`**, **`prepareNextSeoForRoute`**, context **`createSEOForRoute`**, **`seoLayout`/`seoPage`**, N9 recipe |
| 7       | Content compiler       |   🟨   | **`fromMdx`** package (**C17**) + **C16** core; deeper MDX AST / PRD compiler helpers TBD                                                  |
| 8       | Snapshot / preview CLI |   🟨   | **`snapshot`**, **`preview`** (**L5** baseline); **L6** multi-network previews TBD                                                         |
| 9       | TUI, init, doctor      |   🟨   | **Clack TUI**, **`crawl`** note, **`doctor`** (+ **`package.json`**), **`init` / `migrate`** — **L9–L11** / richer **L8** TBD              |
| 10      | add / scan / fix       |   🟨   | **`analyze`** (**L4** baseline); **`add` / `scan` / `fix`** (**L3**) TBD                                                                   |
| 11      | Design system OG       |   🟨   | **`ogPaletteFromTokens`** (**A5**); **`splash`** / advanced OG TBD                                                                         |
| 12      | Crawl + migrate        |   🟨   | Syndication + CLI **`crawl`** subcommands + **`fromNextSeo`**; **hreflang** / codemod **migrate** / **D\*** depth TBD                      |
| Ongoing | Plugins ecosystem      |   ⬜   | **P3/P4**, D8                                                                                                                              |

---

## Quick commands

```bash
npm run check   # format, lint, typecheck, test:coverage, build
npm run ci      # check + E2E (nextjs-app + react-seo-vite) + size-limit
```

---

## Traceability

- **FEATURES ID → wave:** `Roadmap.md` §4
- **Architecture gates:** `Roadmap.md` §5, `ARCHITECTURE.md`

When you complete a wave item, update this file in the same PR (or immediately after) so the sequencing doc stays trustworthy.
