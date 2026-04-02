# better-seo.js — Product Requirements Document

> **A programmable SEO engine for modern apps — not just tags, but structured discoverability.**

**Expanded Vision:**

> **SEO + Discovery Surface Automation for modern apps**

You're not just optimizing for Google. You're optimizing for:

- Google Search
- Twitter/X previews
- LinkedIn shares
- Slack previews
- PWA installs
- Every surface where your app is discovered

---

### Document convention

This file is the **single source of truth for product intent and system architecture**. It does **not** carry revision history (no PRD “version” labels or changelog tables here). **Package releases** use semver only in `package.json` and `CHANGELOG.md`. **Feature catalog:** [`FEATURES.md`](./FEATURES.md). **Roadmap / waves ↔ features:** [`Roadmap.md`](./Roadmap.md). **System boundaries:** [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 0. The "Voilà" Principle (Read This First)

> **Time-to-value = everything**

If a dev can't go from _install → working SEO on a page_ in under **60 seconds**, they will uninstall and crawl back to whatever they were using.

### The 60-Second Benchmark

```bash
npm install @better-seo/core @better-seo/next
```

```ts
// app/page.tsx (Next.js App Router)
import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Home" })
```

**It must just work.** (`@better-seo/core` is the zero-dep engine; **`@better-seo/next`** registers the adapter and exports the **`seo()`** voilà for `Metadata`.)

No config ceremony. No mental overhead. No "where does this go?"

---

### The 3 Levels of Effort (Same API, Different Depth)

| Level         | Code                                                                                          | Use Case                                                                      |
| ------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 🟢 **Lazy**   | `export const metadata = seo({ title: "…" })` with optional `@better-seo/core/node` inference | Defaults from env + **package.json** (Node); explicit title still recommended |
| 🟡 **Normal** | `export const metadata = seo({ title: "Dashboard" })`                                         | Override title                                                                |
| 🔴 **Power**  | `export const metadata = seo({ meta: {...}, openGraph: {...}, schema: [...] })`               | Full control                                                                  |

---

### The Real Product

You're not building:

> "SEO config system"

You're building:

> **"Attach SEO to any page in seconds, and improve it over time."**

Everything else is retention. This is acquisition.

---

## 1. Executive Summary

### 1.1 Problem Statement

Current SEO solutions for React/Next.js fall into two categories:

| Solution                 | Problem                                                       |
| ------------------------ | ------------------------------------------------------------- |
| **next-seo**             | Static config mindset, no system thinking, zero feedback loop |
| **React Helmet**         | Manual everything, no abstraction, caveman SEO                |
| **Next.js Metadata API** | Low-level primitive, no schema system, just a rendering layer |

**Result:** Developers have helpers, not infrastructure. No unified model. No extensibility.

---

### 1.2 Solution

**better-seo.js** is a **unified SEO document model** that:

- Normalizes SEO into a single source of truth
- Renders to multiple outputs (React, Next.js, vanilla)
- Treats structured data (JSON-LD) as a core primitive, not an add-on
- Provides fallback logic and cross-layer consistency out of the box

---

### 1.3 Positioning

> **Next SEO, but actually complete.**

Target audience: Next.js/React developers building production apps who need complete SEO coverage without boilerplate.

---

### 1.4 Enterprise & ecosystem scope

**better-seo.js** is designed as **infrastructure**, not a page-level helper: the same core model must serve **startups and regulated enterprises**, **single-tenant and multi-tenant** layouts, and **multiple runtimes** (Node server, Edge, static export).

| pillar                 | what it means                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js first**      | The reference integration is **Next.js App Router** (`Metadata`, `generateMetadata`, layouts). Pages Router and route handlers are first-class in the **adapter** layer, not afterthoughts. |
| **Framework breadth**  | **React** (Vite, CRA-style), **Remix**, **Astro**, **Nuxt**, and **vanilla** outputs share one **pure core**; each framework gets a thin **adapter package** and documented “golden path.”  |
| **Industry templates** | Blog, docs, SaaS, commerce, and portfolio templates encode **defaults + rules + schema presets** so teams reuse patterns instead of one-off config.                                         |
| **Operational rigor**  | **Typed public API**, **tests (unit + adapter + E2E)**, **CI-friendly CLI** (`--no-interactive`, exit codes), **safe defaults** for serialization and merging.                              |
| **Extensibility**      | **Plugins and hooks** (build/merge/render lifecycle) and a **registerAdapter** API so behavior is **explicit** where magic would break in monorepos or Edge.                                |

**Rollout strategy:** ship and harden **Next.js** end-to-end first (core + `@better-seo/next` + `examples/nextjs-app` + E2E), then apply the same **adapter contract** to other frameworks without changing the SEO document model.

---

## 2. Product Goals

### 2.1 Primary Goals

| Goal                      | Success Metric                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Complete SEO coverage** | Supports meta, OG, Twitter, JSON-LD in one object                                                          |
| **Zero configuration**    | Works with inferred defaults from `package.json` + env                                                     |
| **Framework agnostic**    | Core engine + adapter pattern (React, Next.js, vanilla)                                                    |
| **Extensible by design**  | Supports any schema.org type without library updates; plugins extend channels and lifecycle                |
| **60-second voila**       | Install → working SEO in under 60 seconds                                                                  |
| **Enterprise-ready**      | Request-scoped config, safe JSON-LD embedding, optional dedup, crawl/syndication modules, E2E verification |

### 2.2 Non-Goals

| Non-Goal               | Rationale                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| Analytics/tracking     | Post-facto observation, not build-time SEO document construction |
| Auto-written page copy | Headless SEO model only; no generative content product in-repo   |
| Visual marketing UI    | Headless engine; previews are **debug/CLI**, not a CMS           |

**Note:** **Sitemaps, robots.txt, and RSS/Atom** are **in scope** as optional **modules** (`@better-seo/crawl` or documented route recipes) so crawl/index behavior stays aligned with the same `SEO` model and `baseUrl` — they are not “someone else’s problem” at the infra layer.

### 2.3 Product Pyramid (Priority Order)

| Level                     | Feature                        | Purpose              |
| ------------------------- | ------------------------------ | -------------------- |
| **Level 1 (Acquisition)** | `seo({ title })`               | Get them in the door |
| **Level 2 (Trust)**       | merge + defaults + correctness | Keep them confident  |
| **Level 3 (Delight)**     | OG + icons generator           | Make them say "wow"  |
| **Level 4 (Power)**       | CLI automation                 | Lock them in         |

**Critical:** Ship Level 1 before Level 4. Most teams build backwards and die.

### 2.4 Framework matrix (adapters)

Adapters implement one **contract**: _normalized `SEO` in → framework-native head/metadata out_. **Runtime auto-detection** is a **convenience default** only; **production and enterprise setups** should pass **`adapter`** explicitly or import from **`@better-seo/<framework>`**.

| Priority | Framework                  | Package / entry     | Notes                                                             |
| -------- | -------------------------- | ------------------- | ----------------------------------------------------------------- |
| P0       | **Next.js (App Router)**   | `@better-seo/next`  | Reference implementation; `Metadata`, layouts, `generateMetadata` |
| P0       | **Next.js (Pages Router)** | `@better-seo/next`  | Shared package; pages `Head` / `_app` patterns documented         |
| P1       | **React (SPA / Vite)**     | `@better-seo/react` | `react-helmet-async` or native head per recipe                    |
| P1       | **Remix**                  | `@better-seo/remix` | `meta` / `links` exports                                          |
| P2       | **Astro**                  | `@better-seo/astro` | Frontmatter + layout integration                                  |
| P2       | **Nuxt**                   | `@better-seo/nuxt`  | Module + `useHead` bridge                                         |
| —        | **Vanilla / custom**       | `@better-seo/core`  | `renderTags()`, JSON-LD strings                                   |

### 2.5 Industry presets (templates)

Templates are **reusable bundles**: default `SEOConfig`, **SEORule** sets, schema presets (e.g. `SoftwareApplication` for SaaS), OG/icon defaults, and CLI `init` flows. They **do not** fork the core; they **compose** public APIs.

| Template         | Primary schema emphasis                          | Typical rules                 |
| ---------------- | ------------------------------------------------ | ----------------------------- |
| **Blog / media** | `Article`, `Person`, `BreadcrumbList`            | `/posts/*` → article OG type  |
| **Docs**         | `TechArticle`, `BreadcrumbList`, `FAQPage`       | Drafts → `noindex`            |
| **SaaS**         | `SoftwareApplication`, `Organization`, `FAQPage` | Marketing vs app shell splits |
| **E-commerce**   | `Product`, `Offer`, `Review`, `BreadcrumbList`   | Product listing vs PDP        |
| **Portfolio**    | `Person`, `CreativeWork`, `ImageObject`          | Case study routes             |

### 2.6 Adoption-first strategy & commercial posture

**Principle:** the product wins on **unavoidability** (default, low-friction behavior at the moment devs are tired of the alternative)—not on an early **pricing framework**. Monetization is deferred until **pain at scale** appears; **adoption and dependence** come first.

#### How winning dev tools actually compound

1. **Become the default, not the mythic “best.”** Distribution follows **removing friction** at the decision point (e.g. “I just need this to work on this page”), not perfection on every axis.
2. **Give away the obvious value.** Installing, experimenting, and **basic usage** must feel **free and instant** so the internal monologue is only: _“I’ll just try it.”_ That doorway is the whole acquisition funnel.
3. **Charge when pain appears.** Revenue aligns with **scale**, **team coordination**, and **infra criticality**—not with cloning the README into an invoice.

#### Translate this to better-seo.js

| Stage      | User thought                     | Product move                                                                                                      |
| ---------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Try**    | “Let me test this.”              | **Free**, zero ceremony (§0).                                                                                     |
| **Use**    | “This is nicer than what I had.” | **Still free**; depth optional (merge, schema, assets).                                                           |
| **Depend** | “We rely on this in the app.”    | Introduce **optional** paid/hosted surfaces only when clearly incremental (see below).                            |
| **Scale**  | “This is production-critical.”   | **Charge** for things that map to cost + governance (hosted rendering, org features, SLA)—not for `seo()` itself. |

#### Free tier (must be insanely good)

Ship excellence without a paywall on the **evaluable** path:

- **`seo()`**, **`createSEO` / `mergeSEO`**, schema helpers, adapters (especially **Next**).
- **Local** OG generation and icons CLI (or clearly free tiers of those flows).
- Docs and examples that make the above **one copy-paste** away.

**Goal:** installs, GitHub stars, and **“oh this saves me time”**—not a pricing conversation on day one.

#### Paid surfaces (later, not now)

Only after organic **dependence** is credible, consider paid offers that sit **beside** the open core—for example:

- **Hosted** OG / asset generation (compute + caching you pay for).
- **Dashboard** / team workflows (optional product layer).
- **Enterprise** packaging (support, SLAs, not “JSON-LD tax”).

**Rule:** if a **solo dev** won’t adopt the core **for free**, a **company** won’t pay later.

#### Immediate sequencing (non-negotiable)

1. **`export const metadata = seo({ title: "Home" })`** works **immediately** on the golden Next.js path.
2. **`npx better-seo og "Hello World"`** produces a **visibly great** asset (demo shock).
3. **Usage spreads** via docs, examples, and CLI—still no monetization homework.
4. **Months later:** optional hosted / team layers, only if (1)–(3) are already true.

#### Single gate

> **Would a dev switch to this _today_ for the free path?**

If **no**, pricing is irrelevant. If **yes**, monetization can stay boring until scale hurts.

**Order of operations:** **product → usage → dependence → monetization**—never the reverse.

---

## 3. Technical Architecture

### 3.1 Core Abstraction: The SEO Object

```ts
type SEO = {
  meta: {
    title: string
    description?: string
    canonical?: string
    robots?: string

    // Link relations
    alternates?: {
      languages?: Record<string, string> // hreflang: { "en-US": "/en/page", "es-ES": "/es/page" }
      canonical?: string
    }

    pagination?: {
      prev?: string
      next?: string
    }

    verification?: {
      google?: string
      bing?: string
      yandex?: string
      pinterest?: string
      facebook?: string
    }
  }

  openGraph?: {
    title?: string
    description?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
    type?: "website" | "article" | "product" | "video" | "music" | "book"
    url?: string
    siteName?: string
    locale?: string
  }

  twitter?: {
    card?: "summary" | "summary_large_image"
    title?: string
    description?: string
    image?: string
    site?: string
    creator?: string
  }

  schema?: JSONLD[]
}
```

**Design rationale:**

- Three channels: Search, Social, Structured
- Each channel is optional except `meta.title`
- Flat structure, no nested builders
- Link relations for i18n/enterprise
- OG images as array for platform consistency
- Verification tags to prevent leakage to native APIs

---

### 3.2 JSON-LD System

#### Base types (strict public surface)

The public API must **not** expose `any`. Arbitrary schema.org shapes use a **recursive JSON-safe value** type; unknown third-party payloads can be narrowed at integration boundaries.

```ts
/** JSON-serializable values allowed inside JSON-LD (public API). */
type JSONLDValue =
  | string
  | number
  | boolean
  | null
  | JSONLDValue[]
  | { readonly [key: string]: JSONLDValue }

/** One node in a JSON-LD graph. */
type JSONLD = Readonly<{
  "@context": "https://schema.org"
  "@type": string
}> &
  Readonly<{ [key: string]: JSONLDValue | undefined }>
```

#### Schema helpers (shipped with core)

Helpers return **validated** nodes (required `@context` / `@type`); they accept `Partial<...>`-style input for ergonomics and normalize missing fields.

```ts
WebPage(data: Partial<JSONLD>): JSONLD
Article(data: Partial<JSONLD>): JSONLD
Product(data: Partial<JSONLD>): JSONLD
Organization(data: Partial<JSONLD>): JSONLD
Person(data: Partial<JSONLD>): JSONLD
BreadcrumbList(data: Partial<JSONLD>): JSONLD
FAQPage(data: Partial<JSONLD>): JSONLD
```

#### Custom Schema Support

```ts
CustomSchema({ "@type": "Dataset", ...data }): JSONLD
```

**Design rationale:**

- Cover 80% of use cases with helpers
- Allow 20% edge cases via escape hatch (`CustomSchema`) without forking types
- No need to update the library for new schema.org `@type` values

#### Security & embedding (production requirement)

- **Never** interpolate untrusted strings into raw `<script>` tags without **JSON.stringify** on the **whole** graph (or a hardened serializer). A `U+2028` / `U+2029` or premature `</script>` in user content can break markup.
- Core provides **`serializeJSONLD(graph: JSONLD | JSONLD[]): string`** (or adapter-level equivalent) that applies **safe JSON serialization** suitable for `application/ld+json`. Adapters must use this path, not ad-hoc string concat.
- CMS-driven fields (titles, descriptions, reviews) are **untrusted input** for HTML context; treat them like any other escaped text in tags.

---

### 3.3 Builder Engine

```ts
function createSEO(input: Partial<SEO>, config: SEOConfig): SEO

type SEOConfig = {
  defaultTitle: string
  description?: string
  baseUrl?: string
  defaultImage?: string

  // Title composition
  titleTemplate?: string // "%s | Site Name" or "%s - Site Name"

  // Default robots
  defaultRobots?: string

  /** How child + parent schema arrays combine (enterprise). */
  schemaMerge?: "concat" | "dedupeByIdAndType" // default: "concat"
}
```

**Fallback logic:**

- `openGraph.title` → `meta.title`
- `twitter.image` → `openGraph.images[0]?.url`
- `canonical` → `baseUrl + path`
- `robots` → `config.defaultRobots ?? "index,follow"`
- `title` → apply `titleTemplate` if provided

---

### 3.4 Merge Strategy (Layout + Page Composition)

```ts
function mergeSEO(parent: SEO, child: Partial<SEO>, config?: Pick<SEOConfig, "schemaMerge">): SEO
```

**Merge rules:**
| Field | Strategy |
|-------|----------|
| `meta.title` | Child overrides |
| `meta.description` | Child overrides |
| `meta.alternates.languages` | Deep merge (including `x-default` when provided) |
| `openGraph.images` | Child overrides (full array replace) |
| `schema` | Default: **concatenate** in order (parent → rules → child). Optional **`dedupeByIdAndType`**: keep last occurrence per stable `@id` + `@type` pair when `@id` present; otherwise concat |
| All other scalars | Child overrides |

**Enterprise note:** Duplicate `FAQPage` / `Product` nodes in the same URL commonly **hurt** rich-result eligibility. Prefer **`dedupeByIdAndType`** for tenant-wide Organization / WebSite `@id` injection from plugins.

**Use case:**

```ts
// layout.tsx
const layoutSEO = createSEO(
  {
    meta: { title: "Home" },
  },
  config,
)

// page.tsx
const pageSEO = mergeSEO(layoutSEO, {
  meta: { title: "About" }, // Final: "About | Site Name"
})
```

---

### 3.5 Dev Warnings & Validation (Lightweight)

```ts
// Optional dev-only warnings (stripped in production)
function validateSEO(seo: SEO, config: ValidationConfig): ValidationError[]

type ValidationConfig = {
  enableWarnings?: boolean // default: true in dev
  titleMaxLength?: number // default: 60
  descriptionMaxLength?: number // default: 160
  requireDescription?: boolean // default: false
}

type ValidationError = {
  field: string
  message: string
  severity: "warning" | "error"
}
```

**Built-in checks:**
| Check | Trigger |
|-------|---------|
| Title length | `title.length > 60` |
| Description length | `description.length > 160` |
| Missing description | `!description` (if enabled) |
| OG image dimensions | `image.width < 1200` (warning) |
| Schema required fields | Missing `@type`, `@context` |

**Design rationale:**

- Zero runtime cost (dev-only)
- Catches common mistakes before production
- Doesn't block, just warns

---

### 3.6 Adapters

| Adapter     | Output                                            |
| ----------- | ------------------------------------------------- |
| **Next.js** | `Metadata` object for `generateMetadata()`        |
| **React**   | `<Helmet>` component props                        |
| **Vanilla** | Array of `{ type, content }` for manual injection |

#### Platform & runtime matrix (enterprise)

| Surface                         | Config inference (`package.json`, env)             | Recommended integration                             |
| ------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| **Node (SSR / server builds)**  | Full inference supported                           | `initSEO()` / `createSEOContext()`                  |
| **Edge (Middleware / Workers)** | **No** filesystem reads; pass explicit `SEOConfig` | `createSEOContext(envConfig)` per request           |
| **Browser-only**                | No `process.env` / file reads                      | Explicit config or injected `window.__SEO_CONFIG__` |
| **CI / CLI**                    | Full inference + `--no-interactive`                | Same as Node                                        |

**Rule:** anything that **`readFileSync`'s** the repo is **CLI-only** or **build-time** — never a hard dependency of the **5KB core** in Edge bundles.

#### Adapter registry (explicit over magic)

```ts
// Core exposes registration for adapters and plugins (exact shape TBD in implementation).
registerAdapter(id: "next-app" | "next-pages" | "react" | "vanilla" | string, impl: SEOAdapter): void
```

Consumers should **`registerAdapter`** in app bootstrap or import **`@better-seo/next`** which self-registers. **Optional** `detectFramework()` may call **`getDefaultAdapter()`** only when no adapter is registered — documented as **dev convenience**, not a guarantee in monorepos.

#### Extensibility: plugins & lifecycle hooks (“better-auth–class”)

Plugins are **pure functions** that extend the engine without forking core. Minimum lifecycle:

| Hook             | When                         | Use                                                                            |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `beforeMerge`    | Rules + layout + page merged | Strip tracking params from URLs, normalize trailing slashes, inject `@baseUrl` |
| `afterMerge`     | Final `SEO` before adapters  | Enforce tenant `Organization` `@id`, default `WebSite`, locale fallbacks       |
| `onRenderTags`   | Vanilla / string paths       | Extra `<link rel="alternate">`, `dns-prefetch`, `preconnect`                   |
| `extendChannels` | Future meta namespaces       | New preview surfaces (e.g. additional `meta` keys) without breaking types      |

Plugins ship as **`better-seo-plugin-*`** or in-app **`defineSEOPlugin({ id, ... })`**. **Capability flags** in config (`features: { jsonLd: true, ... }`) let hosts pin behavior across versions.

```ts
// Illustrative — exact signatures finalized during implementation
interface SEOPlugin {
  id: string
  beforeMerge?: (ctx: {
    route?: string
    acc: Partial<SEO>
    next: Partial<SEO>
  }) => Partial<SEO> | void
  afterMerge?: (ctx: { seo: SEO }) => SEO | void
}
```

#### Crawl, robots, and syndication (optional module)

**Package:** `@better-seo/crawl` (optional; shares types with core)

| Capability      | Description                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| **robots.txt**  | Build static or dynamic robots from config (sitemap URLs, `Allow` / `Disallow`, crawl-delay hints where allowed) |
| **sitemap.xml** | Generate from route manifest or user-supplied URL list; honors `lastmod`, `hreflang` alternates when available   |
| **RSS / Atom**  | Feeds for blog/docs templates; same canonical URLs as `meta.canonical`                                           |
| **llms.txt**    | Optional static generator for AI discovery surfaces (simple text index linking to public URLs)                   |

The **SEO document model** remains the authority for **titles, descriptions, and URLs**; crawl outputs **derive** from it to avoid drift.

---

### 3.7 Asset Generation Engine (Separate Module)

**Package:** `@better-seo/assets` (optional install)

```ts
// Keep separate from core to maintain 5KB bundle
import { generateOG, generateIcons, generateManifest } from "@better-seo/assets"
```

#### OG Image Generator

```ts
type OGConfig = {
  title: string
  description?: string
  siteName: string
  logo?: string
  theme?: "light" | "dark" | "auto"
  font?: string
  template?: string // Custom template path
  colors?: {
    // Auto-extracted from Tailwind config
    primary: string
    background: string
  }
}

function generateOG(config: OGConfig): Promise<Buffer>
```

**Modes:**
| Mode | Description |
|------|-------------|
| `auto` | Reads SEO object, generates clean card |
| `template` | Uses custom Satori/React template |
| `design-system` | Extracts colors/fonts from Tailwind config |

---

#### Icon & PWA Generator

```bash
npx better-seo icons ./logo.svg --output /public
```

**Outputs:**

```txt
/public
  favicon.ico
  icon-16.png
  icon-32.png
  icon-192.png
  icon-512.png
  apple-touch-icon.png
  maskable-icon.png
  manifest.json
```

**Config:**

```ts
type IconConfig = {
  source: string // Path to source logo
  output: string // Output directory
  sizes?: number[] // Default: [16, 32, 192, 512]
  backgroundColor?: string
  manifest?: {
    name: string
    shortName: string
    startUrl: string
    display: "standalone" | "minimal-ui" | "browser"
  }
}
```

---

#### Splash Screen Generator

```bash
npx better-seo splash --logo ./logo.svg --theme dark
```

**Outputs:**

- iOS launch images (multiple sizes)
- Android splash screens
- PWA splash assets

**Config:**

```ts
type SplashConfig = {
  logo: string
  backgroundColor: string
  theme?: "light" | "dark"
  platforms?: ("ios" | "android")[]
}
```

---

### 3.8 File Structure

```
better-seo.js/
  core/
    types.ts        ← SEO + JSONLD types
    core.ts         ← createSEO(), mergeSEO()
    schema.ts       ← helpers (WebPage, Article, etc.)
    adapters.ts     ← adapter registry + default bindings
    plugins.ts      ← defineSEOPlugin(), hook runner
    context.ts      ← createSEOContext() (request-scoped config)
    render.ts       ← schema injection, tag serialization
    validate.ts     ← dev warnings & validation
    migrate.ts      ← migration utilities (fromNextSeo)
    voila.ts        ← Quick attach API (seo(), withSEO(), useSEO())
    singleton.ts    ← process-wide initSEO (Node convenience)
    compiler.ts     ← fromContent, fromMDX
    index.ts        ← public API

packages/@better-seo/next/   ← Next.js adapter (reference)
packages/@better-seo/react/  ← React / Vite
examples/nextjs-app/         ← Golden-path app + Playwright E2E

packages/better-seo-crawl/   ← npm: @better-seo/crawl; sitemap, robots, RSS, llms.txt
  sitemap.ts
  robots.ts
  rss.ts
  index.ts

better-seo-assets/
  og/
    generator.ts    ← OG image generation
    templates.ts    ← Built-in templates
  icons/
    generator.ts    ← Icon resizing + output
    manifest.ts     ← manifest.json generation
  splash/
    generator.ts    ← Splash screen generation
  index.ts

better-seo-cli/
  core/
    tui.ts          ← TUI components (select, input, progress)
    theme.ts        ← CLI theme/styling
  commands/
    init.ts         ← Interactive setup wizard
    og.ts
    icons.ts
    splash.ts
    analyze.ts
    add.ts          ← Auto-inject SEO into pages
    scan.ts         ← Scan & fix
    snapshot.ts     ← Time-travel debugging
    preview.ts      ← Platform previews
    migrate.ts      ← Codemods for upgrades
    doctor.ts       ← CI health checks (config + adapters)
  templates/
    nextjs/
      blog.ts       ← Blog SEO templates
      docs.ts       ← Documentation templates
      saas.ts       ← SaaS templates
      ecommerce.ts  ← E-commerce templates
    react/
      blog.ts
      saas.ts
    astro/
      blog.ts
    remix/
      blog.ts
  index.ts
```

**Design rationale:**

- Core stays lightweight (~5KB)
- Assets are optional (opt-in install)
- CLI orchestrates both with sleek TUI
- Templates provide opinionated starting points
- Voilà API is the "fast path" for adoption
- No dependency hell

---

### 3.9 Internal Design Requirements (For "Voilà" to Work)

To support the 60-second experience:

#### 1. Zero-Config Mode (True Zero) + Request-Scoped Context (Enterprise)

**Dual path:** keep the **60-second** story for solo devs, and give enterprises **no hidden globals** on the server.

```ts
// singleton.ts — Node / local dev convenience ONLY
let globalConfig: SEOConfig | null = null

export function initSEO(
  config?: Partial<SEOConfig> & { rules?: SEORule[]; plugins?: SEOPlugin[] },
) {
  globalConfig = {
    defaultTitle: config?.defaultTitle ?? inferFromPackageJson(),
    baseUrl: config?.baseUrl ?? inferFromEnv(),
    titleTemplate: config?.titleTemplate ?? "%s",
    ...config,
  }
}

// context.ts — preferred for SSR, multi-tenant, tests, Edge
export function createSEOContext(config: SEOConfig & { rules?: SEORule[]; plugins?: SEOPlugin[] }) {
  return {
    seo: (input: Partial<SEO> = {}, options?: { adapter?: string }) =>
      renderVoila(input, config, options),
    merge: (parent: SEO, child: Partial<SEO>) => mergeSEO(parent, child, config),
    create: (input: Partial<SEO>) => createSEO(input, config),
  }
}
```

_`renderVoila` stands in for the internal pipeline (`applyRules` → `createSEO` → hooks → `renderForAdapter`); final export names may differ._

```ts
function inferFromPackageJson(): string {
  // Reads package.json → name field
  // Falls back to "My App"
}

function inferFromEnv(): string {
  // Reads process.env.NEXT_PUBLIC_SITE_URL
  // Or process.env.VERCEL_URL
  // Falls back to "http://localhost:3000"
}

// Usage: NO config needed for basic usage (global path)
import { seo } from "@better-seo/core"
export const metadata = seo({ title: "Home" }) // Just works when initSEO ran or inference is allowed
```

**Design rationale:** Globals are acceptable for **DX** on the happy path; **`createSEOContext`** prevents **cross-request leakage**, makes **tests deterministic**, and matches **Edge** constraints when combined with explicit config.

**Design rationale (adoption):** If you force config upfront for the first run, you lose evaluators — so **inference stays opt-out** on Node, not on Edge.

---

#### 2. Smart Defaults

| Input          | Auto-Inferred                                |
| -------------- | -------------------------------------------- |
| No title       | From route path (`/dashboard` → "Dashboard") |
| No OG          | From `defaultImage` in config                |
| No schema      | Empty array (no error)                       |
| No description | From config fallback                         |
| No config      | From `package.json` + env                    |

---

#### 3. Adapter Auto-Binding (With Escape Hatch)

```ts
// voila.ts
export function seo(
  input: Partial<SEO> = {},
  options?: { adapter?: "next-app" | "next-pages" | "react" | "vanilla" },
): Metadata {
  const config = getGlobalConfig()
  const seoObject = createSEO(input, config)

  // Prefer explicit adapter; optional detect only as fallback (document limitations)
  const adapter = options?.adapter ?? getRegisteredAdapter() ?? detectFramework()

  return renderForAdapter(seoObject, adapter)
}

function detectFramework(): string {
  // Heuristic checks (next.config, vite.config, etc.) — MAY WRONG in monorepos
  // Fallback to vanilla
}
```

**Design rationale:** **Explicit adapters** win in production; **detection** is a **dev shortcut** and must be documented as **best-effort** (see §2.4).

---

#### 4. CLI File Injection (Idempotent + Safe)

```ts
// commands/add.ts
async function addSEOToPage(
  route: string,
  options: {
    dryRun?: boolean
    safe?: boolean
    interactive?: boolean
  },
) {
  const filePath = findPageFile(route)
  const existingContent = readFile(filePath)

  // Idempotency: prefer AST / framework-specific detectors (generateMetadata, metadata export, Helmet)
  if (await fileAlreadyHasSEOHooks(filePath, { framework: detectedFramework })) {
    console.log("SEO already present in", filePath)
    return
  }
  // Fallback heuristic only when AST path unavailable — document false +/- rates in CLI docs

  const injectCode = `
import { seo } from '@better-seo/core'
export const metadata = seo({ title: "${capitalize(route)}" })
`

  if (options.dryRun) {
    console.log("Would inject:")
    console.log(injectCode)
    return
  }

  if (options.safe || options.interactive) {
    const confirmed = await prompt("Inject SEO into " + filePath + "?")
    if (!confirmed) return
  }

  injectIntoFile(filePath, injectCode)
}
```

**CLI Flags:**
| Flag | Purpose |
|------|---------|
| `--dry-run` | Show what would change, don't modify |
| `--safe` | Skip files that already have SEO |
| `--interactive` | Prompt before each change |

**Design rationale:** Devs hate tools that "touch my code randomly". Trust = zero without escape hatches.

---

#### 5. Scan & Fix Logic (Idempotent)

```ts
// commands/scan.ts
async function scanForMissingSEO() {
  const pages = findAllPages()
  const missing = []

  for (const page of pages) {
    if (await fileAlreadyHasSEOHooks(page, { framework: detectedFramework })) {
      continue
    }
    missing.push(page)
  }

  return missing
}

async function fixMissingSEO(
  pages: string[],
  options: {
    dryRun?: boolean
    interactive?: boolean
  },
) {
  for (const page of pages) {
    await addSEOToPage(page, options)
  }
}
```

**Design rationale:** Running `fix` twice should not duplicate metadata or break imports.

---

#### 6. Asset Escape Hatches

```ts
// better-seo.config.ts
export default defineSEO({
  meta: { title: "My App" },

  // Disable specific asset generators
  og: false, // or { disable: true }
  icons: false,
  splash: false,

  // Or configure
  og: {
    source: "auto",
    theme: "dark",
  },
})
```

**Design rationale:** Automation becomes lock-in without escape hatches.

---

#### 7. Release discipline & migrations

**npm packages** follow **strict semver**; **breaking changes** ship with **`CHANGELOG.md` entries** and, when possible, a **`npx better-seo migrate`** codemod. This PRD does not track release numbers — only **contracts** (types, adapter surfaces, hook shapes).

```bash
npx better-seo migrate   # Applies codemods for supported upgrades
```

**Design rationale:** Teams version **SEO as code**; predictable semver + codemods reduce production regressions.

---

#### 8. SEO Snapshots (Time-Travel + Debugging)

```ts
// commands/snapshot.ts
async function snapshot(
  route?: string,
  options?: {
    compare?: boolean // Compare with previous snapshot
    output?: string // Custom output directory
  },
) {
  const seo = createSEO(input, config)
  const snapshotData = {
    route,
    meta: seo.meta,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
    schema: seo.schema,
    rendered: renderTags(seo),
    timestamp: new Date().toISOString(),
  }

  // Save to /seo-snapshots/{route}.json
  saveSnapshot(route, snapshotData)

  if (options?.compare) {
    const previous = loadPreviousSnapshot(route)
    return diff(previous, snapshotData)
  }
}
```

**CLI Usage:**

```bash
npx better-seo snapshot                    # Snapshot all pages
npx better-seo snapshot /blog/my-post      # Snapshot specific page
npx better-seo snapshot --compare          # Show diff from last snapshot
```

**Output:**

```txt
/seo-snapshots/
  homepage.json
  dashboard.json
  blog-article.json
```

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| Debugging | See exact rendered output without deploying |
| Regression protection | Diff snapshots to catch breaking changes |
| Audit trails | Version-controlled SEO for enterprise |
| CI/CD integration | Fail builds on SEO regressions |

**Design rationale:** SEO becomes testable + version-controlled. Replaces debugging tools, guesswork, and manual audits.

---

#### 9. SEO Middleware (Rule-Based Auto-Apply)

```ts
// singleton.ts
export function initSEO(
  config: SEOConfig & {
    rules?: SEORule[]
    plugins?: SEOPlugin[]
  },
) {
  globalConfig = config
}

export type SEORule = {
  match: string // Glob pattern: "/blog/*", "/product/*"
  seo: Partial<SEO>
  priority?: number // For overlapping rules
}

// voila.ts — rules path requires a route key (framework-specific)
export function seo(input: Partial<SEO> = {}, routeContext?: { pathname: string }): Metadata {
  const config = getGlobalConfig()
  const route = routeContext?.pathname ?? getCurrentRouteFromAdapter()

  const rulesSEO = applyRules(route, config.rules ?? [])

  const merged = mergeSEO(rulesSEO, input)
  const seoObject = createSEO(merged, config)
  return renderForAdapter(seoObject, getRegisteredAdapter() ?? detectFramework())
}

function applyRules(route: string, rules: SEORule[]): Partial<SEO> {
  const matching = rules.filter((rule) => matchesGlob(route, rule.match))
  const sorted = matching.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  return sorted.reduce((acc, rule) => mergeSEO(acc, rule.seo), {})
}
```

`getCurrentRouteFromAdapter()` is implemented per **`@better-seo/next`** / **`@better-seo/remix`** (e.g. request URL or segment context). **Static export** and **SPA** builds may require passing **`routeContext`** explicitly — document per adapter.

**Usage:**

```ts
initSEO({
  defaultTitle: "My App",
  rules: [
    {
      match: "/blog/*",
      seo: {
        openGraph: { type: "article" },
        schema: [Article({ author: "Default Author" })],
      },
    },
    {
      match: "/product/*",
      seo: {
        openGraph: { type: "product" },
      },
    },
    {
      match: "/docs/*",
      seo: {
        robots: "noindex", // Hide docs from search
      },
    },
  ],
})
```

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| Scale | 1000 pages? No problem |
| No repetition | Define once, auto-apply |
| Predictable | Glob patterns, explicit rules |
| Override-safe | Page-level `seo()` still wins |

**Design rationale:** "Routing for SEO" — feels like magic but predictable. Replaces manual config, duplication, and human error.

---

#### 10. Content → SEO Compiler

```ts
// compiler.ts
export function fromContent(content: ContentInput): Partial<SEO> {
  return {
    meta: {
      title: content.title,
      description: generateDescription(content.body),
    },
    openGraph: {
      title: optimizeForOG(content.title),
      description: generateDescription(content.body),
    },
    schema: [
      Article({
        headline: content.title,
        description: generateDescription(content.body),
        author: content.author,
        datePublished: content.date,
      }),
    ],
  }
}

function generateDescription(body: string): string {
  // Extract first paragraph or summarize
  // Truncate to 160 chars
}

function optimizeForOG(title: string): string {
  // Remove special chars
  // Ensure optimal length
}
```

**MDX Integration:**

```ts
// compiler.ts
export function fromMDX(mdx: MDXFile): Partial<SEO> {
  const frontmatter = mdx.frontmatter
  const headings = extractHeadings(mdx.body)

  return {
    meta: {
      title: frontmatter.title,
      description: frontmatter.excerpt ?? generateDescription(mdx.body),
    },
    schema: [
      Article({
        headline: frontmatter.title,
        description: frontmatter.excerpt,
        author: frontmatter.author,
        datePublished: frontmatter.date,
        wordCount: mdx.body.length,
      }),
    ],
  }
}
```

**Usage:**

```ts
import { seo, fromContent, fromMDX } from "@better-seo/core"
import post from "./my-post.mdx"

export const metadata = seo(fromMDX(post))
```

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| No thinking | Devs provide content, you provide SEO |
| Consistent | Same logic across all pages |
| Future-proof | Foundation for AI enhancements |

**Design rationale:** Bridge between "I have content" and "I need SEO". Replaces manual writing, schema decisions, and optimization thinking.

---

#### 11. SEO Preview (Bonus Killer Feature)

```ts
// commands/preview.ts
async function preview(
  route: string,
  options?: {
    open?: boolean // Auto-open browser
  },
) {
  const seo = getSEOForRoute(route)
  const previews = {
    google: renderGooglePreview(seo),
    twitter: renderTwitterPreview(seo),
    linkedin: renderLinkedInPreview(seo),
    slack: renderSlackPreview(seo),
  }

  // Generate HTML preview page
  const html = generatePreviewPage(previews)

  if (options?.open) {
    openInBrowser(html)
  }

  return html
}
```

**CLI Usage:**

```bash
npx better-seo preview /blog/my-post       # Preview all platforms
npx better-seo preview / --open            # Auto-open browser
```

**Output:**

- Side-by-side previews for Google, Twitter, LinkedIn, Slack
- Shows exactly how the page will appear when shared

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| Instant feedback | No more deploy → check → redeploy loop |
| Demo magic | Show stakeholders in real-time |
| Debugging | Catch OG issues before production |

**Design rationale:** Saves hours of trial-and-error. Makes demos insanely effective.

---

#### 12. Interactive CLI & Installation Experience

**TUI Design Principles:**
| Principle | Implementation |
|-----------|----------------|
| **Sleek** | Modern colors, smooth animations, clear typography |
| **Fast** | < 500ms startup, lazy-load heavy operations |
| **Guided** | Step-by-step wizard, sensible defaults |
| **Safe** | Dry-runs, confirmations, undo options |

---

**Installation Wizard (`npx better-seo init`):**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🚀 better-seo.js — Setup Wizard                       │
│                                                         │
│   Make your app look pro in 60 seconds.                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

? Select your framework:
  ❯ Next.js (App Router)
    Next.js (Pages Router)
    React + Vite
    Astro
    Remix
    Nuxt
    Other (Manual Setup)

? What type of project is this?
  ❯ SaaS / Web App
    Blog / Content Site
    Documentation
    E-commerce
    Portfolio
    Other

? Enable asset generation? (OG images, icons, etc.)
  ❯ Yes, generate automatically
    No, I'll handle assets manually
    Ask me per-command

? Enable dev warnings? (title length, missing fields, etc.)
  ❯ Yes
    No

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ⚙️  Generating configuration...                        │
│   ✓ Created better-seo.config.ts                        │
│   ✓ Installed better-seo.js (core)                      │
│   ✓ Installed @better-seo/next (adapter)                │
│   ✓ Installed better-seo-assets (optional)             │
│                                                         │
│   🎉 Setup complete!                                    │
│                                                         │
│   Quick start:                                          │
│   export const metadata = seo({ title: "Home" })        │
│                                                         │
│   Run 'npx better-seo add /' to inject SEO              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Template System:**

Each template provides:

- Pre-configured SEO rules (middleware)
- Schema helpers for that use case
- OG image templates
- Sample content compiler config

**Templates:**

| Template      | Includes                                                    |
| ------------- | ----------------------------------------------------------- |
| **blog**      | Article schema, OG templates, RSS meta, author schema       |
| **docs**      | TechDoc schema, noindex for drafts, breadcrumb schema       |
| **saas**      | SoftwareApp schema, Product schema for features, FAQ schema |
| **ecommerce** | Product schema, Offer schema, Review schema, BreadcrumbList |
| **portfolio** | Person schema, CreativeWork schema, ImageObject schema      |

**Template Config Output:**

```ts
// better-seo.config.ts (blog template)
import { defineSEO, Article } from "@better-seo/core"

export default defineSEO({
  template: "blog",

  meta: {
    title: "My Blog",
    description: "Thoughts on tech and life",
  },

  rules: [
    {
      match: "/blog/*",
      seo: {
        openGraph: { type: "article" },
        schema: [Article({ author: "Default Author" })],
      },
    },
  ],

  og: {
    source: "auto",
    theme: "dark",
    template: "blog-card",
  },

  icons: {
    source: "./src/app/icon.svg",
  },
})
```

---

**Framework Detection (Auto):**

```ts
// cli/detect.ts
function detectFramework(): Framework {
  if (exists("next.config.js") || exists("next.config.mjs")) {
    return hasAppRouter() ? "next-app" : "next-pages"
  }
  if (exists("vite.config.ts") || exists("vite.config.js")) {
    return "vite"
  }
  if (exists("astro.config.mjs")) {
    return "astro"
  }
  if (exists("remix.config.js")) {
    return "remix"
  }
  if (exists("nuxt.config.ts")) {
    return "nuxt"
  }
  return "unknown"
}
```

---

**Adapter Installation:**

```bash
# Auto-detected Next.js
Installing @better-seo/next...

# User can also install manually
npm install @better-seo/react
npm install @better-seo/astro
npm install @better-seo/remix
npm install @better-seo/nuxt
```

**Adapter Packages:**
| Adapter | Package | Provides |
|---------|---------|----------|
| Next.js (App) | `@better-seo/next` | `toNextMetadata()`, app router types |
| Next.js (Pages) | `@better-seo/next` | `toNextMetadata()`, pages router types |
| React | `@better-seo/react` | `toHelmetProps()`, hook components |
| Astro | `@better-seo/astro` | Astro component, head helpers |
| Remix | `@better-seo/remix` | `meta` export helpers |
| Nuxt | `@better-seo/nuxt` | Nuxt module, head helpers |

---

**CLI Commands with TUI:**

```bash
# Interactive mode (default)
npx better-seo init

# Non-interactive (CI/CD)
npx better-seo init --framework next-app --template saas --no-interactive

# Add SEO with TUI selection
npx better-seo add
# → Shows interactive route selector
# → Preview before inject

# Template switching
npx better-seo template switch
# → Select new template
# → Merges with existing config

# Template preview
npx better-seo template preview blog
# → Shows what the template includes
```

---

**Progress Indicators:**

```
┌─────────────────────────────────────────────────────────┐
│  Generating OG Images                                   │
│                                                         │
│  [████████████████░░░░░░░░] 60% | 12/20 pages          │
│                                                         │
│  Current: /blog/my-awesome-post                         │
│  ETA: 3s                                                │
└─────────────────────────────────────────────────────────┘
```

---

**Error Handling:**

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Warning                                            │
│                                                         │
│  No logo found at /public/logo.svg                      │
│                                                         │
│  Options:                                               │
│  ❯ Use default placeholder                              │
│    Specify different path                               │
│    Skip OG generation                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Design rationale:**

- First impression matters — sleek TUI builds trust
- Guided setup reduces decision fatigue
- Templates provide opinionated best practices
- Framework-specific adapters keep core agnostic
- Auto-detect + manual override for edge cases

---

## 4. API Specification

### 4.1 Public API

```ts
// Core (better-seo.js)
import { createSEO, mergeSEO, type SEO, type SEOConfig } from "@better-seo/core"

// Schema helpers
import {
  WebPage,
  Article,
  Product,
  Organization,
  Person,
  BreadcrumbList,
  FAQPage,
} from "@better-seo/core"

// Adapters
import { toNextMetadata, toHelmetProps } from "@better-seo/core"

// Validation (dev-only)
import { validateSEO } from "@better-seo/core"

// Migration
import { fromNextSeo } from "@better-seo/core"

// Content compiler
import { fromContent, fromMDX } from "@better-seo/core"

// Assets (better-seo-assets - optional)
import { generateOG, generateIcons, generateManifest, generateSplash } from "@better-seo/assets"

// Voilà API (Quick Attach)
import { seo, withSEO, useSEO, initSEO } from "@better-seo/core"

// Types & extensibility
import type { SEORule, SEOPlugin } from "@better-seo/core"
import {
  registerAdapter,
  defineSEOPlugin,
  serializeJSONLD,
  createSEOContext,
} from "@better-seo/core"
```

### 4.2 Voilà API (Quick Attach)

#### Next.js — Singleton Pattern

```ts
// lib/seo.ts
import { seo } from "@better-seo/core"

initSEO({
  defaultTitle: "My App",
  baseUrl: "https://example.com",
  titleTemplate: "%s | My App",
})

export { seo }

// app/page.tsx
import { seo } from "@/lib/seo"

export const metadata = seo({ title: "Home" })
```

#### API Levels

| Method         | Framework | Usage                                         |
| -------------- | --------- | --------------------------------------------- |
| `seo()`        | Next.js   | `export const metadata = seo({...})`          |
| `withSEO()`    | Next.js   | `export const metadata = withSEO({...})`      |
| `useSEO()`     | React     | `useSEO({...})` in component                  |
| `seo.layout()` | Next.js   | Layout-level with auto-merge                  |
| `seo.page()`   | Next.js   | Page-level with auto-merge                    |
| `seo.route()`  | Any       | Route-aware: `seo.route("/dashboard", {...})` |
| `seo.auto()`   | Any       | Infers from current route                     |

---

#### Layout + Page Auto-Merge

```ts
// layout.tsx
export const metadata = seo.layout({
  title: "App",
  description: "Default description",
})

// page.tsx
export const metadata = seo.page({
  title: "Dashboard", // Final: "Dashboard | App"
})
```

Internally calls `mergeSEO()` automatically.

---

#### React Hook

```tsx
import { useSEO } from "@better-seo/core"

function Page() {
  useSEO({ title: "Dashboard" })

  return <h1>Dashboard</h1>
}
```

No wrapper components. No JSX clutter.

---

### 4.3 CLI Commands

```bash
# Initialize config (optional - zero-config mode works without)
npx better-seo init

# Generate OG images
npx better-seo og                    # Auto mode
npx better-seo og "Hello World"      # Quick demo - instant OG image
npx better-seo og --template ./og.tsx
npx better-seo og --theme dark

# Generate icons from logo
npx better-seo icons ./logo.svg
npx better-seo icons ./logo.svg --output /public

# Generate splash screens
npx better-seo splash --logo ./logo.svg --theme dark

# Analyze SEO coverage
npx better-seo analyze ./app

# Voilà: Auto-inject SEO into pages
npx better-seo add /dashboard              # Injects seo() into page
npx better-seo add /blog --layout          # Injects at layout level
npx better-seo add /dashboard --dry-run    # Preview changes only
npx better-seo add /dashboard --safe       # Skip if already exists
npx better-seo add /dashboard --interactive # Prompt before each change

# Scan & Fix
npx better-seo scan                  # Reports missing SEO
npx better-seo scan --dry-run        # Preview only
npx better-seo fix                   # Auto-injects baseline SEO
npx better-seo fix --interactive     # Prompt before each fix

# Snapshots (Time-Travel + Debugging)
npx better-seo snapshot                      # Snapshot all pages
npx better-seo snapshot /blog/my-post        # Snapshot specific page
npx better-seo snapshot --compare            # Show diff from last snapshot
npx better-seo snapshot --output ./seo-snapshots

# Preview (See how pages look when shared)
npx better-seo preview /blog/my-post         # Preview all platforms
npx better-seo preview / --open              # Auto-open browser

# Migration (for breaking changes)
npx better-seo migrate               # Auto-updates code for new versions

# CI / health (optional)
npx better-seo doctor                # Validates config + adapter registration; non-zero exit on errors
```

---

### 4.4 Visual Proof (Demo Shock)

**README must include before/after visuals:**

#### OG Image Generation

| Before                         | After                                |
| ------------------------------ | ------------------------------------ |
| Broken link preview (no image) | Clean, branded OG card               |
| Default Twitter card           | Custom design-system-matched preview |

**Demo command:**

```bash
npx better-seo og "Hello World"
# → Outputs beautiful OG image in 2 seconds
```

---

#### Icon Generation

| Before             | After                                             |
| ------------------ | ------------------------------------------------- |
| Single favicon.ico | Full set: 16, 32, 192, 512, apple-touch, maskable |
| No PWA support     | `manifest.json` + all assets                      |

**Demo command:**

```bash
npx better-seo icons ./logo.svg
# → Outputs 7 icon files + manifest.json
```

---

#### SEO Coverage

| Before               | After                |
| -------------------- | -------------------- |
| 5/20 pages with SEO  | 20/20 pages with SEO |
| Missing descriptions | All pages validated  |

**Demo command:**

```bash
npx better-seo scan
# → Reports: "15 pages missing SEO"
npx better-seo fix
# → All pages now have SEO
```

---

**Design rationale:** You're selling aesthetics + automation. Without visual proof, your biggest differentiator is invisible.

### 4.5 Usage Examples

#### Next.js (App Router) — Full Example

```ts
// app/page.tsx
import { createSEO, mergeSEO, toNextMetadata, Article } from "@better-seo/core"

// Layout-level SEO (root layout)
const layoutSEO = createSEO(
  {
    meta: {
      title: "Home",
      description: "Default site description",
    },
    openGraph: {
      siteName: "My Site",
      locale: "en_US",
    },
  },
  {
    defaultTitle: "My Site",
    baseUrl: "https://example.com",
    titleTemplate: "%s | My Site",
  },
)

// Page-level SEO (merged with layout)
const pageSEO = mergeSEO(layoutSEO, {
  meta: {
    title: "My Article", // Final: "My Article | My Site"
    description: "A compelling article description",
    canonical: "/blog/my-article",
    alternates: {
      languages: {
        "en-US": "/en/blog/my-article",
        "es-ES": "/es/blog/my-article",
      },
    },
    verification: {
      google: "verification-code",
    },
  },
  openGraph: {
    type: "article",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Article preview",
      },
    ],
  },
  schema: [
    Article({
      headline: "My Article",
      datePublished: "2024-01-01",
      author: { "@type": "Person", name: "John Doe" },
      image: { "@type": "ImageObject", url: "/og-image.jpg" },
    }),
  ],
})

export const metadata = toNextMetadata(pageSEO)
```

#### React (React Helmet Async)

```tsx
import { createSEO, toHelmetProps } from '@better-seo/core'
import { Helmet } from 'react-helmet-async'

function Page() {
  const seo = createSEO({...}, {...})

  return (
    <>
      <Helmet {...toHelmetProps(seo)} />
      <h1>My Page</h1>
    </>
  )
}
```

#### Migration from next-seo

```ts
// Before (next-seo)
import { NextSeo } from 'next-seo'

<NextSeo
  title="My Page"
  description="My description"
  canonical="https://example.com/page"
  openGraph={{
    title: "OG Title",
    images: [{ url: "/image.jpg" }]
  }}
/>

// After (better-seo.js)
import { createSEO, fromNextSeo } from '@better-seo/core'

// Option 1: Manual migration
const seo = createSEO({
  meta: { title: "My Page", description: "My description" },
  openGraph: { images: [{ url: "/image.jpg" }] }
}, config)

// Option 2: Auto-convert (provided utility)
const seo = fromNextSeo({
  title: "My Page",
  description: "My description",
  canonical: "https://example.com/page",
  openGraph: { ... }
}, config)
```

#### Vanilla / Custom Renderer

```ts
const seo = createSEO({...}, {...})

// Access raw values
seo.meta.title
seo.openGraph?.images
seo.schema?.[0]

// Render JSON-LD manually
seo.schema?.map(s =>
  `<script type="application/ld+json">${JSON.stringify(s)}</script>`
)
```

#### Asset Generation Workflow

```bash
# 1. Initialize (creates better-seo.config.ts)
npx better-seo init

# 2. Generate OG images from config
npx better-seo og

# 3. Generate icons from logo
npx better-seo icons ./src/assets/logo.svg

# 4. Generate splash screens
npx better-seo splash

# Output ready in /public, referenced in SEO config
```

```ts
// better-seo.config.ts
export default defineSEO({
  meta: {
    title: "My App",
    description: "My app description",
  },
  og: {
    source: "auto",
    logo: "/logo.svg",
    theme: "dark",
  },
  icons: {
    source: "./src/assets/logo.svg",
    output: "/public",
  },
})

// app/layout.tsx
import { createSEO, toNextMetadata } from "@better-seo/core"
import config from "../better-seo.config"

const seo = createSEO(config.meta, {
  defaultTitle: config.meta.title,
  baseUrl: "https://example.com",
  titleTemplate: "%s | My App",
})

export const metadata = toNextMetadata(seo)
```

---

## 5. Implementation waves (dependency order)

Waves are **sequenced for risk reduction**, not "MVP vs enterprise": **all capabilities listed elsewhere in this PRD remain in scope** — only **delivery order** changes. **Wave 1–2** must prove the **Next.js golden path + E2E** before breadth.

### Wave 1: Core engine + Next adapter + E2E gate **SHIP OR DIE**

| Task                                   | Deliverable                                                                  | Priority    |
| -------------------------------------- | ---------------------------------------------------------------------------- | ----------- |
| Define TypeScript types                | `types.ts` (SEO, strict `JSONLD`, alternates, verification, OG images array) | 🔴 Critical |
| Safe JSON-LD serialization             | `serializeJSONLD()` + adapter use                                            | 🔴 Critical |
| Implement `createSEO()` / `mergeSEO()` | `core.ts` (`titleTemplate`, `schemaMerge`)                                   | 🔴 Critical |
| Schema helpers (7 types)               | `schema.ts`                                                                  | 🟡 High     |
| **Voilà API**                          | `voila.ts` (`seo()`, `withSEO()`, `useSEO()`)                                | 🔴 Critical |
| **Context API**                        | `createSEOContext()` for SSR / tenants / Edge                                | 🔴 Critical |
| **Adapter registry**                   | `registerAdapter()` + **`@better-seo/next`** (App Router first)              | 🔴 Critical |
| **Zero-config path**                   | `singleton.ts` + inference (**Node only**; documented)                       | 🔴 Critical |
| Plugin skeleton                        | `defineSEOPlugin()` + hook runner (minimal `afterMerge`)                     | 🟡 High     |
| Unit tests                             | Vitest, >90% core                                                            | 🔴 Critical |
| **E2E tests**                          | Playwright against `examples/nextjs-app` (head tags, OG, JSON-LD parse)      | 🔴 Critical |

**Exit criteria:**

- `npm install` + **Next.js App Router** example: `export const metadata = seo({ title: "Home" })` in **under 60 seconds** on Node
- **CI runs E2E** on the reference example
- No `any` in **published** type declarations for public exports

---

### Wave 2: OG Generator (Week 3) **HOOK USERS**

| Task               | Deliverable                         | Priority    |
| ------------------ | ----------------------------------- | ----------- |
| Basic OG generator | `better-seo-assets/og/` with Satori | 🔴 Critical |
| CLI `og` command   | `npx better-seo og "Hello World"`   | 🔴 Critical |
| Simple templates   | 2-3 built-in templates (light/dark) | 🟡 High     |

**Exit criteria:**

- `npx better-seo og "Hello World"` outputs beautiful OG image in 2 seconds
- README shows before/after visual proof

---

### Wave 3: Icon Generator (Week 4) **LOCK THEM IN**

| Task                | Deliverable                           | Priority    |
| ------------------- | ------------------------------------- | ----------- |
| Icon generator      | `better-seo-assets/icons/` with sharp | 🔴 Critical |
| CLI `icons` command | `npx better-seo icons ./logo.svg`     | 🔴 Critical |
| Manifest generator  | `manifest.json` output                | 🟡 High     |

**Exit criteria:**

- `npx better-seo icons ./logo.svg` outputs 7 icon files + manifest.json
- Before/after visual proof in README

---

### Wave 4: Publication & distribution (Week 5)

| Task                 | Deliverable                                  |
| -------------------- | -------------------------------------------- |
| npm package setup    | `package.json`, build config                 |
| GitHub repo          | Public repo with clean README + visual proof |
| Initial announcement | Twitter/X, Reddit, Discord                   |
| Example project      | `/examples/nextjs-app`                       |

**Exit criteria:** First 100 installs.

---

### Wave 5: More adapters + validation (Week 6-7)

| Task                 | Deliverable                                              |
| -------------------- | -------------------------------------------------------- |
| React Helmet adapter | `toHelmetProps()`                                        |
| Vanilla renderer     | `renderTags()`                                           |
| Dev warnings         | `validate.ts` (title/description length, missing fields) |
| Integration tests    | Adapter test suite                                       |

**Exit criteria:** Works in React + Vite apps, warnings fire in dev mode.

---

### Wave 6: SEO rules / middleware (Week 8) **SCALE UNLOCK**

| Task            | Deliverable                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| Rule engine     | `applyRules()` with glob matching                                                  |
| SEORule type    | `{ match, seo, priority }`                                                         |
| Route detection | `getCurrentRouteFromAdapter()` per framework; explicit `routeContext` where needed |
| Merge priority  | Rules → input (input wins)                                                         |

**Exit criteria:** `initSEO({ rules: [...] })` auto-applies SEO to matching routes.

---

### Wave 7: Content compiler (Week 9) **INTELLIGENCE LAYER**

| Task                  | Deliverable                          |
| --------------------- | ------------------------------------ |
| `fromContent()`       | Generate SEO from title + body       |
| `fromMDX()`           | Parse frontmatter + extract headings |
| Description generator | Summarize content to 160 chars       |
| OG title optimizer    | Clean and truncate for social        |

**Exit criteria:** `seo(fromMDX(post))` generates complete SEO from content alone.

---

### Wave 8: Snapshots + preview (Week 10-11) **TRUST + DEBUGGING**

| Task               | Deliverable                                            |
| ------------------ | ------------------------------------------------------ |
| `snapshot` command | Save SEO output to JSON files                          |
| `--compare` flag   | Diff snapshots for regression detection                |
| `preview` command  | Generate platform previews (Google, Twitter, LinkedIn) |
| `--open` flag      | Auto-open preview in browser                           |

**Exit criteria:**

- `npx better-seo snapshot --compare` shows SEO changes
- `npx better-seo preview /blog --open` shows side-by-side previews

---

### Wave 9: CLI TUI + installation wizard (Week 12-13)

| Task                 | Deliverable                                   |
| -------------------- | --------------------------------------------- |
| TUI components       | Select, input, progress, confirm              |
| `init` wizard        | Interactive setup flow                        |
| Framework detection  | Auto-detect + manual override                 |
| Template system      | blog, docs, saas, ecommerce, portfolio        |
| Adapter packages     | `@better-seo/next`, `@better-seo/react`, etc. |
| Non-interactive mode | `--no-interactive` flag for CI/CD             |

**Exit criteria:**

- `npx better-seo init` shows sleek interactive wizard
- Auto-detects Next.js and suggests correct adapter
- Templates provide opinionated starting configs

---

### Wave 10: CLI automation — add / scan / fix (Week 14)

| Task           | Deliverable                            |
| -------------- | -------------------------------------- |
| `add` command  | Auto-inject SEO into pages             |
| `scan` command | Report missing SEO                     |
| `fix` command  | Auto-fix missing SEO                   |
| Safety flags   | `--dry-run`, `--safe`, `--interactive` |
| Idempotency    | Running twice doesn't duplicate        |

**Exit criteria:** `npx better-seo add /dashboard --dry-run` and `npx better-seo scan && fix` work end-to-end.

---

### Wave 11: Design-system integration (Week 15-16)

| Task                    | Deliverable                          |
| ----------------------- | ------------------------------------ |
| Tailwind config parser  | Extract colors/fonts automatically   |
| Custom OG templates     | User-provided React/Satori templates |
| Splash screen generator | iOS + Android splash assets          |

**Exit criteria:** OG images match app's design system automatically.

---

### Wave 12: Crawl module + migration + docs polish (Week 17+)

| Task                    | Deliverable                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| **`@better-seo/crawl`** | `robots.txt`, `sitemap.xml`, RSS/Atom helpers, optional `llms.txt`            |
| Migration               | `fromNextSeo()` + `npx better-seo migrate` (codemods)                         |
| Docs                    | API, schema reference, **Next-first** integration guides, per-adapter recipes |

**Exit criteria:** **Next.js** migration path documented end-to-end; crawl outputs share **`baseUrl` / canonical** with core; a new adopter completes **next-seo → better-seo.js** in **≤10 minutes** using docs alone.

---

**Critical path:** **Wave 1** (core + **`@better-seo/next`** + **E2E**) gates everything else. Do not ship broad CLI automation (**Wave 10**) until the **golden example app** is stable in CI.

**High-leverage layers** (see §2.3 for product pyramid):
| Feature | Category | Why it wins |
|---------|----------|-------------|
| **SEO rules** | Scale | 1000s of pages without repetition |
| **Content compiler** | Intelligence | Content in → SEO model out |
| **SEO snapshots** | Trust | Testable + version-controlled SEO |
| **SEO preview** | Debugging | Instant feedback, demo magic |
| **CLI TUI** | UX | First impression, guided setup, templates |
| **Plugins + adapter registry** | Extensibility | Enterprise-safe customization |

---

## 6. Success Metrics

### 6.1 Technical KPIs

| Metric                         | Target                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------- |
| Core bundle size               | < 5KB gzipped                                                                     |
| Type safety                    | No `any` in **published** `.d.ts` for public exports; JSON-LD uses `JSONLDValue`  |
| Test coverage                  | > 90% core; adapters exercise merge + render                                      |
| **E2E**                        | Playwright smoke on `examples/nextjs-app` in default CI pipeline                  |
| Zero dependencies (core)       | No runtime deps                                                                   |
| Asset generation time          | < 2s per OG image                                                                 |
| CLI startup time               | < 500ms                                                                           |
| **Time-to-first-SEO**          | < 60 seconds (install → working, **Node** reference path)                         |
| **CLI injection success rate** | > 95% when AST-based detection enabled; heuristics documented as lower confidence |

### 6.2 Adoption KPIs (First 90 Days)

| Metric                      | Target           |
| --------------------------- | ---------------- |
| npm downloads/week (core)   | 500+             |
| npm downloads/week (assets) | 200+             |
| GitHub stars                | 200+             |
| Production adopters         | 10+ public repos |
| CLI commands run            | 1000+ /week      |
| **`add` command usage**     | 500+ /week       |
| **`scan && fix` usage**     | 200+ /week       |

---

## 7. Competitive Differentiation

| Feature                               | @better-seo/core                            | next-seo       | Next.js Metadata |
| ------------------------------------- | ------------------------------------------- | -------------- | ---------------- |
| Unified SEO object                    | ✅                                          | ❌             | ❌               |
| JSON-LD as primitive                  | ✅                                          | ⚠️ (add-on)    | ❌               |
| Framework agnostic                    | ✅                                          | ❌ (Next only) | ❌ (Next only)   |
| Schema helpers                        | ✅                                          | ⚠️ (limited)   | ❌               |
| Custom schema escape hatch            | ✅                                          | ❌             | N/A              |
| Fallback logic                        | ✅                                          | ⚠️ (manual)    | ❌               |
| **Layout + Page merge**               | ✅                                          | ❌             | ⚠️ (manual)      |
| **titleTemplate**                     | ✅                                          | ✅             | ❌               |
| **hreflang / alternates**             | ✅                                          | ✅             | ⚠️ (manual)      |
| **Verification tags**                 | ✅                                          | ✅             | ❌               |
| **OG images array**                   | ✅                                          | ✅             | ⚠️ (manual)      |
| **Dev warnings**                      | ✅                                          | ❌             | ❌               |
| **Migration utility**                 | ✅                                          | N/A            | N/A              |
| **OG image generator**                | ✅                                          | ❌             | ❌               |
| **Icon generator**                    | ✅                                          | ❌             | ❌               |
| **CLI tooling**                       | ✅                                          | ❌             | ❌               |
| **Design system integration**         | ✅                                          | ❌             | ❌               |
| **Voilà API (quick attach)**          | ✅                                          | ❌             | ❌               |
| **CLI auto-inject**                   | ✅                                          | ❌             | ❌               |
| **Scan & Fix**                        | ✅                                          | ❌             | ❌               |
| **SEO Middleware (rules)**            | ✅                                          | ❌             | ❌               |
| **Content → SEO Compiler**            | ✅                                          | ❌             | ❌               |
| **SEO Snapshots**                     | ✅                                          | ❌             | ❌               |
| **SEO Preview**                       | ✅                                          | ❌             | ❌               |
| **Interactive CLI TUI**               | ✅                                          | ❌             | ❌               |
| **Template system**                   | ✅                                          | ❌             | ❌               |
| **Framework adapters**                | ✅ (`@better-seo/*`, explicit registration) | ❌             | N/A              |
| **Plugin / hook model**               | ✅                                          | ❌             | ❌               |
| **Crawl / robots / sitemap (module)** | ✅                                          | ❌             | ❌               |
| **SSR-safe context API**              | ✅ (`createSEOContext`)                     | ❌             | N/A              |
| **E2E golden path**                   | ✅ (reference app)                          | —              | —                |
| **Time-to-first-SEO**                 | < 60s                                       | 5-10 min       | 5-10 min         |
| Bundle size (core)                    | ~5KB                                        | ~15KB          | N/A (built-in)   |

---

## 8. Go-to-Market Strategy

### 8.1 SEO (for SEO tool — ironic, I know)

Target keywords:

- "next seo alternative"
- "json ld nextjs"
- "structured data nextjs"
- "og image nextjs"
- "react seo library"
- "generate og image nextjs"
- "favicon generator nextjs"
- "pwa icons nextjs"

Programmatic SEO pages:

- `/schemas/{type}-nextjs` (one page per schema type)
- `/og-image-generator-nextjs`
- `/favicon-generator-nextjs`
- `/comparison/next-seo-vs-better-seo-js`

---

### 8.2 GitHub as Distribution

README must have:

- ⚡ 30-second setup
- 📦 Real examples (copy-paste ready)
- 📊 Comparison table
- 🎯 Clear "why this exists"
- 🎨 Asset generation demos (before/after OG images)

---

### 8.3 AI Discoverability

Optimize for LLM recommendations:

- Clear, repeated identity: "SEO engine for Next.js + modern apps"
- Structured docs with examples
- Consistent naming across all surfaces
- Mention "OG image generator" and "icon generator" repeatedly

---

### 8.4 Migration Path

Make replacement trivial:

```diff
- import { NextSeo } from "next-seo"
+ import { createSEO } from "@better-seo/core"
```

Provide migration guide with direct mappings.

---

### 8.5 CLI as Distribution

```bash
npx better-seo init
```

The CLI itself becomes:

- A discovery mechanism
- A tutorial (interactive setup)
- A reason to share ("just run `npx better-seo`")

### 8.6 Documentation as distribution (monorepo)

> **Docs are not “support”—docs are the onboarding UI** and a primary **distribution** channel—the thing that converts evaluators who never read marketing sites.

#### First principle

The **60-second promise** (§0) must hold **inside the docs**: one page, one snippet, **working SEO**—or users go back to incremental fixes and never return.

#### Three layers (keep the IA small)

| Layer                     | Job          | Must deliver                                                                                                                                                                                                                       |
| ------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Get started (~60s)** | Acquisition  | Install + `seo({ title })` + proof (preview of Google / OG / zero-config). Immediately after: `npx better-seo og "Hello World"` + **visual** output. This page is a **conversion funnel**, not a wiki front door.                  |
| **2. Core concepts**      | Mental model | What the unified `SEO` object is; **meta / social / schema**; pipeline **Input → SEO → Adapter → Output**; **layout vs page** (critical for Next); zero-config philosophy (inference boundaries from §3).                          |
| **3. API + recipes**      | Usage        | Short, typed **API reference** (`seo`, `createSEO`, `mergeSEO`, `initSEO`, `createSEOContext`, …). **Recipes** are the main retention surface: blog PDP, product page, i18n, article JSON-LD, custom OG—**copy-paste over prose**. |

**Reality:** most devs **copy patterns**; they do not read long explanations. Recipes beat brilliance.

#### Monorepo layout (docs + examples)

Keep docs **in-repo** first; treat the website as a **publish target** for the same content when needed.

```txt
/docs
  /getting-started      ← Layer 1
  /concepts             ← Layer 2
  /api                  ← Layer 3 reference
  /recipes              ← Layer 3 patterns (primary)
  /cli
  /assets
  /compare              ← e.g. next-seo vs better-seo — SEO + conversion

/examples
  nextjs-app            ← Golden path + E2E (see §5)
  react-app
  blog-seo
  ecommerce-seo
```

**Examples > explanations.** Each major recipe should link to a **runnable** example directory.

#### AI- and IDE-ready content

- **Page skeleton** (repeat everywhere): _What it does → When to use → Example → Output → Notes._
- **Stable identity line** (repeat verbatim where natural): _better-seo.js is a programmable SEO engine for Next.js and modern apps_—aids LLM and search recall.
- **Clarity over hype** in prose; **maximize fenced code blocks** (models and humans index them).
- **API surface:** clear names (`seo` not `generateMetaConfigEngine`), **JSDoc** on public exports with `@example`, types that **suggest usage** where possible—so “add SEO to this page” in Cursor/Copilot resolves to this library.

#### High-leverage doc pages

| Page type                                       | Purpose                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| **Comparison** (`/compare/next-seo` or similar) | Converts skeptics; drives organic and LLM citations.                            |
| **Playground (nice later)**                     | Interactive title → preview metadata/OG; docs become a **demo**, not only text. |

#### Tone & anti-patterns

- **Tone:** crisp, direct, slightly opinionated—matching “remove thinking,” not academic density.
- **Do not** over-document v1 before ship: ship the golden path, then widen.
- **Do not** split docs into a separate silo **too early**; monorepo truth → publish.
- **Do not** optimize for “explaining architecture” over **removing decisions** from the reader.

#### Checklist

**Must-have for launch narrative:** Quick start, core concepts, API reference, recipes, CLI, examples.  
**Nice later:** Playground, deep schema encyclopedia, extended comparison matrix.

If the reader hits **one page, copies one block, sees it work**, docs did their job. If they **scroll, hesitate, and compare in the abstract**, the funnel failed.

---

## 9. Risks & Mitigations

| Risk                               | Mitigation                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Next.js builds native SEO solution | Focus on JSON-LD + unified model + assets (their primitives, not a system) |
| next-seo improves                  | They're static; we're extensible by design + have assets                   |
| Low adoption                       | Developer experience is the moat — make it 10x clearer                     |
| Schema.org changes                 | Escape hatch (`CustomSchema`) means we don't need updates                  |
| Asset bloat                        | Keep assets in separate package, optional install                          |
| CLI complexity                     | Start minimal, add commands based on user demand                           |
| Design system parsing fails        | Graceful fallback to defaults, warn user                                   |
| Hidden global config on server     | Document `createSEOContext`; forbid implicit globals in Edge               |
| Monorepo mis-detection             | Adapter registration + explicit `adapter` option in CI                     |

---

## 10. Later extensions (optional modules / research)

Ship list for **crawl + dedupe + plugins** lives in §3 and **Wave 12**. The following are **intentionally later** or partner-tier to avoid diluting the core:

| Extension                    | Description                                                               |
| ---------------------------- | ------------------------------------------------------------------------- |
| **CMS connectors**           | Sanity, Contentful, Strapi, WordPress — map CMS models → `SEO` / `JSONLD` |
| **Analytics bridges**        | Optional telemetry hooks (out of core; enterprise agreements)             |
| **Advanced schema dedupe**   | Graph-aware merges beyond `@id` + `@type` (e.g. sameAs consolidation)     |
| **Internal linking advisor** | Non-magical suggestions from route graph                                  |
| **Per-locale OG**            | Asset pipeline generates OG images per language                           |

---

## 11. Appendix

### 11.1 Naming

| Package          | Name                                       | Import                |
| ---------------- | ------------------------------------------ | --------------------- |
| Core             | `@better-seo/core`                         | `@better-seo/core`    |
| Adapters         | `@better-seo/next`, `@better-seo/react`, … | Scoped packages       |
| Crawl (optional) | `@better-seo/crawl`                        | `@better-seo/crawl`   |
| Assets           | `@better-seo/assets`                       | `@better-seo/assets`  |
| CLI              | `@better-seo/cli` (bin `better-seo`)       | `npx @better-seo/cli` |
| GitHub repo      | `better-seo-js`                            | —                     |

### 11.2 License

MIT — maximize adoption, allow commercial use.

### 11.3 Design Principles

1. **Time-to-value first** — 60 seconds from install → working SEO
2. **Ship voila before perfect** — Level 1 (acquisition) before Level 5 (unfair)
3. **Complete, not complex** — Cover all channels, stay simple
4. **Convention over configuration** — Sensible defaults, opt-out not opt-in
5. **Zero-config mode** — Infer from `package.json` + env, config is optional
6. **Escape hatches everywhere** — Never block advanced use cases
7. **Zero runtime cost** — No dependencies, tree-shakeable
8. **Docs as product** — If it's not documented, it doesn't exist
9. **Layout + Page composition** — Real apps have nested SEO; make it trivial
10. **Dev experience > Features** — Warnings beat errors, DX beats cleverness
11. **Core + Modules** — Core stays lean, features are optional addons
12. **Design-system aware** — Assets should match the app's visual identity
13. **Active, not passive** — Scan, fix, inject — don't just wait for config
14. **Idempotent CLI** — Running commands twice never breaks or duplicates
15. **Trust through safety** — `--dry-run`, `--safe`, `--interactive` flags mandatory
16. **SEO as code** — Snapshots make SEO testable + version-controlled
17. **Routing for SEO** — Middleware auto-applies rules at scale
18. **Content-first** — Compiler bridges "I have content" → "I need SEO"
19. **Preview everything** — Instant feedback beats deploy → check → redeploy
20. **Sleek TUI** — First impression matters, guided setup reduces friction
21. **Templates over blank slate** — Opinionated starting points beat config hell
22. **Framework specialization** — Core agnostic, adapters specialized per ecosystem
23. **Explicit beats magic in prod** — Register adapters; treat auto-detect as a dev shortcut
24. **Safe serialization** — JSON-LD and meta strings never bypass hardened escape paths

### 11.4 Mental Model

You're not building:

> a meta tag helper

You're building:

> **a normalized SEO document model**

Everything else is just:

> rendering that model into different formats

And now:

> **generating discovery surfaces from that model**

---

## 12. Closing

**One-liner:** _Make your app look and rank like a finished product in 60 seconds._

**Acquisition hook:** `export const metadata = seo({ title: "Home" })` on **Next.js App Router** first; other frameworks reuse the same `SEO` model via `@better-seo/*`.

**Retention moat:** Asset automation, rules engine, compiler, snapshots, and CLI — all **layers on one document model** (see §2.3).

**Sign-off (optional):**

| Role        | Name | Date |
| ----------- | ---- | ---- |
| Product     | —    | —    |
| Engineering | —    | —    |
| Design      | —    | —    |

_Last reviewed: 2026-04-02._

---

> **North star:** Ship the "voilà moment" (**Wave 1** + **E2E** green) before expanding breadth — without sacrificing **enterprise guarantees** (typed JSON-LD, safe serialization, explicit adapters, Playwright on the golden app).
