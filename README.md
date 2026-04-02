# better-seo.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Core runtime dependencies](https://img.shields.io/badge/core%20runtime%20deps-0-success?style=flat-square)](./internal-docs/ARCHITECTURE.md)
[![Security](https://img.shields.io/badge/security-audited-success?style=flat-square)](./SECURITY_COMPLETE_SUMMARY.md)
[![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-646CFF?style=flat-square)](./PACKAGE.md)

**CI & quality**

[![CI](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/ci.yml)
[![Commitlint](https://github.com/0xMilord/better-seo-js/actions/workflows/commitlint.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/commitlint.yml)
[![Security workflow](https://github.com/0xMilord/better-seo-js/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/security.yml)
[![Release](https://github.com/0xMilord/better-seo-js/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/0xMilord/better-seo-js/actions/workflows/release.yml)

**Tests & coverage**

[![Vitest](https://img.shields.io/badge/unit%20tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright E2E](https://img.shields.io/badge/E2E-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)](./examples/nextjs-app)
[![Coverage — core](https://img.shields.io/badge/coverage-@better--seo%2Fcore%20≥90%25%20lines-informational?style=flat-square)](./packages/core/README.md#coverage)
[![Coverage — next](https://img.shields.io/badge/coverage-@better--seo%2Fnext%20≥82%25%20lines-informational?style=flat-square)](./packages/next/README.md#coverage)
[![Coverage — assets](https://img.shields.io/badge/coverage-@better--seo%2Fassets%20≥85%25%20lines-informational?style=flat-square)](./packages/better-seo-assets/README.md#coverage)
[![Coverage — cli](https://img.shields.io/badge/coverage-@better--seo%2Fcli%20≥80%25%20lines-informational?style=flat-square)](./packages/better-seo-cli/README.md#coverage)

**One place to describe how a page should look to Google, social apps, and structured-data consumers—then map that description to your framework without inventing five parallel sources of truth.**

This repo is a **monorepo**: the published **`@better-seo/core`** package is the brain (pure data + rules). **`@better-seo/next`** and future adapters are thin translators to Next, Helmet, Remix, and so on. Heavy work (OG image servers, crawlers, CLIs) stays in optional packages so your Edge bundle never pays for it.

---

<p align="center">
  <a href="./internal-docs/USAGE.md"><strong>Usage guide</strong></a> ·
  <a href="./internal-docs/ARCHITECTURE.md"><strong>Architecture</strong></a> ·
  <a href="./internal-docs/FEATURES.md"><strong>Feature catalog</strong></a> ·
  <a href="./internal-docs/Roadmap.md"><strong>Roadmap</strong></a> ·
  <a href="./internal-docs/PROGRESS.md"><strong>Progress tracker</strong></a> ·
  <a href="./CONTRIBUTING.md"><strong>Contributing</strong></a>
</p>

> **Tags:** `seo` · `metadata` · `open-graph` · `json-ld` · `nextjs` · `app-router` · `schema.org` · `structured-data` · `zero-dependency` · `typescript`

---

## In one minute

You describe a page with a small, typed object: title, description, canonical URL, Open Graph hints, Twitter card, and an array of JSON-LD nodes (WebPage, Article, FAQ, custom graphs—your choice). Core turns that into a **canonical `SEO` document**: merged, normalized, ready to serialize.

For **Next.js App Router**, the adapter turns that document into **`Metadata`** for `export const metadata` or `generateMetadata`, and gives you a ready-made **`NextJsonLd`** component so JSON-LD goes through the same **`serializeJSONLD`** path as everything else—not a hand-built string hiding in a template.

```bash
npm install @better-seo/core @better-seo/next
```

Minimal page (copy-paste friendly):

```tsx
// app/page.tsx
import { NextJsonLd } from "@better-seo/next/json-ld"
import { prepareNextSeo } from "@better-seo/next"
import { webPage } from "@better-seo/core"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const { metadata, seo } = prepareNextSeo(
  {
    title: "Example",
    description: "One pipeline for head tags and JSON-LD.",
    canonical: "/",
    schema: [webPage({ name: "Example", description: "Demo.", url: site })],
  },
  { baseUrl: site },
)

export { metadata }

export default function Page() {
  return (
    <main>
      <NextJsonLd seo={seo} />
      <h1>Example</h1>
    </main>
  )
}
```

Even shorter, when you only need metadata and no JSON-LD in the tree:

```ts
import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Hello", description: "World" })
```

A full runnable App Router demo with **Playwright** checks lives in **`examples/nextjs-app`** (`/` and **`/with-seo`** for layout→page merging).

### Optional: OG image generation (Wave 2)

The core stays free of OG renderers. Install **`@better-seo/assets`** in Node/build scripts and call **`generateOG`**, or use **`@better-seo/cli`**:

```bash
npx @better-seo/cli og "Hello World" -o ./og.png --site-name "My site"
```

Built-in **light** and **dark** card templates; **1200×630** PNG. Custom cards: pass **`--template ./my-og.mjs`** (compiled ESM module; props = **`OgCardProps`** from **`@better-seo/assets`**). See **`docs/recipes/og-wave2.md`**.

### Visual proof: assets before → after (Wave 4)

| Surface             | Before                                | After (CLI / library)                                                                                                                                              |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Open Graph**      | Missing or generic preview card       | **`npx @better-seo/cli og "Title" -o ./public/og.png`** → **1200×630** PNG                                                                                         |
| **Favicon / PWA**   | Single `favicon` or hand-copied sizes | **`npx @better-seo/cli icons ./logo.svg -o ./public`** → `favicon.ico`, **16–512** PNGs, **`apple-touch-icon`**, **`maskable-icon`**, optional **`manifest.json`** |
| **Next.js example** | Meta pointed at missing static files  | **`examples/nextjs-app`** runs **`npm run assets`** on **`predev` / `prebuild`** (see that README); E2E fetches **`/og-example.png`** and **`/favicon.ico`**.      |

This repo stays **headless**: we do not ship raster screenshots in git; run the commands above (or open **`examples/nextjs-app`**) to see real output locally or in CI.

---

## Why this shape isn’t arbitrary

SEO work splits naturally into three layers:

1. **Meaning** — what should crawlers and previews infer? (title, description, canonical, hreflang, robots, OG/Twitter, JSON-LD graph.)
2. **Transport** — how does that meaning reach HTML? (Next `Metadata`, `<meta>`, `<script type="application/ld+json">`, or vanilla tag descriptors.)
3. **Operations** — assets, migrations, crawling, CI “doctor” commands. Important, but not something every serverless function should import.

Most teams accidentally merge (2) and (3) into their React tree. **better-seo** keeps (1) in **`@better-seo/core`** with **zero runtime npm dependencies**, pushes (2) into **small adapter packages** that depend on your framework as **their** peers, and leaves (3) to optional packages and CLIs that can use Node APIs freely.

That is how you keep **Edge** and **browser** bundles honest: the core never opens **`fs`**, never reads **`package.json`** at runtime, and never pulls in OG renderers “just because they’re convenient.”

---

## Mental model: from input to HTML

```mermaid
flowchart TB
  subgraph input [What you write]
    A["SEOInput: partial fields + optional schema[]"]
    B["SEOConfig: baseUrl, titleTemplate, plugins, schemaMerge…"]
  end

  subgraph core ["@better-seo/core"]
    C["createSEO / mergeSEO / withSEO"]
    D["Plugins: beforeMerge / afterMerge"]
    E["Canonical SEO document"]
    F["serializeJSONLD(graph)"]
  end

  subgraph next ["@better-seo/next"]
    G["toNextMetadata(seo) → Metadata"]
    H["NextJsonLd → script tag via serializeJSONLD"]
  end

  A --> C
  B --> C
  C --> D
  D --> E
  E --> F
  E --> G
  E --> H
```

**Layered routes (layout + page):** build a **parent** `SEO` with `createSEO`, then merge child-specific input with **`mergeSEO`** or use **`withSEO`** from the Next package to jump straight to **`Metadata`**. Whatever you pass to **`NextJsonLd`** should be the **same merged `SEO`** you used for metadata, so `<title>` and JSON-LD never disagree. Pass the **same `SEOConfig`** into merges when you use **`titleTemplate`**—templates apply during `createSEO`, not inside the stored `SEO` object.

---

## Monorepo map (what lives where)

```mermaid
flowchart LR
  subgraph pkgs [Packages you ship or will ship]
    CORE["@better-seo/core\n0 runtime deps"]
    NEXT["@better-seo/next\npeers: next, react"]
    FUTURE["Future: @better-seo/react,\nremix, astro, …"]
    ASSETS["@better-seo/assets\nOG (Wave 2)"]
    CLI["@better-seo/cli\nog command"]
  end

  CORE --> NEXT
  CORE --> FUTURE
  CLI -.-> ASSETS
```

| Location                           | Role                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **`packages/core`**                | npm **`@better-seo/core`** — overview **[`packages/core/README.md`](./packages/core/README.md)**                    |
| **`packages/next`**                | **`@better-seo/next`** — overview **[`packages/next/README.md`](./packages/next/README.md)**                        |
| **`examples/nextjs-app`**          | Production-shaped **App Router** app; **Playwright** tests guard the golden path.                                   |
| **`packages/better-seo-assets`**   | npm **`@better-seo/assets`** — **[`packages/better-seo-assets/README.md`](./packages/better-seo-assets/README.md)** |
| **`packages/better-seo-cli`**      | npm **`@better-seo/cli`** — **[`packages/better-seo-cli/README.md`](./packages/better-seo-cli/README.md)**          |
| **`examples/vanilla-render-tags`** | **D7** — **`createSEO` + `renderTags`** in plain Node (**no React**).                                               |
| **`docs/recipes/`**                | Copy-paste recipes (e.g. **N5** layout/page merge, **N6** async `generateMetadata`, **OG**).                        |
| **`internal-docs/`**               | PRD, architecture, features, roadmap, **PROGRESS** tracker, **USAGE** (install + error codes).                      |

Dependency rule: **adapters always depend on core; core never depends on adapters.** If you only need JSON-LD in a non-Next stack, you can consume **`@better-seo/core`** and feed `serializeJSONLD` yourself—no Next required.

---

## Core concepts (plain language)

**`SEO` document**  
The normalized output of `createSEO`. Everything downstream reads this shape: meta (title, description, canonical, robots, hreflang map), Open Graph, Twitter card, and `schema` (JSON-LD nodes).

**`SEOInput`**  
The partial object you pass in. You can use top-level `title` / `description` / `canonical` or nest some fields under `meta`; core flattens the conventions for you.

**`SEOConfig`**  
Per-call options: `baseUrl` (turns relative canonicals into absolute URLs), `titleTemplate` (e.g. `%s | Brand`), `plugins`, `schemaMerge: { dedupeByIdAndType: true }` (last wins when the same `@id` + `@type` appears twice), and more over time.

**Single JSON-LD path**  
All structured data that leaves the library for a `<script type="application/ld+json">` tag should go through **`serializeJSONLD`**. Adapters should not concatenate ad hoc JSON strings— that is how you get quoting bugs and XSS-adjacent foot-guns in HTML.

**`SEOError`**  
Typed errors with stable **`code`** values (`VALIDATION`, `ADAPTER_NOT_FOUND`, `MIGRATE_NOT_IMPLEMENTED`, `USE_SEO_NOT_AVAILABLE`). Details and **`isSEOError`** in **[`internal-docs/USAGE.md`](./internal-docs/USAGE.md)**.

---

## Next.js: the pieces you actually import

| You need                           | Import from                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| One-shot **`Metadata`**            | `@better-seo/next` → **`seo(input, config?)`**                                                                      |
| **`Metadata` + `SEO` for JSON-LD** | **`prepareNextSeo`**                                                                                                |
| Layered metadata                   | **`withSEO(parent, child, config?)`** — use the **same `config`** as `createSEO` if you rely on **`titleTemplate`** |
| JSON-LD in JSX                     | **`@better-seo/next/json-ld`** → **`NextJsonLd`**                                                                   |
| Low-level mapping                  | **`toNextMetadata`** from `@better-seo/next` (tests and advanced use)                                               |

**`useSEO` today:** the hook is a **stub** that throws with a clear code until **`@better-seo/react`** lands; App Router projects should prefer **`metadata` / `generateMetadata`**.

---

## JSON-LD helpers

Core ships small builders—**`webPage`**, **`article`**, **`organization`**, **`person`**, **`product`**, **`breadcrumbList`**, **`faqPage`**—plus **`customSchema`** for escape hatches. Each helper sets `@context` and `@type` correctly so your graph is boring and predictable.

---

## Development & quality (this repo)

From the repository root:

```bash
npm run check    # build, format, lint, typecheck, unit coverage
npm run ci       # check + Playwright e2e + core size-limit
```

### CI pipelines ([`.github/workflows`](./.github/workflows))

| Workflow                                                   | When it runs        | What it gates                                                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`ci.yml`](./.github/workflows/ci.yml)**                 | PR + push to `main` | `npm audit` (artifact), **`npm run check`** (build, format, lint, typecheck, **Vitest + coverage thresholds**), Playwright **`examples/nextjs-app`**, **`npm run size`** on `@better-seo/core` |
| **[`commitlint.yml`](./.github/workflows/commitlint.yml)** | Pull requests       | Conventional Commits on every commit in the PR                                                                                                                                                 |
| **[`security.yml`](./.github/workflows/security.yml)**     | Push to `main`      | Security / supply-chain checks (see workflow)                                                                                                                                                  |
| **[`release.yml`](./.github/workflows/release.yml)**       | Maintainers         | Changesets versioning / publish when configured                                                                                                                                                |

Coverage **LCov** is uploaded from **`@better-seo/core`** and **`@better-seo/next`** as CI artifacts (`coverage`); thresholds are enforced in each package’s **`vitest.config.ts`** (see per-package READMEs below).

### Package test & coverage targets

| Package                  | README                                                                 | Unit tests         | Coverage focus (minimum lines / branches)  |
| ------------------------ | ---------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| **`@better-seo/core`**   | [`packages/core`](./packages/core/README.md)                           | Vitest             | **90%** / **80%** (see package README)     |
| **`@better-seo/next`**   | [`packages/next`](./packages/next/README.md)                           | Vitest             | **82%** / **72%** on `to-next-metadata.ts` |
| **`@better-seo/assets`** | [`packages/better-seo-assets`](./packages/better-seo-assets/README.md) | Vitest             | **85%** / **75%**                          |
| **`@better-seo/cli`**    | [`packages/better-seo-cli`](./packages/better-seo-cli/README.md)       | Vitest + bin smoke | **80%** / **65%**                          |

Core has a **size budget** (see **`packages/core/package.json`** and `npm run size`). E2E lives under **`examples/nextjs-app/e2e`**.

---

## Documentation index

| Doc                                                                                      | Purpose                                                        |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **[`internal-docs/USAGE.md`](./internal-docs/USAGE.md)**                                 | Install, Next patterns, **`SEOError`**, **`withSEO` + config** |
| **[`internal-docs/ARCHITECTURE.md`](./internal-docs/ARCHITECTURE.md)**                   | Boundaries, package topology, serializer rule, Edge safety     |
| **[`internal-docs/FEATURES.md`](./internal-docs/FEATURES.md)**                           | Feature IDs and quality bar                                    |
| **[`internal-docs/Roadmap.md`](./internal-docs/Roadmap.md)**                             | Waves and traceability to FEATURES                             |
| **[`internal-docs/PROGRESS.md`](./internal-docs/PROGRESS.md)**                           | What is done vs in flight vs not started                       |
| **[`internal-docs/PRD.md`](./internal-docs/PRD.md)**                                     | Product intent and scope                                       |
| **[`docs/compare/next-seo-vs-better-seo.md`](./docs/compare/next-seo-vs-better-seo.md)** | Compare stub (**D6**, Wave 4)                                  |
| **[`PACKAGE.md`](./PACKAGE.md)**                                                         | Releases, Changesets, publishing                               |

---

## Contributing & license

See **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** and **[`SECURITY.md`](./SECURITY.md)**.  
Licensed under **MIT** — **[`LICENSE`](./LICENSE)**.

---

**Summary:** treat **`@better-seo/core`** as the source of truth for SEO _meaning_, let adapters handle framework _transport_, and keep heavy operational tooling out of the hot path. That is the whole trick—and it stays “plug and play” because **`prepareNextSeo`** and **`seo`** give you a working Next integration in a handful of lines without locking you out of merges, plugins, or structured data later.
