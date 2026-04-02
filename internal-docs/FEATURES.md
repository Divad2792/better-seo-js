# better-seo.js — Feature catalog & quality bar

This document lists **planned features**, **where they live** in the monorepo, and **what “enterprise-grade” means** for each—**not** a minimal MVP checklist. Product intent: [`PRD.md`](./PRD.md). **Phases / waves + feature traceability:** [`Roadmap.md`](./Roadmap.md). Boundaries and zero-dep core: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. How features map to packages

| Package                                                                  | Role                                                                                                                                                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@better-seo/core`**                                                   | Unified `SEO` model, merge, fallbacks, JSON-LD helpers, serialization, validation (dev), rules (pure), plugins, `createSEOContext`, vanilla `renderTags`, optional `initSEO` (Node) |
| **`@better-seo/next`**                                                   | **P0.** Next.js `Metadata` / App & Pages Router integration, `toNextMetadata`, route context patterns                                                                               |
| **`@better-seo/react`**                                                  | Helmet / SPA head (**Wave 5** — **`toHelmetProps`**, **`useSEO`**, adapter **`react`**)                                                                                             |
| **`@better-seo/remix`**, **`@better-seo/astro`**, **`@better-seo/nuxt`** | Same adapter pattern (P2 / as needed)                                                                                                                                               |
| **`@better-seo/assets`**                                                 | OG, icons, splash, manifest (optional deps: Satori, Sharp, …)                                                                                                                       |
| **`@better-seo/cli`**                                                    | `init`, `og`, `icons`, `add`, `scan`, `fix`, `snapshot`, `preview`, `migrate`, `doctor`, templates, TUI                                                                             |
| **`@better-seo/crawl`**                                                  | Sitemap, robots, RSS/Atom, optional `llms.txt`                                                                                                                                      |
| **`examples/*`**                                                         | Golden paths + **E2E** (especially `examples/nextjs-app`)                                                                                                                           |
| **`docs/*`**                                                             | Distribution & onboarding (per PRD §8.6)                                                                                                                                            |

**Rule:** `@better-seo/core` stays **runtime dependency-free**; heaviness lives in adapters (framework peers) or optional packages.

---

## 2. Enterprise quality bar (applies to every feature)

A feature is **enterprise-ready** when it meets **all** relevant rows—not “works in a demo.”

| Dimension              | What “really good” means                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Correctness**        | Deterministic output for the same `SEO` + config; documented merge and fallback order; JSON-LD via **`serializeJSONLD`** only (no ad-hoc script strings). |
| **Types**              | No `any` on public exports; strict `JSONLDValue` / `JSONLD`; adapter outputs typed against framework types where applicable (e.g. Next `Metadata`).       |
| **Multi-tenant / SSR** | **`createSEOContext`** supported for production paths; **no required global singleton** on Edge or per-request isolated configs documented.               |
| **Runtime**            | Clear matrix: Node vs **Edge** (no `fs` / package.json inference in Edge bundles); behavior documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §10–§13. |
| **Security**           | Untrusted CMS fields never concatenated into HTML; tests for `</script>` / U+2028 edge cases on serialization where applicable.                           |
| **Observability**      | **`validateSEO`** in dev; **`doctor`** CLI for config/adapters; **snapshots** for regressions where meaningful.                                           |
| **Testing**            | **Unit** (core), **adapter goldens** (`SEO` → expected Next metadata), **E2E** on `examples/nextjs-app` for Next-facing changes.                          |
| **Operations**         | CLI **`--no-interactive`**, stable exit codes; **idempotent** `add` / `fix`; **AST-first** detection for inject/scan when claiming high success rates.    |
| **Docs**               | Recipe + copy-paste for Next first; “when to use” + explicit enterprise pattern (`createSEOContext`, explicit adapter id).                                |

---

## 3. Next.js first (P0) — feature set & mapping

These ship and harden **before** other frameworks are considered complete.

| #   | Feature                                  | User-facing surface                                | Primary location                                                                   | Enterprise notes                                                                                                                                                                                                      |
| --- | ---------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | **Voilà: `seo()` → `Metadata`**          | `export const metadata = seo({ title })`           | `@better-seo/next` + core `voila.ts`                                               | Works App Router; document Edge: explicit config + context, no implicit `fs` inference.                                                                                                                               |
| N2  | **`createSEO` / `mergeSEO` + fallbacks** | Imperative API + layout/page composition           | `@better-seo/core` (`core.ts`)                                                     | Golden tests for title template, OG/Twitter fallbacks, canonical + `baseUrl`.                                                                                                                                         |
| N3  | **`toNextMetadata(seo)`**                | `generateMetadata`, root layout                    | `@better-seo/next`                                                                 | Fidelity table vs hand-written `Metadata`: alternates, openGraph, twitter, robots, verification.                                                                                                                      |
| N4  | **JSON-LD in Next output**               | `metadata` / `other` JSON-LD fields                | `@better-seo/next/json-ld` → **`NextJsonLd`** uses **`serializeJSONLD`** from core | Single serializer; Next adapter does not reimplement stringify. App Router: keep static **`Metadata`** free of non-serializable fields — render JSON-LD via **`NextJsonLd`** (see monorepo baseline **Roadmap §11**). |
| N5  | **Layout + page SEO merge**              | Root layout + nested `metadata`                    | App pattern + `mergeSEO` docs/recipes                                              | Document interaction with Next’s **default** metadata behavior so teams don’t double-apply.                                                                                                                           |
| N6  | **`generateMetadata` + async data**      | Dynamic segments                                   | `@better-seo/next` recipes                                                         | Helpers stay sync; adapter documents composing `createSEO` with async `fetch` in Next.                                                                                                                                |
| N7  | **Explicit adapter registration**        | `registerAdapter` / import `@better-seo/next`      | core registry + adapter package                                                    | Enterprise docs: **no reliance** on fragile auto-detect in CI.                                                                                                                                                        |
| N8  | **Request-scoped SEO**                   | `createSEOContext` in server components / handlers | `@better-seo/core` (`context.ts`)                                                  | Required story for multi-tenant + strict isolation; examples under `examples/nextjs-app`.                                                                                                                             |
| N9  | **Rules + pathname**                     | `initSEO`/`context` + `routeContext` from Next     | `rules.ts` + Next recipes                                                          | `getCurrentRouteFromAdapter` lives in docs/adapter: `headers()`, `pathname` from segment props, etc.                                                                                                                  |
| N10 | **E2E golden app**                       | Real HTML head                                     | `examples/nextjs-app` + Playwright                                                 | Assert OG tags, canonical, JSON-LD parseable JSON; run in default CI (PRD Wave 1).                                                                                                                                    |

**Deliverable order:** N1–N4 + N10 gate the rest; N5–N9 are layered immediately after.

---

## 4. Core library (`@better-seo/core`) — features

| ID  | Feature                                                                                                      | Module (target)                                                   | Maps to                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| C1  | **`SEO` type** — meta, OG, Twitter, schema                                                                   | `types.ts`                                                        | All adapters                                                                    |
| C2  | **`createSEO` / `mergeSEO`** + `schemaMerge`                                                                 | `core.ts`                                                         | N2, layout recipes                                                              |
| C3  | **`SEOConfig`** — titleTemplate, baseUrl, defaultRobots, defaults                                            | `types.ts` / `core.ts`                                            | N1–N2                                                                           |
| C4  | **JSON-LD helpers** — WebPage, Article, Product, Organization, Person, BreadcrumbList, FAQPage, CustomSchema | `schema.ts`                                                       | Rich results                                                                    |
| C5  | **Strict `JSONLD` / `JSONLDValue`** (no public `any`)                                                        | `types.ts`                                                        | Enterprise types                                                                |
| C6  | **`serializeJSONLD`** (HTML-safe)                                                                            | `serialize.ts`                                                    | N4, security                                                                    |
| C7  | **`renderTags`** (vanilla / snapshots)                                                                       | `render.ts`                                                       | Tests, non-React                                                                |
| C8  | **`validateSEO`** (dev-only behavior)                                                                        | `validate.ts`                                                     | DX + CI hooks                                                                   |
| C9  | **Adapter registry**                                                                                         | `adapters/registry.ts`                                            | N7                                                                              |
| C10 | **Plugins** — `defineSEOPlugin`, hooks                                                                       | `plugins.ts`                                                      | Tenant policy, normalization                                                    |
| C11 | **Rules engine** — `applyRules`                                                                              | `rules.ts`                                                        | N9                                                                              |
| C12 | **`initSEO` / global config** (Node-oriented)                                                                | `singleton.ts`                                                    | Quick start only; Edge doc warnings                                             |
| C13 | **`createSEOContext`**                                                                                       | `context.ts`                                                      | N8, enterprise default                                                          |
| C14 | **`seo()` / `withSEO` / `useSEO`** (orchestration)                                                           | `voila.ts`                                                        | N1; React hook may delegate to `@better-seo/react` later                        |
| C15 | **`fromNextSeo` / migration helpers**                                                                        | `migrate.ts`                                                      | CLI + docs                                                                      |
| C16 | **`fromContent`** (string → partial SEO, no extra parsers in core)                                           | `compiler.ts` or `content.ts`                                     | Optional; MDX may be separate package (ARCHITECTURE)                            |
| C17 | **`fromMDX`** (frontmatter + body → partial SEO)                                                             | **`@better-seo/compiler`** or optional subpath + peers            | Not in zero-dep core; see [`ARCHITECTURE.md`](./ARCHITECTURE.md) optional split |
| C18 | **`defineSEO`**                                                                                              | Config/build helper (types + defaults for `better-seo.config.ts`) | PRD template examples; may live in core as types-only                           |

### 4.1 Voilà & ergonomic APIs (PRD §4.2)

| ID  | Surface                           | Location                              | Notes                                                                      |
| --- | --------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| V1  | **`seo(input)`**                  | `voila.ts` + Next adapter             | Default quick path                                                         |
| V2  | **`withSEO`**                     | `voila.ts`                            | Next `metadata` export variant                                             |
| V3  | **`useSEO`**                      | `voila.ts` or **`@better-seo/react`** | Client/React path; enterprise: document SSR vs client                      |
| V4  | **`seo.layout()` / `seo.page()`** | `voila.ts` + merge                    | Auto-merge layout vs page semantics                                        |
| V5  | **`seo.route(path, input)`**      | `voila.ts` + rules                    | Explicit route key for rules without adapter magic                         |
| V6  | **`seo.auto()`**                  | `voila.ts`                            | Infer route—**best-effort**; enterprise docs prefer V5 + explicit pathname |

### 4.2 Plugins (extended)

| ID  | Capability                                          | Notes                                                   |
| --- | --------------------------------------------------- | ------------------------------------------------------- |
| P1  | **`defineSEOPlugin`**, `beforeMerge` / `afterMerge` | PRD §3.6                                                |
| P2  | **`onRenderTags`**                                  | Vanilla / extra `<link>`                                |
| P3  | **`extendChannels`**                                | Future meta namespaces (PRD)—track as extension point   |
| P4  | **Packaged plugins `better-seo-plugin-*`**          | Same hook contract; published separately                |
| P5  | **Capability / `features` flags** on config         | Disable JSON-LD, staged rollout (PRD + ARCHITECTURE §9) |

---

## 5. `@better-seo/next` — features (beyond N1–N10)

| ID  | Feature                                                              | Notes                                                |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| NX1 | **App Router** — `metadata` export                                   | Reference implementation                             |
| NX2 | **Pages Router** — documented `Head` / `_document` / `_app` patterns | Same package, separate recipes                       |
| NX3 | **Metadata parity** — link `rel`, hreflang, pagination               | Match PRD `meta` shape                               |
| NX4 | **OG images array → Next `openGraph.images`**                        | Dimensions + alt                                     |
| NX5 | **Twitter card fields**                                              | Fallback from OG                                     |
| NX6 | **Robots & verification**                                            | `robots`, `verification` mapping                     |
| NX7 | **Static vs dynamic routes**                                         | Recipes for `[slug]`, i18n segments when prioritized |

---

## 6. Other adapters (P1–P2) — feature list

| Package                 | Features (mirror contract from ARCHITECTURE §8) | When “enterprise”                                |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **`@better-seo/react`** | `toHelmetProps`, `useSEO` integration           | Peer versions pinned; SSR + hydration documented |
| **`@better-seo/remix`** | `meta` / `links` exports from `SEO`             | Route-based metadata patterns                    |
| **`@better-seo/astro`** | Frontmatter / layout bridge                     | SSG + server islands documented                  |
| **`@better-seo/nuxt`**  | Module + head bridge                            | Nuxt 3 docs + examples                           |

Each adapter: **fixture tests** (`SEO` in → framework output snapshot).

---

## 7. `@better-seo/assets`

| ID  | Feature                                            | Enterprise notes                                                     |
| --- | -------------------------------------------------- | -------------------------------------------------------------------- |
| A1  | **OG image generation** (Satori/templates)         | Reproducible output; template escape hatches                         |
| A2  | **Icon pipeline** (Sharp)                          | Size matrix + **manifest**; CI on Win/Linux if Sharp binaries matter |
| A3  | **`generateManifest`** (PWA `manifest.json`)       | Same package as icons; URL/scope align with `baseUrl`                |
| A4  | **`generateSplash`**                               | iOS/Android splash assets (PRD §3.7)                                 |
| A5  | **Design-system hooks** (Tailwind parse, optional) | Graceful fallback + warnings (PRD)                                   |

---

## 8. `@better-seo/cli`

| ID  | Command / capability                                   | Enterprise notes                                              |
| --- | ------------------------------------------------------ | ------------------------------------------------------------- |
| L1  | **`init`** (+ wizard + `--no-interactive`)             | Deterministic output; framework flag required in CI           |
| L2  | **`og` / `icons` / `splash`**                          | Delegates to assets; same contracts as library                |
| L3  | **`add` / `scan` / `fix`**                             | **AST-first** detection; `--dry-run`, `--safe`, idempotency   |
| L4  | **`analyze`**                                          | Clear report format; exit codes for CI                        |
| L5  | **`snapshot` / `--compare`**                           | Stable JSON schema for diffs in PRs                           |
| L6  | **`preview`**                                          | Local HTML; no production dependency                          |
| L7  | **`migrate`**                                          | Codemods + CHANGELOG linkage                                  |
| L8  | **`doctor`**                                           | Validates config + adapter registration; fails CI on errors   |
| L9  | **Templates** (blog, docs, SaaS, ecommerce, portfolio) | Compose public API only; no core forks                        |
| L10 | **`template switch`**                                  | Non-destructive merge with existing config (PRD §12 CLI)      |
| L11 | **`template preview`**                                 | Show template bundle (rules, schema presets) without applying |

---

## 9. `@better-seo/crawl`

| ID  | Feature                 | Enterprise notes                                            |
| --- | ----------------------- | ----------------------------------------------------------- |
| W1  | **robots.txt**          | Driven from same `baseUrl` / policies as `SEO` config       |
| W2  | **sitemap.xml**         | URLs align with canonicals; optional `lastmod` / alternates |
| W3  | **RSS / Atom**          | Same titles/descriptions as metadata                        |
| W4  | **llms.txt** (optional) | Static generator; documented scope                          |

---

## 10. Docs, examples, and “product features”

Docs are a **delivery surface** (PRD §8.6).

| ID  | Feature                                          | Location                 |
| --- | ------------------------------------------------ | ------------------------ |
| D1  | **60s quick start** (Next-first)                 | `docs/getting-started`   |
| D2  | **Core concepts** (3 channels, pipeline diagram) | `docs/concepts`          |
| D3  | **API reference**                                | `docs/api`               |
| D4  | **Recipes** (blog PDP, product, i18n, schema)    | `docs/recipes`           |
| D5  | **CLI reference**                                | `docs/cli`               |
| D6  | **Compare** (e.g. vs next-seo)                   | `docs/compare`           |
| D7  | **Examples**                                     | `examples/nextjs-app`, … |
| D8  | **Playground** (nice later)                      | Web or docs embed        |

---

## 11. Consolidated traceability (Next → core → optional)

```txt
Next app
  → @better-seo/next (toNextMetadata, seo() wiring)
       → @better-seo/core (createSEO, mergeSEO, serializeJSONLD, rules, plugins)
  → optional: @better-seo/cli (workflow)
  → optional: @better-seo/assets (OG/icons)
  → optional: @better-seo/crawl (sitemap/robots/RSS)
```

---

## 12. Anti-patterns (“MVP that pretends to be enterprise”)

Avoid shipping:

| Smell                                    | Fix                                                             |
| ---------------------------------------- | --------------------------------------------------------------- |
| JSON-LD built with string concat         | Use **`serializeJSONLD`** only                                  |
| Only global `initSEO` documented         | Document **`createSEOContext`** as production default for teams |
| Auto-detect framework in CI              | **Explicit adapter** + `doctor`                                 |
| `scan`/`add` via `includes('seo(')` only | **AST** + documented heuristic fallback                         |
| No E2E on Next                           | **`examples/nextjs-app`** in CI                                 |
| MDX in core with heavy deps              | **Optional** `@better-seo/compiler` (per ARCHITECTURE)          |

---

## 14. References

- **Waves, sequencing, ID → wave matrix:** [`Roadmap.md`](./Roadmap.md)
- **Waves (narrative + exit criteria):** [`PRD.md`](./PRD.md) §5
- **Dependency boundaries & testing:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) §3, §14–§16
- **Adoption & docs strategy:** [`PRD.md`](./PRD.md) §2.6, §8.6
